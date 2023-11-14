import { Injectable } from "@angular/core";
import { NewRule } from "../model/newrule";
import { ConditionService } from "./condition.service";
import { Condition } from "../model/condition";

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
    listOfKnownParam: string[] = ["||", "&&", "true", "false" , ""]

    constructor(private conditionService: ConditionService) {
        let conditionsFromDB : Condition[];
        this.conditionService.getConditionsFromDB().subscribe({
          next: (data) => {conditionsFromDB = data},
          error:(err) => {
            console.log("Error during back end request for list od conditions")
          },
          complete: ()=>{
            conditionsFromDB.forEach(c=>this.listOfKnownParam.push(c.name));
            //console.log(this.listOfKnownParam)
          }
        }
          
        )
    }

    checkCondition(allRulestoBeCheckedBySelectedPart: NewRule[]) : {unknownInput: string[], rulesWithUnknownInput: number[]} {
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
            finalCondition = this.formatCondition(r.ruleCondition.textCondition, r.ruleCondition.id);
            console.log(finalCondition) 
        }); // fin du foreach 

        console.log(this.unknownInput)
        console.log(this.commandsWithUnknownInput)
        return {unknownInput: this.unknownInput, rulesWithUnknownInput: this.commandsWithUnknownInput};
    }


    formatCondition(condition: string, id: number) {
        let finalCondition: string = "";
        let param: string = "";
        for (let index = 0; index < condition.length; index++) {
          const element = condition[index].toUpperCase();
          //console.log ("element: "+ element)
          if (element === '(') {
            finalCondition+=element;
            continue;
          };
          if (element === ' ' || index==condition.length-1){
            if (param.length==0) continue; // cas de plusieurs espaces
            if (element != ' ') param+=element;
            if (param == 'OR') param = '||';
            if (param == 'AND') param = '&&';
            if (param == 'TRUE') param = 'true';
            if (param == 'FALSE') param = 'false';
            if (param.startsWith('NOT_')) param = param.replace("NOT_", "!"); 
            if (index==condition.length-1) finalCondition = finalCondition+param
            else finalCondition = finalCondition+param+" ";
            
            // check si le paramètre est connu
            //param.replace("!", "")
            var re = /[!)\s]+/g; 
            let paramTobeChecked = param.replace(re, "")
            //console.log ("param to be checked : "+paramTobeChecked)
            if (this.listOfKnownParam.indexOf(paramTobeChecked) == -1) {
              if(this.unknownInput.indexOf(paramTobeChecked) == -1)
              this.unknownInput.push(paramTobeChecked);
              if(this.commandsWithUnknownInput.indexOf(id) == -1)
              this.commandsWithUnknownInput.push(id)
            }
            
            // reinit de param pour la suite 
            //console.log("param : "+param)
            param="";
          }else {
            param+=element;
          }
        }
        
       //console.log("condition retournée")
       //console.log (finalCondition)
        return finalCondition
      }
}