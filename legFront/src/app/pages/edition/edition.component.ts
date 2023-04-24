import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Language } from 'src/app/model/inputParameters/language';
import { Lang } from 'src/app/model/lang';
import { Rule } from 'src/app/model/rule';
import { EventRuleService } from 'src/app/shared/event.rule.service';
import { RulesService } from 'src/app/shared/rules.service';
import { RuleActionTypes } from 'src/app/shared/rules.state';

@Component({
  selector: 'app-edition',
  templateUrl: './edition.component.html',
  styleUrls: ['./edition.component.css']
})
export class EditionComponent implements OnInit {
  ruleForm! : FormGroup;
  rule! :Rule;
  languages! : Lang[];
  errorMessage! : string;


  language = Language;

  // variable pour stocker les valeurs uniques par champ
  parts! : Array<string>;
  labels! : Array<string>;
  conditions! : Array<string>;
  commands! : Array<string>;
  positions! : Array<string>;
  formats! : Array<string>;
  
  constructor(private ruleService : RulesService, private router: Router, private eventRuleService: EventRuleService) { }

  ngOnInit(): void {
    // On met les info de la Rule à modifier dans des variables locales
    this.rule = this.ruleService.getRuleToBeEdited();
    this.languages = this.rule.languages; 

    this.ruleForm = new FormGroup({
      id : new FormControl(this.rule.id),
      order : new FormControl(this.rule.order),
      part : new FormControl(this.rule.part),
      label : new FormControl(this.rule.label),
      condition : new FormControl(this.rule.condition),
      command : new FormControl(this.rule.command),
      mandatory : new FormControl(this.rule.mandatory),
      languages : new FormControl('EN'),
      initialValue : new FormControl(this.rule.initialValue),
      position : new FormControl(this.rule.position),
      format : new FormControl(this.rule.format),
      comment : new FormControl(this.rule.comment),
      application : new FormControl(this.rule.application),
      example : new FormControl(this.rule.example)
    });
    
    // Par défaut l'initial value de la règle correspond à la langue EN
    // mais si c'est une règle multi langue sans valeur par defaut pour l'EN alors on affiche la première version linguistique
    if (this.rule.languages.length>0 && this.rule.initialValue=='') {
      //console.log("multi langue rule"); 
      this.ruleForm.get("languages")?.setValue(this.rule.languages[0].lang)
      this.ruleForm.get("initialValue")?.setValue(this.rule.languages[0].value)
    
    }
  }

  onSubmit() {
    this.rule.order = this.ruleForm.get('order')?.value;
    this.rule.part  = this.ruleForm.get('part')?.value;
    this.rule.label = this.ruleForm.get('label')?.value;
    this.rule.condition  = this.ruleForm.get('condition')?.value;
    this.rule.command = this.ruleForm.get('command')?.value;
    this.rule.mandatory  = this.ruleForm.get('mandatory')?.value;
    this.rule.position = this.ruleForm.get('position')?.value;
    this.rule.format  = this.ruleForm.get('format')?.value;
    this.rule.comment = this.ruleForm.get('comment')?.value;
    this.rule.application  = this.ruleForm.get('application')?.value;
    this.rule.example  = this.ruleForm.get('example')?.value;

    this.rule.languages = this.languages
    //this.eventRuleService.publishEvent({type: RuleActionTypes.EDIT_RULE, rule: this.rule})  
    this.ruleService.setRuleToBeEdited(this.rule)

    this.router.navigate(['/CSIOForm']);
  
  }

  onCancel() {
    this.ruleService.setRuleToBeEdited({id: -1, order: 1,part: '', label: '', condition: '', command: '', mandatory: true, initialValue: '',outputValue: '', example: '',
    position: '', format: '', comment: '', application: '', languages: []});
    this.router.navigate(['/CSIOForm']);
  }

  onLangChange(event: any){
    let langSelected = event.target.value.slice(event.target.value.length - 2);
    this.ruleForm.get("languages")?.setValue(langSelected);
    // on selectionne dans rule la langue si elle existe (filter renvoi un tab mais on aura 1 seule valeur)
    let languages : Lang[] = this.rule.languages.filter(lang => lang.lang === langSelected);
    
    if (langSelected ==='EN'){
      this.ruleForm.get("initialValue")?.setValue(this.rule.initialValue)
    }else{
      if (languages.length>0) {
        this.ruleForm.get("initialValue")?.setValue(languages[0].value)
      }else{
        this.ruleForm.get("initialValue")?.setValue('')
      }
    }
    
  }

  onInitValueChange(event: any){
    // lorsque un changement est fait dans le champ initValue
    // on sauvegarde les changement dans rule
    let initValue = event.target.value;
    
    if(this.ruleForm.get('languages')?.value ==='EN'){
      this.rule.initialValue = initValue;
      return;
    }

    // on teste si une version linguistique existe déjà ou pas
    let lang : Lang = this.rule.languages.filter(lang => lang.lang === this.ruleForm.get('languages')?.value)[0]
    
    if (lang) {
      lang.value = this.ruleForm.get('initialValue')?.value;
      let index = this.languages.indexOf(lang);
      this.languages[index] = lang
      
    }else{
      let newLang : Lang = {id: 0, lang: this.ruleForm.get('languages')?.value, value: initValue}
      this.languages.push(newLang)
      
    }
    
  }
  // Utiliser pour afficher les valeurs des enum dans l'ordre de saisie
  originalOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
    return 0;
    }
}
