import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { NewRule } from 'src/app/model/newrule';
import { RuleCondition } from 'src/app/model/rulecondition';
import { NewRulesService } from 'src/app/shared/newrules.service';
import { OrderCustomSortService } from 'src/app/shared/orderCustomSort.service';
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
  filterFormGroup!: FormGroup;
  parts!: Array<string>; // utilisé pour afficher les valeurs des filtres
  labels!: Array<string>;

  constructor(private newRulesService: NewRulesService, private router: Router, private orderCustomSortService: OrderCustomSortService){}

  ngOnInit(): void {

    this.getAllRules();
    this.getAllSubConditions();

    this.userFeedBackToast = new window.bootstrap.Toast(document.getElementById('userFeedBack'));
    
    // récupération des filtres du service si existants
    if (this.newRulesService.filters) {
      this.currentPage = this.newRulesService.pageToDisplay;
      this.filterFormGroup = this.newRulesService.filters;
      this.filterActive = true;
      //this.onFilterChange(this.currentPage);
    }else{
      this.filterFormGroup = new FormGroup({
        part: new FormControl("allPart"), //valeur par defaut
        label: new FormControl("allLabel"),
        condition: new FormControl(""),
        command: new FormControl("")
      });
    } 

  }// fin du ng-oninit

  getAllRules(){
    this.rulesDataState$ = this.newRulesService.getRulesFromDB().pipe(
      map(data=>{
        // Classement des règles selon l'orde suivant 1a,1b,2,2a,10...
        this.newRulesService.setAllRules(this.orderCustomSortService.customSortRules(data));
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
  getAllSubConditions(){
    this.newRulesService.getAllSubConditionsFromDB().subscribe({
      next: (data) => {
        this.newRulesService.setAllSubConditions(data);
      },
      error: (err) => {
        this.errorMessage = err;
      }
    })
  }

  displayRules() {
    this.getPageRules();
    // récupère la liste des valeurs pour les filtres
    this.parts = this.newRulesService.getPartUniqueValues();
    this.labels = this.newRulesService.getLabelUniqueValues();
  }

  editRule(r: NewRule) {
    this.newRulesService.setRuleToBeEdited(r);
    this.newRulesService.pageToDisplay = this.currentPage;
    //this.ruleService.filters = this.filterFormGroup;
    this.router.navigate(['/EditRule']);
  }

  addNewRule() {
    this.newRulesService.setRuleToBeEdited({
      id: 0, 
      order: "1", 
      part: '', 
      label: '',
      ruleCondition: {"id" :0 , "idPreCondition": 0, "textCondition": '', "ruleCommand": [{"id":0, "lang": 'EN', "command":''}]},
      comment: '',
      nestedCondition: false,
      finalCondition: '',
      outputValue : '',
      style: {"id":0, "name": 'default', "margintop": 0, "marginleft": 0, "relatif": false, "font": 'TimesNewRoman', "size": 16, "bold": false, "italic": false}})
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
    
    if (!this.filterFormGroup) {
      this.filterFormGroup = new FormGroup({
        part: new FormControl("allPart"), //valeur par defaut
        label: new FormControl("allLabel"),
        condition: new FormControl(""),
        command: new FormControl("")
      });            
    }
    if(this.filterFormGroup.get('part')?.value=="allPart" && 
       this.filterFormGroup.get('label')?.value == "allLabel" && 
       this.filterFormGroup.get('condition')?.value == "" && 
       this.filterFormGroup.get('command')?.value == ""){
          this.filterActive = false
    }else {
          this.filterActive = true;
    }


    this.newRulesService.rulesFiltered(this.filterFormGroup.get('part')?.value, this.filterFormGroup.get('label')?.value, this.filterFormGroup.get('condition')?.value, this.filterFormGroup.get('command')?.value, page, this.pageSize).subscribe({
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
        //this.parts = this.newRulesService.getPartUniqueValues();
        this.labels = this.newRulesService.getLabelUniqueValues();
        
      }
    })      
    

  }

  getPageRules() {
    // pour revenir à la même page  
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
    comment: r.comment, nestedCondition: false, finalCondition: '',outputValue : '',style: r.style})
    this.router.navigate(['/EditRule']);
  }

  deleteRule(r: NewRule) {
    let conf = confirm("Are you sure?");
    if (conf == false) return;

    this.newRulesService.deleteRule(r).subscribe({
      next: () => {
        // Si tout s'est bien passé en Back End alors on met à jour la liste des règles dans le service
        let allRules :NewRule[] = this.newRulesService.getAllRules();
        // filter parcours le tableau et pour chaque rule on garde que les rules qui sont différentes de id
        allRules = this.newRulesService.getAllRules().filter(rule=>rule.id!=r.id);
        this.newRulesService.setAllRules(allRules);
        this.openFeedBackUser("Rule number: "+r.id+" deleted succesfully", "bg-success");
        console.log('Rule numéro : '+r.id+' supprimée');
      },
      error: (err) => {
        this.openFeedBackUser("Error during deletion process in Back-End", "bg-danger")
      },
      complete: () => {
        // ici on rafraichi la liste de la copie locale des rules 
        let index = this.rules.indexOf(r);
        this.rules.splice(index, 1); // ici on supprime l'element dans la copie locale pour le composant
    
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
    })
  }

  resetfilters() {
    this.filterFormGroup.get('part')?.setValue('allPart');
    this.filterFormGroup.get('label')?.setValue('allLabel');
    this.filterFormGroup.get('condition')?.setValue('');
    this.filterFormGroup.get('command')?.setValue('');
    this.filterActive = false;
    this.onFilterChange(0);
  }

  findDetails(ruleConditionId: number): RuleCondition[] {
    return this.newRulesService.getAllSubConditions().filter(rc => {
      // on selectionne la version de la commande en Anglais seulement
      let ruleCommandEN = rc.ruleCommand.find(command => command.lang=='EN')
      rc.ruleCommand = []
      if (ruleCommandEN){
        rc.ruleCommand.push(ruleCommandEN)
      }else{
        rc.ruleCommand.push({"id": 0 , "lang" : '' , "command" : 'No EN command found'})
      }
      return rc.idPreCondition === ruleConditionId});
  }

  exportRules() {
    this.newRulesService.exportRules().subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'RDM_rules_export.xlsx';
      a.click();
      URL.revokeObjectURL(objectUrl);
    }, error => {
      console.error('Erreur lors de l\'export Excel', error);
    });
  }

}
