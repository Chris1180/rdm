import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { PageRule, Rule } from 'src/app/model/rule';
import { EventRuleService } from 'src/app/shared/event.rule.service';
import { RulesService } from 'src/app/shared/rules.service';
import { ActionEvent, AppDataState, RuleActionTypes, RuleStateEnum } from 'src/app/shared/rules.state';

declare var window: any;

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  rules!: Array<Rule>; // copie locale des règles pour l'affichage (par 10 si pageSize inchangé)
  rulesDataState$!: Observable<AppDataState<Rule[]>>;
  readonly RuleStateEnum=RuleStateEnum;
  parts!: Array<string>;
  labels!: Array<string>;
  positions!: Array<string>;

  errorMessage!: string;
  filterFormGroup!: FormGroup;
  // pour la pagination
  currentPage: number = 0;
  pageSize: number = 10; // nombre d'éléments affiché par page
  totalPages: number = 0;
  totalResults: number = 0;
  filterActive: boolean = false; // pour savoir si un filtre est actif ou pas

  // Variables pour le message de confirmation lors d'une modification 
  userFeedBackToast: any;
  userFeedBackMessage!: string;
  userFeedBackStyle!: string;

  constructor(private ruleService: RulesService, private router: Router, private eventRuleService: EventRuleService) { }

  ngOnInit(): void {
    //console.clear();

    this.userFeedBackToast = new window.bootstrap.Toast(document.getElementById('userFeedBack'));
    
    // exp
    this.eventRuleService.sourceEventSubjectObservable.subscribe((actionEvent: ActionEvent)=>{
      switch (actionEvent.type) {
        case RuleActionTypes.EDIT_RULE: 
          this.ruleService.modifyRule(actionEvent.payload);
          break;
      }
    })

    if (this.ruleService.filters) {
      this.currentPage = this.ruleService.pageToDisplay;
      this.filterFormGroup = this.ruleService.filters;
      this.filterActive = true;
      //this.onFilterChange(this.currentPage);
    }else{
      this.filterFormGroup = new FormGroup({
        part: new FormControl("allPart"), //valeur par defaut
        label: new FormControl("allLabel"),
        position: new FormControl("allPosition"),
        condition: new FormControl(""),
        command: new FormControl("")
      });
    }
    
    /*
      this.filterFormGroup = new FormGroup({
      part: new FormControl("allPart"), //valeur par defaut
      label: new FormControl("allLabel"),
      position: new FormControl("allPosition"),
      condition: new FormControl(""),
      command: new FormControl("")
      });
    */
    this.rulesDataState$ = this.ruleService.getRulesFromDB().pipe(
      map(data=>{
        this.ruleService.setRules(data);
        if (this.filterActive) {
          this.onFilterChange(this.currentPage);
        }else{
          this.displayRules();
        }
        return ({dataState:RuleStateEnum.LOADED,data:data}) // lorsque des données sont reçues on retourne les data et le state
      }),
      startWith({dataState:RuleStateEnum.LOADING}),  // startWith est retourné dès que le pipe est executé
      catchError(err=>of({dataState:RuleStateEnum.ERROR, errorMessage:err.message}))
    )



    // fin exp
    
  }

  displayRules() {
    this.getPageRules();
    // récupère toutes les valeurs dans le filtre
    this.parts = this.ruleService.getPartUniqueValues();
    this.labels = this.ruleService.getLabelUniqueValues();
    this.positions = this.ruleService.getPositionUniqueValues();
  }

  getPageRules() {
    this.ruleService.getPageRules(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.rules = data.rules;
        this.totalPages = data.totalPages;
        this.totalResults = data.totalResults;
      },
      error: (err) => {
        this.errorMessage = err;
      }
    })
  }

  resetfilters() {
    this.filterFormGroup.get('part')?.setValue('allPart');
    this.filterFormGroup.get('label')?.setValue('allLabel');
    this.filterFormGroup.get('position')?.setValue('allPosition');
    this.filterFormGroup.get('condition')?.setValue('');
    this.filterFormGroup.get('command')?.setValue('');
    this.filterActive = false;
    this.onFilterChange(0);
  }

  deleteRule(r: Rule) {
    let conf = confirm("Are you sure?");
    if (conf == false) return;
    
    this.ruleService.deleteRule(r.id).subscribe({
      next: () => {},
      error: (err) => {
        this.errorMessage = err;
      },
      complete: () => {
        let index = this.rules.indexOf(r);
        this.rules.splice(index, 1); // ici on supprime l'element dans la copie locale pour le composant
        let ind = this.rules.indexOf(r);
        this.rules.splice(ind, 1);
        // on remet en forme la pagination
        this.getPageRules(); 
        if (this.totalPages==this.currentPage){
          this.currentPage--;
          this.getPageRules();
        }
        if (this.totalPages == 0){
          this.errorMessage = "No result to display"
        }
      }
    });
  }

  onFilterChange(page: number = 0) { 
    if (!this.filterFormGroup) {
      this.filterFormGroup = new FormGroup({
        part: new FormControl("allPart"), //valeur par defaut
        label: new FormControl("allLabel"),
        position: new FormControl("allPosition"),
        condition: new FormControl(""),
        command: new FormControl("")
      });            
    }
    if( this.filterFormGroup.get('part')?.value=="allPart" && 
        this.filterFormGroup.get('label')?.value == "allLabel" && 
        this.filterFormGroup.get('position')?.value == "allPosition" && 
        this.filterFormGroup.get('condition')?.value == "" && 
        this.filterFormGroup.get('command')?.value == ""){
          this.filterActive = false
        }else {
          this.filterActive = true;
        }
    this.ruleService.rulesFiltered(this.filterFormGroup.get('part')?.value, this.filterFormGroup.get('label')?.value, this.filterFormGroup.get('position')?.value, this.filterFormGroup.get('condition')?.value, this.filterFormGroup.get('command')?.value, page, this.pageSize).subscribe({
      next: (data) => {
        this.rules = data.rules;
        this.currentPage = page;
        this.totalPages = data.totalPages;
          this.totalResults = data.totalResults;
          if (this.totalPages == 0) {
            this.errorMessage = "No Result Found"
          }
          
        },
        error: (err) => {
          this.errorMessage = err;
        },
      complete: () => {
        // met à jour les filtres en fonction de la selection
        this.parts = this.ruleService.getPartUniqueValues();
        this.labels = this.ruleService.getLabelUniqueValues();
        this.positions = this.ruleService.getPositionUniqueValues();
        //console.log(this.rules)
      }
    })      
    

  }
  editRule(r: Rule) {
    this.ruleService.setRuleToBeEdited(r);
    this.ruleService.pageToDisplay = this.currentPage;
    this.ruleService.filters = this.filterFormGroup;
    this.router.navigate(['/Edition']);
  }

  addNewRule() {
    this.ruleService.setRuleToBeEdited({id: 0, order: 1, part: '', label: '', condition: '', command: '', mandatory: true, initialValue: '', outputValue: '', example: '',
    position: '', format: '', comment: '', application: ''})
    this.router.navigate(['/Edition']);
  }

  preview() {
    this.router.navigate(['/Preview'])
  }

  editRuleOnline(r: any, newValue: string, field: any){
    //console.log(field)
    if(r[field]!=newValue){
      r[field] = newValue;
      this.ruleService.modifyRule(r).subscribe({
        next : (data)=>{// affichage sous forme de modal que tout c'est bien passé
          this.openFeedBackUser("Change saved Succesfully", "bg-success");
          //console.log(data)
        },
        error: (err) => {
          this.openFeedBackUser("Error during saving process in Back-End", "bg-danger")
          console.error("Une erreur est remontée lors de la mise à jour d'une règle");
        },
        complete: ()=>{
        }
      })
    }else{
      console.log("pas de changement détecté")
    }
    
  }
  
  

  openFeedBackUser(message: string, style: string) {
    this.userFeedBackMessage = message;
    this.userFeedBackStyle = style;
    this.userFeedBackToast.show() ;
  }
  closeFeedBackUser(){
    this.userFeedBackToast.hide();
  }
}
