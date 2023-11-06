import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { NewRule } from 'src/app/model/newrule';
import { NewRulesService } from 'src/app/shared/newrules.service';
import { AppDataState, RuleStateEnum } from 'src/app/shared/rules.state';

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
    this.getAllRules()
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
}
