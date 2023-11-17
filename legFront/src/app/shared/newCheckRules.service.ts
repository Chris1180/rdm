import { Injectable } from "@angular/core";
import { NewRule } from "../model/newrule";
import { ConditionService } from "./condition.service";
import { Condition } from "../model/condition";
import { RuleCommand } from "../model/rulecommand";

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


  //inputParamMap: Map<string, boolean> = new Map(); // pour l'éval (à voir)
  //newRuleFinalConditionMap: Map<string, boolean> = new Map();

  constructor(private conditionService: ConditionService) {
    let conditionsFromDB: Condition[];
    this.conditionService.getConditionsFromDB().subscribe({
      next: (data) => { conditionsFromDB = data },
      error: (err) => {
        console.log("Error during back end request for list od conditions")
      },
      complete: () => {
        conditionsFromDB.forEach(c => {
          this.listOfKnownParam.push(c.name)
          //this.inputParamMap.set(c.name, false)
        });

      }
    }

    )
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
    /*
    switch (outputParam.toLocaleUpperCase()){
      case OutputParametersList['[AUTHOR OF PROPOSAL]']:
        return this.form.authorOfProposal.join(", ");
      case OutputParametersList['[AUTHORING COMMITTEE]']:
        return this.form.authoringCommittee;
      case OutputParametersList['[DOC LANGUAGE]']:
        return this.form.docLanguage;
      case OutputParametersList['[AXX NUMBER]']:
        return this.form.axxNumber.trim()==""? initialValue : this.form.axxNumber;
      case OutputParametersList['[EPADES REF]']:
        return this.form.epadesRef;
      case OutputParametersList['[GENERATING DATE]']:
        return  this.form.generatingDate.day + "." + this.form.generatingDate.month + "." + this.form.generatingDate.year;
      case OutputParametersList['[ITER TITLE]']:
        return this.form.iterTitle.trim()==""? initialValue : this.form.iterTitle ;
      case OutputParametersList['[LEAD COMMITTEE]']:
        // le "for the" est ajouté dans l'enum pour les comités simples
        return this.form.leadCommittee;
      case OutputParametersList['[RAPPORTEURS / LIST OF ASSOC]']:
        // formattage de la sortie ecran: 'noms des rapporteurs' , committe on 'le nom du committee'
        let outputValue: string = '';
        for (let index = 0; index < this.form.listOfAssoc.length; index++) {
          outputValue += this.form.listOfAssocRapporteurs[index]+ ', committee on ' + this.form.listOfAssoc[index] + "\n";
        }
        return outputValue;
      case OutputParametersList['[LIST OF RAPPORTEURS]']:
        return this.form.listOfRapporteurs.join(", ");
      case OutputParametersList['[PE NUMBER]']:
        return this.form.peNumber;
      case OutputParametersList['[PREFIX TITLE]']:
        return this.form.prefixTitle;
      case OutputParametersList['[DOC COM REF]']:
        return this.form.docComRef.trim()==""? initialValue : this.form.docComRef;
      case OutputParametersList['[DOC COUNCIL REF]']:
        return this.form.procedureNumber.trim()==""? initialValue : this.form.docCouncilRef;
      case OutputParametersList['[PROCEDURE NUMBER]']:
        return this.form.procedureNumber.trim()==""? initialValue : this.form.procedureNumber;
      case OutputParametersList['[SEND TO TOP DATE]']:
        return this.form.sendToTopDate.day + "." + this.form.sendToTopDate.month + "." + this.form.sendToTopDate.year;
      case OutputParametersList['[TABLING DATE]']:
        return this.form.tablingDate.day + "." + this.form.tablingDate.month + "." + this.form.tablingDate.year;
      case OutputParametersList['[PREFIX LIST OF RAPPORTEURS]']:
        if (initialValue=='') return this.form.prefixListOfRapporteurs;
        else {
          this.form.prefixListOfRapporteurs = initialValue;
          return '';
        }
      case OutputParametersList['[SUFFIX LIST OF RAPPORTEURS]']:
        if (initialValue=='') return this.form.suffixListOfRapporteurs;
        else {
          this.form.suffixListOfRapporteurs = initialValue;
          return '';
        }
      case OutputParametersList['[COMMITTEE HAVING OPINION]']:
        return 'Committee on '+this.form.opinions;
      case OutputParametersList['[LIST OF COMMITTEES HAVING OPINION]']:
        return 'the Committee on '+this.form.opinions.join(", the Committee on ").replace( /(.*)\,/gm, '$1 and');
      case OutputParametersList['[COMMITTEE HAVING POSITION]']:
        return 'the Committee on '+this.form.positions;
      case OutputParametersList['[LIST OF COMMITTEES HAVING POSITION]']:
        return 'the Committee on '+this.form.positions.join(", the Committee on ").replace( /(.*)\,/gm, '$1 and');
      case OutputParametersList['[COMMITTEE HAVING LETTER]']:
        return 'the Committee on '+this.form.letters;
      case OutputParametersList['[LIST OF COMMITTEES HAVING LETTER]']:
        return 'the Committee on '+this.form.letters.join(", the Committee on ").replace( /(.*)\,/gm, '$1 and');
      
    }// fin du switch*/
    
    // ajout du paramètre manquant si pas déjà dans la liste
    if (this.unknownOutput.indexOf(outputParam)==-1){
      this.unknownOutput.push(outputParam)
    }
    return (outputParam)
  }
}