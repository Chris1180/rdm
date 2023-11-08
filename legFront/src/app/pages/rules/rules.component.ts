import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { NewRule } from 'src/app/model/newrule';
import { NewRulesService } from 'src/app/shared/newrules.service';
import { AppDataState, RuleStateEnum } from 'src/app/shared/rules.state';

declare var window: any;

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {
  rules!: Array<NewRule>; // copie locale des règles pour l'affichage (par 10 si pageSize inchangé)
  rulesDataState$!: Observable<AppDataState<NewRule[]>>;
  readonly RuleStateEnum=RuleStateEnum;

  // Variables pour le message de confirmation lors d'une modification 
  userFeedBackToast: any;
  userFeedBackMessage!: string;
  userFeedBackStyle!: string;

  // pour la pagination
  currentPage: number = 0;
  pageSize: number = 10; // nombre d'éléments affiché par page
  totalPages: number = 0;
  totalResults: number = 0;
  filterActive: boolean = false; // pour savoir si un filtre est actif ou pas

  errorMessage!: string;

  constructor(private newRulesService: NewRulesService, private router: Router){}

  ngOnInit(): void {
    let ruleToBeEdited : NewRule = this.newRulesService.getRuleToBeEdited();
    console.log('dans la page rules')
    console.log(ruleToBeEdited)
    // si l'index n'est pas -1 alors il s'agit d'une modif
    if (ruleToBeEdited.id!=-1){
      this.newRulesService.saveRuleinDB(ruleToBeEdited).subscribe({
        next : (data)=>{// affichage sous forme de modal que tout c'est bien passé
          this.openFeedBackUser("Rule changes saved Succesfully", "bg-success");
          console.log('retour de la DB')
          console.log(data)
          ruleToBeEdited.id = data.id; // on récupère l'id au cas où il s'agit d'un nouvel enregistrement
        },
        error: (err) => {
          this.openFeedBackUser("Error during saving process in Back-End", "bg-danger")
          console.error("Une erreur est remontée lors de la mise à jour d'une règle");
        },
        complete: ()=>{
          this.getAllRules();
        }
      })

    }else { // pas de modif de règle
      this.getAllRules();
    }
    this.userFeedBackToast = new window.bootstrap.Toast(document.getElementById('userFeedBack'));
    
  }

  getAllRules(){
    this.rulesDataState$ = this.newRulesService.getRulesFromDB().pipe(
      map(data=>{
        this.newRulesService.setRules(data);
        this.displayRules();
        /*
        if (this.filterActive) {
          this.onFilterChange(this.currentPage);
        }else{
          this.displayRules();
        }*/
        return ({dataState:RuleStateEnum.LOADED,data:data}) // lorsque des données sont reçues on retourne les data et le state
      }),
      startWith({dataState:RuleStateEnum.LOADING}),  // startWith est retourné dès que le pipe est executé
      catchError(err=>of({dataState:RuleStateEnum.ERROR, errorMessage:err.message}))
    )
    this.rulesDataState$.subscribe();
  }

  displayRules() {
    this.getPageRules();
    // récupère toutes les valeurs dans le filtre
    /*this.parts = this.ruleService.getPartUniqueValues();
    this.labels = this.ruleService.getLabelUniqueValues();
    this.positions = this.ruleService.getPositionUniqueValues();
    */
  }

  editRule(r: NewRule) {
    this.newRulesService.setRuleToBeEdited(r);
    this.newRulesService.pageToDisplay = this.currentPage;
    //this.ruleService.filters = this.filterFormGroup;
    this.router.navigate(['/EditRule']);
  }

  openFeedBackUser(message: string, style: string) {
    this.userFeedBackMessage = message;
    this.userFeedBackStyle = style;
    this.userFeedBackToast.show() ;
  }
  closeFeedBackUser(){
    this.userFeedBackToast.hide();
  }

  onFilterChange(page: number = 0) { 
    /*
    if (!this.filterFormGroup) {
      this.filterFormGroup = new UntypedFormGroup({
        part: new UntypedFormControl("allPart"), //valeur par defaut
        label: new UntypedFormControl("allLabel"),
        position: new UntypedFormControl("allPosition"),
        condition: new UntypedFormControl(""),
        command: new UntypedFormControl("")
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
        }*/
    this.newRulesService.rulesFiltered("this.filterFormGroup.get('part')?.value", "this.filterFormGroup.get('label')?.value", "this.filterFormGroup.get('condition')?.value", "this.filterFormGroup.get('command')?.value", page, this.pageSize).subscribe({
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
        //this.parts = this.ruleService.getPartUniqueValues();
        //this.labels = this.ruleService.getLabelUniqueValues();
        //this.positions = this.ruleService.getPositionUniqueValues();
        //console.log(this.rules)
      }
    })      
    

  }

  getPageRules() {
    if (this.newRulesService.pageToDisplay) this.currentPage = this.newRulesService.pageToDisplay;
    
    this.newRulesService.getPageRules(this.currentPage, this.pageSize).subscribe({
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

  duplicateRule(r: NewRule){
    this.newRulesService.setRuleToBeEdited({id: 0, order: r.order, part: r.part, label: r.label, ruleCondition: r.ruleCondition, 
    comment: r.comment, style: r.style})
    this.router.navigate(['/EditRule']);
  }

}
