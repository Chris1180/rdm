import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { NewRule } from "../model/newrule";
import { PageRules } from "../model/pageRules";
import { RuleCondition } from "../model/rulecondition";
import { RuleCommand } from "../model/rulecommand";

@Injectable({
  providedIn: 'root'
})

export class NewRulesService {
  private apiUrl = '';
  private rules!: Array<NewRule>;
  private ruleToBeEdited!: NewRule;
  public pageToDisplay!: number;
  private parts! : Array<string>;
  private labels! : Array<string>;
  public filters!:any;
  //private conditions! : Array<string>;
  //private commands! : Array<string>;



  constructor(private http: HttpClient) {
    // permet d'adapter l'adresse en fonction de l'environnement
    if (window.location.port == '4200') {
      this.apiUrl = `http://${window.location.hostname}:8080/`
    }
    this.initRuleToBeEdited();
  }

  // operations in DB
  public getRulesFromDB(): Observable<NewRule[]> {
    return this.http.get<NewRule[]>(this.apiUrl + 'getAllRules');
  }
  public saveRuleinDB(rule: NewRule): Observable<NewRule> {
    return this.http.post<NewRule>(this.apiUrl + 'saveRule', rule)
  }
  public getSubConditionsFromDB(idRulePreCondition: number) : Observable<RuleCondition[]> {
    return this.http.get<RuleCondition[]>(this.apiUrl + 'getSubConditions/'+idRulePreCondition)
  }
  public saveSubConditionsinDB(subconditions: RuleCondition[]) : Observable<RuleCondition[]>{
    return this.http.post<RuleCondition[]>(this.apiUrl + 'saveSubConditionsinDB', subconditions)
  }


  // in local
  public setRuleToBeEdited(r: NewRule) {
    this.ruleToBeEdited = r;
  }
  public getRuleToBeEdited(): NewRule {
    return this.ruleToBeEdited;
  }
  public initRuleToBeEdited(){
    this.setRuleToBeEdited({
      id: -1, 
      order: 1, 
      part: '', 
      label: '',
      ruleCondition: {"id" :-1 , "idPreCondition": 0, "textCondition": '', "ruleCommand": [{"id":0, "lang": 'EN', "command":''}]},
      comment: '',
      nestedCondition: false,
      finalCondition: '',
      outputValue : '',
      style: {"id":0, "name": 'default', "margintop": 0, "marginleft": 0, "relatif": false, "font": 'TimesNewRoman', "size": 16, "bold": false, "italic": false}}); 
  }

  // pagination
  public getPageRules(page: number, size: number) : Observable<PageRules>{
    
    let totalPages = ~~(this.rules.length / size); // ~~ garde la partie entière de la division
    if (this.rules.length % size) {
      totalPages++;
    }
    let index = page*size;
    let rules = this.rules.slice(index, index+size);
    let totalResults = this.rules.length;
    let pageRules: PageRules = {rules: rules, page: page, size: size, totalPages: totalPages, totalResults: totalResults}
    
    return of(pageRules)
  }

  public rulesFiltered(partFilter: string, labelFilter: string, condition:string, command:string, page: number, size: number) : Observable<PageRules>{

    let rulesFiltered: Array<NewRule> = this.rules;
    if(partFilter!="allPart"){
      rulesFiltered = rulesFiltered.filter(r=>r.part.includes(partFilter));
    }
    if(labelFilter!="allLabel"){
      rulesFiltered = rulesFiltered.filter(r=>r.label.includes(labelFilter));
    }
    if(condition!=""){
      rulesFiltered = rulesFiltered.filter(r=>r.ruleCondition.textCondition.toLocaleUpperCase().includes(condition.toLocaleUpperCase()));
    }
    if(command!=""){
      //console.log(command)
      //rulesFiltered = rulesFiltered.filter(r=>r.command.toLocaleUpperCase().includes(command.toLocaleUpperCase()));
    }
    let totalPages = ~~(rulesFiltered.length / size); // ~~ garde la partie entière de la division
    if (rulesFiltered.length % size) {
      totalPages++;
    }
    let index = page*size;
    let totalResults = rulesFiltered.length;
    let rules = rulesFiltered.slice(index, index+size);
    let pageRules: PageRules = {rules: rules, page: page, size: size, totalPages: totalPages, totalResults: totalResults}
    this.setRulesUniqueValuesPerCategory(rulesFiltered);
    return of(pageRules);
  }

  public deleteRule(ruleToDelete : NewRule) : Observable<any>{
    return this.http.post(this.apiUrl+'deleteRule', ruleToDelete);
  }

  public getAllRules() : Array<NewRule> {
    return this.rules;
  }
  public setAllRules(allRules : NewRule[]){
    this.rules = allRules;
    this.setRulesUniqueValuesPerCategory(allRules);
  }

  // pour les valeurs du filtre à l'initialization
  public setRulesUniqueValuesPerCategory(rules: NewRule[]) {
    if(rules){
      this.parts = [...new Set(rules.map(item => item.part))];
      this.labels = [...new Set(rules.map(item => item.label))];
      }  
  }

  // getter unique values of each rule category
  public getPartUniqueValues() : Array<string>{
    return this.parts;
  }
  public getLabelUniqueValues() : Array<string>{
    return this.labels;
  }
}