import { Injectable } from "@angular/core";
import { NewRule } from "../model/newrule";
import { ConditionService } from "./condition.service";
import { Condition } from "../model/condition";
import { RuleCommand } from "../model/rulecommand";
import { Command } from "../model/command";
import { CommandService } from "./command.service";
import { outputParametersListFromTheForm } from "../model/outputParameters/outputParametersListFromTheForm";

@Injectable({
  providedIn: 'root'
})

export class NewCheckRulesService {
  rules!: Array<NewRule>;
  rulesApplied: NewRule[] = [];
  form!: any;
  unknownInput: string[] = [];
  commandsWithUnknownInput: number[] = [];
  unknownOutput: string[] = [];
  listOfKnownParam: string[] = ["||", "&&", "true", "false", ""]
  listOfOutputParamFromDB: Command[] = [];

  constructor(private conditionService: ConditionService, private commandService: CommandService) {
    // récupération des conditions (input param) de la Base de donnée dans le tableau listOfKnownParam
    this.conditionService.getConditionsFromDB().subscribe({
      next: (conditionsFromDB: Condition[]) => { 
        conditionsFromDB.forEach(c => {
        this.listOfKnownParam.push(c.name)
        }); 
      },
      error: (err) => {
        console.log("Error during back end request for list od conditions")
      }
    })
    // récupération des commandes (output param) de la Base de donnée dans le tableau listOfOutputParamFromDB
    this.commandService.getCommandsFromDB().subscribe({
      next: (commandsFromDB: Command[]) => { 
        this.listOfOutputParamFromDB = commandsFromDB; 
      },
      error: (err) => {
        console.log("Error during back end request for list of commands (output param)")
      }
    })
    
  }

  checkCondition(allRulestoBeCheckedBySelectedPart: NewRule[]): { unknownInput: string[], rulesWithUnknownInput: number[] } {
    this.rules = allRulestoBeCheckedBySelectedPart;
    // reinitialise la liste des règles
    this.rulesApplied = [];
    this.unknownInput = [];
    this.commandsWithUnknownInput = [];
    this.unknownOutput = [];
    
    // check des règles les unes après les autres 
    this.rules.forEach(r => {
      let finalCondition: string = "";
      // D'abord on analyse le champ Condition et on le formate de manière à pouvoir l'évaluer 
      finalCondition = this.formatCondition(r.ruleCondition.textCondition);
      // on le sauvegarde dans la règle
      r.finalCondition = finalCondition
      // ensuite on vérifie si dans la condition finale il y a des Input Param manquants
      let splittedFinalCondition = finalCondition.split(" ")

      splittedFinalCondition.forEach(input => {
        // supprime les ! de l'input
        var re = /[(!)\s]+/g;
        let paramTobeChecked = input.replace(re, "")
        //si l'input param n'est pas dans la liste des KnownParam alors on met à jour les tableaux de suivi
        if (this.listOfKnownParam.indexOf(paramTobeChecked) == -1) {
          
          if (this.unknownInput.indexOf(paramTobeChecked) == -1) this.unknownInput.push(paramTobeChecked);
          if (this.commandsWithUnknownInput.indexOf(r.ruleCondition.id) == -1) this.commandsWithUnknownInput.push(r.ruleCondition.id)
        }
      })
    }); // fin du foreach 

    return { unknownInput: this.unknownInput, rulesWithUnknownInput: this.commandsWithUnknownInput };
  }


  formatCondition(condition: string) {
    let finalCondition: string = "";
    let param: string = "";
    for (let index = 0; index < condition.length; index++) {
      const element = condition[index].toUpperCase();
      //console.log ("element: "+ element)
      if (element === '(') {
        finalCondition += element;
        continue;
      };
      if (element === ' ' || index == condition.length - 1) {
        if (param.length == 0) continue; // cas de plusieurs espaces
        if (element != ' ') param += element;
        if (param == 'OR') param = '||';
        if (param == 'AND') param = '&&';
        if (param == 'TRUE') param = 'true';
        if (param == 'FALSE') param = 'false';
        if (param.startsWith('NOT_')) param = param.replace("NOT_", "!");
        if (index == condition.length - 1) finalCondition = finalCondition + param
        else finalCondition = finalCondition + param + " ";

        // reinit de param pour la suite 
        //console.log("param : "+param)
        param = "";
      } else {
        param += element;
      }
    }

    //console.log("condition retournée")
    //console.log (finalCondition)
    return finalCondition
  }
  evalRules(inputParamMap: Map<string, boolean>, inputMissingParamMap: Map<string, boolean>, rulesSelectedForPreview: NewRule[], previewForm: any){
    // met les valeurs du formulaire dans form
    this.form = previewForm;
    let LinguisticVersion = this.form.get('language')?.value
    console.log('rules selected for preview')
    console.log(rulesSelectedForPreview)
    // avant de faire l'éval il faut changer les valeurs des inputs dans la finalcondition avec les infos des Map input
    rulesSelectedForPreview.forEach(r=>{
      // Pour chaque final condition des règles ayant un condition avec un input manquant on fait une eval
      for (let [key, value] of inputParamMap) {
        var re = new RegExp("\\b" + key + "\\b", "gi"); // /\bkey\b/gi;
        r.finalCondition = r.finalCondition.replace(re , value.toString());
      }
      for (let [key, value] of inputMissingParamMap) {
        var re = new RegExp("\\b" + key + "\\b", "gi"); // /\bkey\b/gi;
        r.finalCondition = r.finalCondition.replace(re , value.toString());            
      }
    })
    
    // on évalue les conditions en remplissant rulesApllied et unknowoutput
    rulesSelectedForPreview.forEach(r => {
      
        try {
          if (eval(r.finalCondition)) {
            console.log("Rule :" + r.id + " True => " + r.finalCondition);
            // avant de mettre la règle dans le tableau des règles appliquées il faut vérifier si il y a des sous conditions
            if (r.nestedCondition) {
              // to be done
            }else {
              this.rulesApplied.push(r);
              // vérification de la version linguistique de la commande
              let ruleCommands: RuleCommand[] = r.ruleCondition.ruleCommand.filter(rc=>rc.lang==LinguisticVersion)
              let commandWithLinguisticVersion: string  = ruleCommands[0].command
              console.log(commandWithLinguisticVersion)
              let commandOutputParam : string ="";
              let outputCommand : boolean = false;
              r.outputValue = "";
              // parcour de la chaine de caratère command pour en extraire les infos
              for (let index = 0; index < commandWithLinguisticVersion.length; index++) {
                const char = commandWithLinguisticVersion[index];
                if (char=='['){
                  // debut d'un paramètre => on enregistre la commande dans commandOutputParam
                  commandOutputParam = char;
                  outputCommand = true;
                  continue;
                }
                if (char==']'){
                  // fin d'un paramètre
                  commandOutputParam += char;
                  outputCommand = false;
                  r.outputValue += this.getOutputParameter(commandOutputParam);
                  continue;
                }
                if (outputCommand) {
                  commandOutputParam += char;
                }else{
                  // le char est directement repris dans le outputValue
                  //console.log(char)
                  r.outputValue += char;
                }
              } // fin du for
            }
            
          } else {
            console.warn("Rule :" + r.id + " False => " + r.finalCondition);
          } // fin du try
        } catch (e) {
          console.log(e)
          console.error('SyntaxError on rule number : ' + r.id + "\nrule code is : " + r.ruleCondition.textCondition + "\nfinal condition is : " + r.finalCondition) // It is a SyntaxError
        }
      
      
  
    }); // fin du foreach

    return {unknownOutput : this.unknownOutput, rulesApllied: this.rulesApplied};
  } // fin du eval rule

  getOutputParameter(outputParam: string){
    let outputParamToBeChecked = outputParam.replace(/\[|\]/g,'').toLocaleUpperCase();

    // on regarde dans la liste des commandes si le paramètre existe
    let outputCommand = this.listOfOutputParamFromDB.filter(op=> op.name == outputParamToBeChecked)
    let initialValue = ''
    //console.log(outputCommand)
    
    if(outputCommand.length > 0) {
      //console.log('commande trouvée'+ outputCommand);
      initialValue = outputCommand[0].initValue;
    }//else console.log('pas trouvée')
    
    //console.log(this.form.generatingDate.day)
    // on regarde si le paramètre est dans le formulaire et sinon (default) on le met dans le tableau des unknownOutput
    // pour le demandé à l'utilisateur
    switch (outputParamToBeChecked){
      case outputParametersListFromTheForm['PROCEDURE NUMBER']:
        return this.form.get('procedureNumber').value.trim()==""? initialValue : this.form.get('procedureNumber').value;
      case outputParametersListFromTheForm['GENERATING DATE']:
        return  this.form.get('generatingDate').value.day + "." + this.form.get('generatingDate').value.month + "." + this.form.get('generatingDate').value.year;
      case outputParametersListFromTheForm['SEND TO TOP DATE']:
        return this.form.get('sendToTopDate').value.day + "." + this.form.get('sendToTopDate').value.month + "." + this.form.get('sendToTopDate').value.year
      case outputParametersListFromTheForm['TABLING DATE']:
        return this.form.get('tablingDate').value.day + "." + this.form.get('tablingDate').value.month + "." + this.form.get('tablingDate').value.year
      case outputParametersListFromTheForm['PE NUMBER']:
        return this.form.get('peNumber').value;
      case outputParametersListFromTheForm['AXX NUMBER']:
        return this.form.get('axxNumber').value.trim()==""? initialValue : this.form.get('axxNumber').value;
      case outputParametersListFromTheForm['EPADES REF']:
        return this.form.get('epadesRef').value;
      case outputParametersListFromTheForm['DOC LANGUAGE']:
        return this.form.get('docLanguage').value;
      case outputParametersListFromTheForm['PREFIX TITLE']:
        return this.form.get('prefixTitle').value;
      case outputParametersListFromTheForm['ITER TITLE']:
        return this.form.get('iterTitle').value.trim()==""? initialValue : this.form.get('iterTitle').value;
      case outputParametersListFromTheForm['DOC COM REF']:
        return this.form.get('docComRef').value.trim()==""? initialValue : this.form.get('docComRef').value;
      case outputParametersListFromTheForm['DOC COUNCIL REF']:
        return this.form.get('docCouncilRef').value.trim()==""? initialValue : this.form.get('docCouncilRef').value;
      case outputParametersListFromTheForm['AUTHOR OF PROPOSAL']:
        return this.form.get('authorOfProposal').value.join(", ");

      // valeur du tableau  
      case outputParametersListFromTheForm['AUTHORING COMMITTEE']:
        return this.form.get('authoringCommittee').value;
      case outputParametersListFromTheForm['LEAD COMMITTEE']:
        // le "for the" est ajouté dans l'enum pour les comités simples
        return this.form.get('leadCommittee').value;
      case outputParametersListFromTheForm['RAPPORTEURS / LIST OF ASSOC']:
        // formattage de la sortie ecran: 'noms des rapporteurs' , committe on 'le nom du committee'
        let outputValue: string = '';
        for (let index = 0; index < this.form.get('listOfAssoc').value.length; index++) {
          outputValue += this.form.get('listOfAssocRapporteurs').value[index]+ ', committee on ' + this.form.get('listOfAssoc').value[index] + "\n";
        }
        return outputValue;
      case outputParametersListFromTheForm['LIST OF RAPPORTEURS']:
        return this.form.get('listOfRapporteurs').value.join(", ");
      
      // to be checked if used
      case outputParametersListFromTheForm['PREFIX LIST OF RAPPORTEURS']:
        if (initialValue=='') return this.form.prefixListOfRapporteurs;
        else {
          this.form.prefixListOfRapporteurs = initialValue;
          return '';
        }
      case outputParametersListFromTheForm['SUFFIX LIST OF RAPPORTEURS']:
        if (initialValue=='') return this.form.suffixListOfRapporteurs;
        else {
          this.form.suffixListOfRapporteurs = initialValue;
          return '';
        }
      // end of to be checked
      
      case outputParametersListFromTheForm['COMMITTEE HAVING OPINION']:
        return 'Committee on '+this.form.get('opinions').value;
      case outputParametersListFromTheForm['LIST OF COMMITTEES HAVING OPINION']:
        return 'the Committee on '+this.form.get('opinions').value.join(", the Committee on ").replace( /(.*)\,/gm, '$1 and');
      case outputParametersListFromTheForm['COMMITTEE HAVING POSITION']:
        return 'the Committee on '+this.form.get('positions').value;
      case outputParametersListFromTheForm['LIST OF COMMITTEES HAVING POSITION']:
        return 'the Committee on '+this.form.get('positions').value.join(", the Committee on ").replace( /(.*)\,/gm, '$1 and');
      case outputParametersListFromTheForm['COMMITTEE HAVING LETTER']:
        return 'the Committee on '+this.form.get('letters').value;
      case outputParametersListFromTheForm['LIST OF COMMITTEES HAVING LETTER']:
        return 'the Committee on '+this.form.get('letters').value.join(", the Committee on ").replace( /(.*)\,/gm, '$1 and');
      default:
        // ajout du paramètre manquant si pas déjà dans la liste
        if (this.unknownOutput.indexOf(outputParam)==-1){
          this.unknownOutput.push(outputParam)
        }
        return (outputParam)
    }// fin du switch*/
  }
}