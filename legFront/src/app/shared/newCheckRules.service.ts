import { Injectable } from "@angular/core";
import { NewRule } from "../model/newrule";
import { InputService } from "./input.service";
import { Input } from "../model/input";
import { Output } from "../model/output";
import { OutputService } from "./output.service";
import { NewRulesService } from "./newrules.service";
import { Observable, forkJoin, map, of } from "rxjs";
import { RuleToEvaluate } from "../model/ruleToEvaluate";

@Injectable({
  providedIn: 'root'
})

export class NewCheckRulesService {
  rules!: Array<NewRule>;
  rulesApplied: NewRule[] = [];
  //form!: any;
  unknownInput: string[] = [];
  //commandsWithUnknownInput: number[] = [];
  unknownOutput: string[] = [];
  listOfKnownInputParam: string[] = ["||", "&&", "true", "false", ""]
  listOfOutputParamFromDB: Output[] = [];
  

  constructor(private inputService: InputService, private outputService: OutputService, private newRuleService: NewRulesService) {
    // récupération des conditions (input param) de la Base de donnée dans le tableau listOfKnownParam
    this.inputService.getInputsFromDB().subscribe({
      next: (inputsFromDB: Input[]) => { 
        inputsFromDB.forEach(c => {
        this.listOfKnownInputParam.push(c.name)
        }); 
      },
      error: (err) => {
        console.log("Error during back end request for list of conditions")
      }
    })
    // récupération des commandes (output param) de la Base de donnée dans le tableau listOfOutputParamFromDB
    this.outputService.getOutputsFromDB().subscribe({
      next: (outputsFromDB: Output[]) => { 
        this.listOfOutputParamFromDB = outputsFromDB; 
      },
      error: (err) => {
        console.log("Error during back end request for list of commands (output param)")
      }
    })
    
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
  evalRules(inputParamMap: Map<string, boolean>, inputMissingParamMap: Map<string, boolean>,
            rulesSelectedForPreview: RuleToEvaluate[]): RuleToEvaluate[] {

    let rulesToBeApplied : RuleToEvaluate[] = []  
    //console.log(rulesSelectedForPreview)
    //console.log(rulesSelectedForPreview.length)
    
    // On passe en revue chaque règle pour les évaluer
    rulesSelectedForPreview.forEach(r=>{
      //console.log(r)
      
      // Pour chaque conditionFormatted de la règle on remplace les valeurs des inputs par true or false
      // puis on met le résultat dans un variable conditionToBeEvaluated que l'on évalue
      let conditionToBeEvaluated: string = r.conditionFormated 
      for (let [key, value] of inputParamMap) {
        var re = new RegExp("\\b" + key + "\\b", "gi"); // /\bkey\b/gi;
        conditionToBeEvaluated = conditionToBeEvaluated.replace(re , value.toString());
      }
      for (let [key, value] of inputMissingParamMap) {
        var re = new RegExp("\\b" + key + "\\b", "gi"); // /\bkey\b/gi;
        conditionToBeEvaluated = conditionToBeEvaluated.replace(re , value.toString());            
      }
      //console.log('condition de la règle : '+r.idRule+ ' avec la conditionFormatted : '+r.conditionFormated)
      //console.log('valeur de la condition finale à évaluer')
      //console.log(conditionToBeEvaluated)
      
      
      try {
        if (eval(conditionToBeEvaluated)) {
          //console.log("Rule :" + r.idRule + " True => " + r.conditionFormated);
          rulesToBeApplied.push(r);
          
        } else {
          console.warn("Rule :" + r.idRule + " False => " + r.conditionFormated);
        } // fin du try
      } catch (e) {
        console.log(e)
        console.error('SyntaxError on rule number : ' + r.idRule + "\nrule condition is : " + r.condition + "\n condition formatted is : " + r.conditionFormated) // It is a SyntaxError
      }

    })// fin du foreach
    return rulesToBeApplied
  } // fin du eval rule

  getOutputParameter(outputParam: string, previewForm: any){
    let outputParamToBeChecked = outputParam.replace(/\[|\]/g,'').toLocaleUpperCase();

    // on regarde dans la liste des commandes si le paramètre existe
    let outputCommand = this.listOfOutputParamFromDB.filter(op=> op.name.toLocaleUpperCase() == outputParamToBeChecked)
    let initialValue = ''
    //console.log('output récupérée de la db')
    //console.log(outputCommand)
    
    if(outputCommand.length > 0) {
      //console.log('commande trouvée'+ outputCommand);
      initialValue = outputCommand[0].initValue;
    }//else console.log('pas trouvée')
    
    // on regarde si le paramètre est dans le formulaire et sinon (default) on le met dans le tableau des unknownOutput
    // pour le demandé à l'utilisateur
    switch (outputParamToBeChecked){
      case 'PROCEDURE NUMBER':
        return previewForm.get('procedureNumber').value.trim()==""? initialValue : previewForm.get('procedureNumber').value;
      case 'GENERATING DATE':
        return  previewForm.get('generatingDate').value.day + "." + previewForm.get('generatingDate').value.month + "." + previewForm.get('generatingDate').value.year;
      case 'SEND TO TOP DATE':
        return previewForm.get('sendToTopDate').value.day + "." + previewForm.get('sendToTopDate').value.month + "." + previewForm.get('sendToTopDate').value.year
      case 'TABLING DATE':
        return previewForm.get('tablingDate').value.day + "." + previewForm.get('tablingDate').value.month + "." + previewForm.get('tablingDate').value.year
      case 'PE NUMBER':
        return previewForm.get('peNumber').value;
      case 'AXX NUMBER':
        return previewForm.get('axxNumber').value.trim()==""? initialValue : previewForm.get('axxNumber').value;
      case 'EPADES REF':
        return previewForm.get('epadesRef').value;
      case 'DOC LANGUAGE':
        return previewForm.get('docLanguage').value;
      case 'PREFIX TITLE':
        return previewForm.get('prefixTitle').value;
      case 'ITER TITLE':
        return previewForm.get('iterTitle').value.trim()==""? initialValue : previewForm.get('iterTitle').value;
      case 'DOC COM REF':
        return previewForm.get('docComRef').value.trim()==""? initialValue : previewForm.get('docComRef').value;
      case 'DOC COUNCIL REF':
        return previewForm.get('docCouncilRef').value.trim()==""? initialValue : previewForm.get('docCouncilRef').value;
      case 'AUTHOR OF PROPOSAL':
        return previewForm.get('authorOfProposal').value.join(", ");

      // valeur du tableau  
      case 'AUTHORING COMMITTEE':
        return previewForm.get('authoringCommittee').value;
      case 'LEAD COMMITTEE':
        // le "for the" est ajouté dans l'enum pour les comités simples
        return previewForm.get('leadCommittee').value;
      case 'RAPPORTEURS / LIST OF ASSOC':
        // formattage de la sortie ecran: 'noms des rapporteurs' , committe on 'le nom du committee'
        let outputValue: string = '';
        for (let index = 0; index < previewForm.get('listOfAssoc').value.length; index++) {
          outputValue += previewForm.get('listOfAssocRapporteurs').value[index]+ ', committee on ' + previewForm.get('listOfAssoc').value[index] + "\n";
        }
        return outputValue;
      case 'LIST OF RAPPORTEURS':
        return previewForm.get('listOfRapporteurs').value.join(", ");
      
      // to be checked if used
      case 'PREFIX LIST OF RAPPORTEURS':
        if (initialValue=='') return previewForm.prefixListOfRapporteurs;
        else {
          previewForm.prefixListOfRapporteurs = initialValue;
          return '';
        }
      case 'SUFFIX LIST OF RAPPORTEURS':
        if (initialValue=='') return previewForm.suffixListOfRapporteurs;
        else {
          previewForm.suffixListOfRapporteurs = initialValue;
          return '';
        }
      // end of to be checked
      
      case 'COMMITTEE HAVING OPINION':
        return 'Committee on '+previewForm.get('opinions').value;
      case 'LIST OF COMMITTEES HAVING OPINION':
        return 'the Committee on '+previewForm.get('opinions').value.join(", the Committee on ").replace( /(.*)\,/gm, '$1 and');
      case 'COMMITTEE HAVING POSITION':
        return 'the Committee on '+previewForm.get('positions').value;
      case 'LIST OF COMMITTEES HAVING POSITION':
        return 'the Committee on '+previewForm.get('positions').value.join(", the Committee on ").replace( /(.*)\,/gm, '$1 and');
      case 'COMMITTEE HAVING LETTER':
        return 'the Committee on '+previewForm.get('letters').value;
      case 'LIST OF COMMITTEES HAVING LETTER':
        return 'the Committee on '+previewForm.get('letters').value.join(", the Committee on ").replace( /(.*)\,/gm, '$1 and');
      default:
        // ajout du paramètre manquant si pas déjà dans la liste
        if (this.unknownOutput.indexOf(outputParam)==-1){
          this.unknownOutput.push(outputParam)
        }
        return (outputParam)
    }// fin du switch*/
  }

  formatConditionsBeforeEval(rules: NewRule[], languageSelected: string): Observable<RuleToEvaluate[]> {
    let rulesToEvaluate : RuleToEvaluate[] = [];
    const observables: Observable<void>[] = [];
    //console.log(languageSelected)
    rules.forEach(rule=>{
      // pour chaque règle transmise il faut créer un objet RuleToEvaluate qui sera évalué plus tard
      let ruleToEvaluate : RuleToEvaluate = {
        idRule : rule.id,
        order: rule.order,
        part: rule.part,
        condition: '',
        conditionFormated: '',
        command: '',
        outputValue: '',
        style: rule.style!,
        comment: rule.comment
      }
      if (rule.nestedCondition){
        // la condition principale vient en prérequis des sous-conditions
        ruleToEvaluate.condition = this.formatCondition(rule.ruleCondition.textCondition)+ ' and '
        // la commande principale vient en préfixe de la commande de la sous-condition
        ruleToEvaluate.command = rule.ruleCondition.ruleCommand.filter(rc=>rc.lang==languageSelected).length == 0? '' : rule.ruleCondition.ruleCommand.filter(rc=>rc.lang==languageSelected)[0].command
        // il faut maintenant rechercher les sous-conditions
        const observable = this.newRuleService.getSubConditionsFromDB(rule.ruleCondition.id).pipe(
          map((subConditions) => {subConditions.forEach(
            sc=> {
              //clone de ruleToEvaluate
              var subConditionToEvaluate = { ...ruleToEvaluate };
              subConditionToEvaluate.condition += sc.textCondition
              subConditionToEvaluate.conditionFormated = this.formatCondition(subConditionToEvaluate.condition)
              // si pas de commande dans la langue selectionnée alors on prend l'EN
              subConditionToEvaluate.command += sc.ruleCommand.filter(rc=>rc.lang==languageSelected).length == 0? sc.ruleCommand.filter(rc=>rc.lang=='EN').length == 0? 'No '+languageSelected+' or EN command found':sc.ruleCommand.filter(rc=>rc.lang=='EN')[0].command : sc.ruleCommand.filter(rc=>rc.lang==languageSelected)[0].command
              rulesToEvaluate.push(subConditionToEvaluate)
            })
          })
        );
    
        observables.push(observable);
      }else{
        // dans le cas d'une règle sans sous-condition
        ruleToEvaluate.condition = rule.ruleCondition.textCondition
        ruleToEvaluate.conditionFormated = this.formatCondition(rule.ruleCondition.textCondition)
        ruleToEvaluate.command = rule.ruleCondition.ruleCommand.filter(rc=>rc.lang==languageSelected).length == 0? 'No command found for '+languageSelected : rule.ruleCondition.ruleCommand.filter(rc=>rc.lang==languageSelected)[0].command
        rulesToEvaluate.push(ruleToEvaluate)
        //console.log(rulesToEvaluate)
      }
    })
    // permet d'attendre que l'ensemble des requêtes en BDD soient finies
    if (observables.length==0) return of(rulesToEvaluate)
    return forkJoin(observables).pipe(
      map(() => rulesToEvaluate)
    );
    //return rulesToEvaluate
  }
  

}