import { Injectable, OnInit } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { PageRule, Rule } from '../model/rule';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventRuleService } from './event.rule.service';
import { Lang } from '../model/lang';

@Injectable({
  providedIn: 'root'
})

export class RulesService {

  private apiUrl = '';
  private rules!: Array<Rule>;
  private ruleToBeEdited!: Rule;
  private parts! : Array<string>;
  private labels! : Array<string>;
  private conditions! : Array<string>;
  private commands! : Array<string>;
  private positions! : Array<string>;
  private formats! : Array<string>;

  public filters!:any;
  public pageToDisplay!: number;
  

  constructor(private http: HttpClient, private eventRuleService: EventRuleService) {
  
    // permet d'adapter l'adresse en fonction de l'environnement
    if (window.location.port == '4200'){
      this.apiUrl = `http://${window.location.hostname}:8080/`
    }
    this.setRuleToBeEdited({id: -1, order: 1,part: '', label: '', condition: '', command: '', mandatory: true, initialValue: '',outputValue: '', example: '',
             position: '', format: '', comment: '', application: '', languages: []});
    
  }

  public getRulesFromDB() : Observable<Rule[]>{
    return this.http.get<Rule[]>(this.apiUrl+'rules');
  }
 
  public getAllRules() : Array<Rule>{
    return this.rules;
  }

  public setRules(rules: Rule[]){
    this.rules = rules;
    this.setRulesUniqueValuesPerCategory(rules);
  }
 
  public getRules(){
    if (this.rules != undefined) return true;
    return false; 
  }

  public getPageRules(page: number, size: number) : Observable<PageRule>{
    
    let totalPages = ~~(this.rules.length / size); // ~~ garde la partie entière de la division
    if (this.rules.length % size) {
      totalPages++;
    }
    let index = page*size;
    let rules = this.rules.slice(index, index+size);
    let totalResults = this.rules.length;
    let pageRules: PageRule = {rules: rules, page: page, size: size, totalPages: totalPages, totalResults: totalResults}
    
    return of(pageRules)
  }

  public deleteRule(idRule : number) : Observable<any>{
   return this.http.post(this.apiUrl+'delete', idRule);
  }

  public modifyRule(rule : Rule) : Observable<string>{
    let index = this.rules.indexOf(rule);
    // on teste si c'est une modification ou une nouvelle règle
    if (index !== -1) {
      // mise à jour en back-end d'une règle existante
      this.http.post(this.apiUrl+'update', rule).subscribe(
        {
          next : ()=>{
            // mise à jour du tableau des rules
            this.rules[index] = rule;
            console.log('Modif règle existante effectuée id='+rule.id);
            return of("ok")
          },
          error: (err) => {
            console.error("Une erreur est remontée lors d'une mise à jour");
            return of(err);
          },
          complete: ()=>{
            
          }
          
        })
    } else {
      // création d'une nouvelle règle
      this.http.post<Rule>(this.apiUrl+'update', rule).subscribe(
        {
          next : (data)=>{
            // lors de la création d'une nouvelle règle il faut récupérer l'id de la BDD
            rule = data;
          },
          error: (err) => {
            console.error("Une erreur est remontée lors de la création d'une nouvelle règle");
            return of(false);
          },
          complete: ()=>{
            // ajout d'une nouvelle règle
            this.rules.push(rule);
            console.log('Ajout d\'une règle effectuée id='+rule.id);
          }
        })
    }
    return of('loading');
    
  }

  
  public saveRule(rule: Rule):Observable<Rule>{
    return this.http.post<Rule>(this.apiUrl+'update', rule);
  }

  public saveLinguisticVersion(lang: any):Observable<any>{
    return this.http.post(this.apiUrl+'updateLang', lang);
  }

  public addRuleToService(rule: Rule){
    const index = this.rules.map(r => r.id).indexOf(rule.id);
    this.rules[index] = rule;
  }

  public rulesFiltered(partFilter: string, labelFilter: string, positionFilter: string, condition:string, command:string, page: number, size: number) : Observable<PageRule>{
    //console.log(this.rules)
    // classement de l'ordre des règles en fonction du champ order:
    //this.rules.sort((a,b) => a.order - b.order);
    //console.log(this.rules)
    
    
    let rulesFiltered: Array<Rule> = this.rules;
    if(partFilter!="allPart"){
      rulesFiltered = rulesFiltered.filter(r=>r.part.includes(partFilter));
    }
    if(labelFilter!="allLabel"){
      rulesFiltered = rulesFiltered.filter(r=>r.label.includes(labelFilter));
    }
    if(positionFilter!="allPosition"){
      rulesFiltered = rulesFiltered.filter(r=>r.position.includes(positionFilter));
    }
    if(condition!=""){
      //console.log(condition)
      rulesFiltered = rulesFiltered.filter(r=>r.condition.toLocaleUpperCase().includes(condition.toLocaleUpperCase()));
    }
    if(command!=""){
      console.log(command)
      rulesFiltered = rulesFiltered.filter(r=>r.command.toLocaleUpperCase().includes(command.toLocaleUpperCase()));
    }
    let totalPages = ~~(rulesFiltered.length / size); // ~~ garde la partie entière de la division
    if (rulesFiltered.length % size) {
      totalPages++;
    }
    let index = page*size;
    let totalResults = rulesFiltered.length;
    let rules = rulesFiltered.slice(index, index+size);
    let pageRules: PageRule = {rules: rules, page: page, size: size, totalPages: totalPages, totalResults: totalResults}
    this.setRulesUniqueValuesPerCategory(rulesFiltered);
    return of(pageRules);
  }

  public setRuleToBeEdited(r: Rule){
    this.ruleToBeEdited = r;
  }
  public getRuleToBeEdited() : Rule {
    return this.ruleToBeEdited;
  }

  // pour les valeurs du filtre à l'initialization
  public setRulesUniqueValuesPerCategory(rules: Rule[]) {
    if(rules){
      this.parts = [...new Set(rules.map(item => item.part))];
      this.labels = [...new Set(rules.map(item => item.label))];
      this.conditions = [...new Set(rules.map(item => item.condition))];
      this.positions = [...new Set(rules.map(item => item.position))];
      this.formats = [...new Set(rules.map(item => item.format))];
    }  
  }

  // getter unique values of each rule category
  public getPartUniqueValues() : Array<string>{
    return this.parts;
  }
  public getLabelUniqueValues() : Array<string>{
    return this.labels;
  }
  public getConditionUniqueValues() : Array<string>{
    return this.conditions;
  }
  public getCommandUniqueValues() : Array<string>{
    return this.commands;
  }
  public getPositionUniqueValues() : Array<string>{
    return this.positions;
  }
  public getFormatUniqueValues() : Array<string>{
    return this.formats;
  }

}



