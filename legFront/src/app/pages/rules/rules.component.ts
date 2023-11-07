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
        this.rules = data;
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

  editRule(r: NewRule) {
    this.newRulesService.setRuleToBeEdited(r);
    //this.ruleService.pageToDisplay = this.currentPage;
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
}
