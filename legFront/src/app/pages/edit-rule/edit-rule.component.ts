import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Language } from 'src/app/model/inputParameters/language';
import { NewRule } from 'src/app/model/newrule';
import { RuleCommand } from 'src/app/model/rulecommand';
import { RuleCondition } from 'src/app/model/rulecondition';
import { Style } from 'src/app/model/style';
import { NewRulesService } from 'src/app/shared/newrules.service';
import { StyleService } from 'src/app/shared/style.service';

@Component({
  selector: 'app-edit-rule',
  templateUrl: './edit-rule.component.html',
  styleUrls: ['./edit-rule.component.css']
})
export class EditRuleComponent implements OnInit {
  
  ruleForm! : FormGroup;
  language = Language;
  styles : Style[] = [];
  rule! : NewRule;
  ruleCommands! : RuleCommand[];
  subConditions : RuleCondition[] = [];

  constructor (private newRulesService: NewRulesService, private styleService : StyleService,
    private router: Router){}
  
  ngOnInit(): void {
    this.rule = this.newRulesService.getRuleToBeEdited();
    // après avoir récupéré l'info de la règle à éditer on efface les infos du service pour ne pas sauvegarder de fausses info dans la page rule 
    this.newRulesService.initRuleToBeEdited()

    // attention ici on lie les deux variables et en modifiant ruleCommands je modifie rule
    this.ruleCommands = this.rule.ruleCondition.ruleCommand;
    this.styleService.getStylesFromDB().subscribe(data => this.styles = data)
    
    // selectione la version linguistique de la condition en EN si elle est dispo sinon la première de la liste
    let language = 'EN'
    let command = ''
    if (this.ruleCommands.length>0){
      let commandEN = this.ruleCommands.filter(el => el.lang=='EN');
      if (commandEN.length !=0 ) {
        //language = commandEN[0].lang
        command = commandEN[0].command
      }else{
        // premier de la liste
        language = this.ruleCommands[0].lang;
        command = this.ruleCommands[0].command
      }
    }
    
    this.ruleForm = new FormGroup({
      id : new FormControl(this.rule.id),
      order : new FormControl(this.rule.order),
      part : new FormControl(this.rule.part),
      label : new FormControl(this.rule.label),
      condition : new FormControl(this.rule.ruleCondition.textCondition),
      command : new FormControl(command),
      languageSelected : new FormControl(language),
      style : new FormControl(this.rule.style!.id),
      comment : new FormControl(this.rule.comment),
      subCommands : new FormArray([])
    });
    
    //partie sous condition
    if(this.rule.nestedCondition){
      //recherche des sous conditions en back end
      this.newRulesService.getSubConditionsFromDB(this.rule.ruleCondition.id).subscribe({
        next : (data)=>{
          this.subConditions = data;
          // pour chaque sous condition reçue on crée un formulaire dans ruleForm.subCommands
          for (let index = 0; index < this.subConditions.length; index++) {
            const ruleCondition = this.subConditions[index];
            // en premier on vérifie si une entrée existe dans ruleCommands
            let ruleCommandEN : RuleCommand = ruleCondition.ruleCommand.filter(rc => rc.lang === 'EN')[0]
            
            const subConditionForm = new FormGroup({
              id: new FormControl(ruleCondition.id),
              condition: new FormControl(ruleCondition.textCondition),
              languageSelected: new FormControl('EN'),
              command: new FormControl('no command found'),
            });

            if (ruleCommandEN) {
              subConditionForm.get('command')?.setValue(ruleCommandEN.command)
            }
            
            this.subCommands.push(subConditionForm)
          }
          
          },
        error: (err) => {
          console.error("Une erreur est remontée lors de la recherche de RuleCondition");
        },
        complete: ()=>{
          console.log(this.subCommands.value)
        }
      })
    }



  }
  onSubmit() {
    // récupération des données du formulaire
    this.rule.order = this.ruleForm.get('order')?.value;
    this.rule.part  = this.ruleForm.get('part')?.value.trim();
    this.rule.label = this.ruleForm.get('label')?.value.trim();
    this.rule.comment = this.ruleForm.get('comment')?.value.trim();
    this.rule.ruleCondition.textCondition  = this.ruleForm.get('condition')?.value;
    // pour mettre un objet style dans rule il faut retrouver grace à l'index l'objet dans le tab styles
    // dans le formulaire on ne conserve que l'id du style
    let style = this.styles.find(el => el.id == this.ruleForm.get("style")?.value)
    this.rule.style = style;

    // la sauvegarde se fait dans la page rules
    this.newRulesService.setRuleToBeEdited(this.rule)
    console.log(this.subCommands.value)
    //this.router.navigate(['/Rules']);
    
  }


  // Utiliser pour afficher les valeurs des enum dans l'ordre de saisie
  originalOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
    return 0;
  }
  onLangChange(event: any){
    // l'utilisateur change l'affichage de la langue
    let langSelected = event.target.value.slice(event.target.value.length - 2);   
    this.ruleForm.get("languageSelected")?.setValue(langSelected);
    if (this.ruleCommands.find(el => el.lang == langSelected) != undefined) {
      this.ruleForm.get("command")?.setValue(this.ruleCommands.find(el => el.lang == langSelected)?.command);
    }else{
      this.ruleForm.get("command")?.setValue('');
    }
  }

  onCommandValueChange(event: any){
    // lorsque un changement est fait dans le champ command
    let newCommand = event.target.value;
    // on sauvegarde les changements dans le tableau ruleCommands
    // en premier on vérifie si une entrée existe
    let ruleCommand : RuleCommand = this.ruleCommands.filter(rc => rc.lang === this.ruleForm.get('languageSelected')?.value)[0]
    if (ruleCommand) {
      // soit on met à jour le tableau ruleCommands
      ruleCommand.command = this.ruleForm.get('command')?.value;
      let index = this.ruleCommands.indexOf(ruleCommand);
      this.ruleCommands[index] = ruleCommand
      
    }else{
      // soit on ajoute une entrée au tableau ruleCommands
      let newRuleCommand : RuleCommand = {id: 0, lang: this.ruleForm.get('languageSelected')?.value, command: newCommand}
      this.ruleCommands.push(newRuleCommand)
      
    }
  }

  onStyleChange(event: any){
    let styleId = Number(event.target.value.split(" ")[event.target.value.split(" ").length-1])
    this.ruleForm.get("style")?.setValue(styleId);
  }

  knownLanguages(lang: string){
    // l'utilité de cette fonction est de faire apparaitre les langues en gras si une commande existe dans la règle
    if (this.rule.ruleCondition.ruleCommand && this.rule.ruleCondition.ruleCommand.find(el => el.lang == lang)) return {'font-weight': 'bold'} 
    else return {}
  }

  // getter for the FormArray
  get subCommands(): FormArray {
    return this.ruleForm.get('subCommands') as FormArray;
  }

}
