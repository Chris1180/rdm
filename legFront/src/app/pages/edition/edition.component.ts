import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Language } from 'src/app/model/inputParameters/language';
import { Lang } from 'src/app/model/lang';
import { Rule } from 'src/app/model/rule';
import { Style } from 'src/app/model/style';
import { EventRuleService } from 'src/app/shared/event.rule.service';
import { RulesService } from 'src/app/shared/rules.service';
import { RuleActionTypes } from 'src/app/shared/rules.state';
import { StyleService } from 'src/app/shared/style.service';

@Component({
  selector: 'app-edition',
  templateUrl: './edition.component.html',
  styleUrls: ['./edition.component.css']
})
export class EditionComponent implements OnInit {
  ruleForm! : UntypedFormGroup;
  rule! :Rule;
  languages! : Lang[];
  errorMessage! : string;

  styles : Style[] = [];

  language = Language;

  /*
  // variable pour stocker les valeurs uniques par champ
  parts! : Array<string>;
  labels! : Array<string>;
  conditions! : Array<string>;
  commands! : Array<string>;
  positions! : Array<string>;
  formats! : Array<string>;*/
  
  constructor(private ruleService : RulesService, private router: Router, private styleService : StyleService, private eventRuleService: EventRuleService) { }

  ngOnInit(): void {
    // On met les info de la Rule à modifier dans des variables locales
    this.rule = this.ruleService.getRuleToBeEdited();
    this.languages = this.rule.languages; 
    this.styleService.getStylesFromDB().subscribe(
      data => this.styles = data
    )

    this.ruleForm = new UntypedFormGroup({
      id : new UntypedFormControl(this.rule.id),
      order : new UntypedFormControl(this.rule.order),
      part : new UntypedFormControl(this.rule.part),
      label : new UntypedFormControl(this.rule.label),
      condition : new UntypedFormControl(this.rule.condition),
      command : new UntypedFormControl(this.rule.command),
      mandatory : new UntypedFormControl(this.rule.mandatory),
      languageSelected : new UntypedFormControl('EN'),
      initialValue : new UntypedFormControl(this.rule.initialValue),
      position : new UntypedFormControl(this.rule.position),
      format : new UntypedFormControl(this.rule.format),
      style : new UntypedFormControl(this.rule.style?.id),
      comment : new UntypedFormControl(this.rule.comment),
      application : new UntypedFormControl(this.rule.application),
      example : new UntypedFormControl(this.rule.example)
    });
    
    // Par défaut l'initial value de la règle correspond à la langue EN
    // mais si c'est une règle multi langue sans valeur par defaut pour l'EN alors on affiche la première version linguistique
    if (this.rule.languages.length>0 && this.rule.command=='') {
      //console.log("multi langue rule"); 
      this.ruleForm.get("languageSelected")?.setValue(this.rule.languages[0].lang)
      this.ruleForm.get("command")?.setValue(this.rule.languages[0].value)
    
    }
    //console.log(this.rule)
  }

  onSubmit() {
    this.rule.order = this.ruleForm.get('order')?.value;
    this.rule.part  = this.ruleForm.get('part')?.value.trim();
    this.rule.label = this.ruleForm.get('label')?.value.trim();
    this.rule.condition  = this.ruleForm.get('condition')?.value.trim();
    // inutile puisque ce champ garde par défaut la valeur EN
    //this.rule.command = this.ruleForm.get('command')?.value.trim();
    this.rule.mandatory  = this.ruleForm.get('mandatory')?.value;
    this.rule.initialValue = this.ruleForm.get('initialValue')?.value;
    //this.rule.format  = this.ruleForm.get('format')?.value; 
    this.rule.comment = this.ruleForm.get('comment')?.value.trim();
    this.rule.application  = this.ruleForm.get('application')?.value.trim();
    this.rule.example  = this.ruleForm.get('example')?.value.trim();
    this.rule.style = this.styles.find(style => style.id === this.ruleForm.get('style')?.value);
    this.rule.languages = this.languages
    //this.eventRuleService.publishEvent({type: RuleActionTypes.EDIT_RULE, rule: this.rule})  
    this.ruleService.setRuleToBeEdited(this.rule)

    
    //console.log (this.rule)
    this.router.navigate(['/CSIOForm']);
  
  }

  onCancel() {
    this.ruleService.setRuleToBeEdited({id: -1, order: 1,part: '', label: '', condition: '', command: '', mandatory: true, initialValue: '',outputValue: '', example: '',
    position: '', format: '', comment: '', application: '', languages: [], finalCondition: ''});
    this.router.navigate(['/CSIOForm']);
  }

  onLangChange(event: any){
    // l'utilisateur change l'affichage de la langue
    // par defaut le champ command est rempli avec la valeur de l'EN
    let langSelected = event.target.value.slice(event.target.value.length - 2);
    this.ruleForm.get("languageSelected")?.setValue(langSelected);
    // on selectionne dans rule la langue si elle existe (filter renvoi un tab mais on aura 1 seule valeur)
    let languages : Lang[] = this.rule.languages.filter(lang => lang.lang === langSelected);
    
    if (langSelected ==='EN'){
      this.ruleForm.get("command")?.setValue(this.rule.command)
    }else{
      if (languages.length>0) {
        this.ruleForm.get("command")?.setValue(languages[0].value)
      }else{
        this.ruleForm.get("command")?.setValue('')
      }
    }
    
  }

  onCommandValueChange(event: any){
    // lorsque un changement est fait dans le champ command
    // on sauvegarde les changements dans rule
    let command = event.target.value;
    
    // par défaut c'est l'EN qui est encodé dans le champ command
    if(this.ruleForm.get('languageSelected')?.value ==='EN'){
      this.rule.command = command;
      return;
    }

    // on teste si une commande dans la langue existe déjà ou pas
    let lang : Lang = this.rule.languages.filter(lang => lang.lang === this.ruleForm.get('languageSelected')?.value)[0]
    
    if (lang) {
      // soit on met à jour le tableau languages
      lang.value = this.ruleForm.get('command')?.value;
      let index = this.languages.indexOf(lang);
      this.languages[index] = lang
      
    }else{
      // soit on ajoute une entrée au tableau languages
      let newLang : Lang = {id: 0, lang: this.ruleForm.get('languageSelected')?.value, value: command}
      this.languages.push(newLang)
      
    }
  }
  // Utiliser pour afficher les valeurs des enum dans l'ordre de saisie
  originalOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
    return 0;
    }
}
