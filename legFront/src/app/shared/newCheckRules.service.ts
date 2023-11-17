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
  //form!: any;
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
  evalRules(inputParamMap: Map<string, boolean>, inputMissingParamMap: Map<string, boolean>, rulesSelectedForPreview: NewRule[], LinguisticVersion: string){
    
    console.log('rules selected for preview')
    console.log(rulesSelectedForPreview)
    // avant de faire l'éval il faut changer les valeurs des input dans la finalcondition
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
                //r.outputValue += this.getOutputParameter(commandOutputParam, r.id, r.initialValue);
                continue;
              }
              if (outputCommand) {
                commandOutputParam += char;
              }else{
                // le char est directement repris dans le outputValue
                //console.log(char)
                r.outputValue! += char;
              }
            } // fin du for
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
}