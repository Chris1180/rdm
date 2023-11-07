import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { NewRule } from "../model/newrule";

@Injectable({
  providedIn: 'root'
})

export class NewRulesService {
  private apiUrl = '';
  private rules!: Array<NewRule>;
  private ruleToBeEdited!: NewRule;



  constructor(private http: HttpClient) {
    // permet d'adapter l'adresse en fonction de l'environnement
    if (window.location.port == '4200') {
      this.apiUrl = `http://${window.location.hostname}:8080/`
    }
    this.setRuleToBeEdited({id: -1, order: 1,part: '', label: '', comment: '', ruleCondition : {id: 0, idSubCondition: 0, textCondition: '', ruleCommand: []}});
  }

  // operations in DB
  public getRulesFromDB(): Observable<NewRule[]> {
    return this.http.get<NewRule[]>(this.apiUrl + 'getAllRules');
  }
  public saveRuleinDB(rule: NewRule): Observable<NewRule> {
    return this.http.post<NewRule>(this.apiUrl + 'saveRule', rule)
  }

  // in local
  public setRules(rules: NewRule[]) {
    this.rules = rules;
  }
  public setRuleToBeEdited(r: NewRule) {
    this.ruleToBeEdited = r;
  }
  public getRuleToBeEdited(): NewRule {
    return this.ruleToBeEdited;
  }
}