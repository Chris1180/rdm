import { Injectable } from "@angular/core";
import { NewRule } from "../model/newrule";
import { ConditionService } from "./condition.service";
import { Condition } from "../model/condition";
import { Command } from "../model/command";
import { CommandService } from "./command.service";
import { outputParametersListFromTheForm } from "../model/outputParameters/outputParametersListFromTheForm";
import { NewRulesService } from "./newrules.service";
import { Observable, forkJoin, map, of } from "rxjs";
import { RuleToEvaluate } from "../model/ruleToEvaluate";

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
  listOfKnownParamFromTheForm = [
    "||", "&&", "true", "false" , "",
    "INI", "COD", "INL", "DEC", "REG",
    "RPCD", "RPCF", "OPCD", "OPCF",
    "ONGOING_DRAFT", "FINALISED_DRAFT", "SENT_TO_TOP", "AFTER_VOTE", "TABLED",
    "ACJOINTCOM","LCJOINTCOM",
    "ASSOCOM",
    "FIRST_READING", "SECOND_READING", "THIRD_READING", "RECAST",
    "NA","AMEND", "APPROVE_APP", "REJECT_REJ",
    "LETTERS", "LETTER", "POSITION", "POSITIONS", "OPINION", "OPINIONS",
    "BG", "ES", "CS", "DA", "DE", "ET", "EL", "EN", "FR", "GA", "HR", "IT", "LV", "LT", "HU", "MT", "NL", "PL", "PT", "RO", "SK", "SL", "FI", "SV",
    "AUTHCOM_MAN","AUTHCOM_MEN","AUTHCOM_WOMAN","AUTHCOM_WOMEN","AUTHCOM_BOTH",
    "ASSOCOM_MAN","ASSOCOM_MEN","ASSOCOM_WOMAN","ASSOCOM_WOMEN","ASSOCOM_BOTH"
  ]
  listOfOutputParamFromDB: Command[] = [];
  

  constructor(private conditionService: ConditionService, private commandService: CommandService, private newRuleService: NewRulesService) {
    // récupération des conditions (input param) de la Base de donnée dans le tableau listOfKnownParam
    this.conditionService.getConditionsFromDB().subscribe({
      next: (conditionsFromDB: Condition[]) => { 
        conditionsFromDB.forEach(c => {
        this.listOfKnownParam.push(c.name)
        }); 
      },
      error: (err) => {
        console.log("Error during back end request for list of conditions")
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
        
        //si l'input param n'est pas dans la liste des KnownParam du form alors on met à jour les tableaux de suivi
        if (this.listOfKnownParamFromTheForm.indexOf(paramTobeChecked) == -1 ) {
          console.log('ajout de  '+ paramTobeChecked)
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
/*
          let commandOutputParam : string ="";
          let outputCommand : boolean = false;
          r.outputValue = "";
          // parcour de la chaine de caratère command pour en extraire les infos
          for (let index = 0; index < r.command.length; index++) {
            const char = r.command[index];
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
          } // fin du for */
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
      case outputParametersListFromTheForm['PROCEDURE NUMBER']:
        return previewForm.get('procedureNumber').value.trim()==""? initialValue : previewForm.get('procedureNumber').value;
      case outputParametersListFromTheForm['GENERATING DATE']:
        return  previewForm.get('generatingDate').value.day + "." + previewForm.get('generatingDate').value.month + "." + previewForm.get('generatingDate').value.year;
      case outputParametersListFromTheForm['SEND TO TOP DATE']:
        return previewForm.get('sendToTopDate').value.day + "." + previewForm.get('sendToTopDate').value.month + "." + previewForm.get('sendToTopDate').value.year
      case outputParametersListFromTheForm['TABLING DATE']:
        return previewForm.get('tablingDate').value.day + "." + previewForm.get('tablingDate').value.month + "." + previewForm.get('tablingDate').value.year
      case outputParametersListFromTheForm['PE NUMBER']:
        return previewForm.get('peNumber').value;
      case outputParametersListFromTheForm['AXX NUMBER']:
        return previewForm.get('axxNumber').value.trim()==""? initialValue : previewForm.get('axxNumber').value;
      case outputParametersListFromTheForm['EPADES REF']:
        return previewForm.get('epadesRef').value;
      case outputParametersListFromTheForm['DOC LANGUAGE']:
        return previewForm.get('docLanguage').value;
      case outputParametersListFromTheForm['PREFIX TITLE']:
        return previewForm.get('prefixTitle').value;
      case outputParametersListFromTheForm['ITER TITLE']:
        return previewForm.get('iterTitle').value.trim()==""? initialValue : previewForm.get('iterTitle').value;
      case outputParametersListFromTheForm['DOC COM REF']:
        return previewForm.get('docComRef').value.trim()==""? initialValue : previewForm.get('docComRef').value;
      case outputParametersListFromTheForm['DOC COUNCIL REF']:
        return previewForm.get('docCouncilRef').value.trim()==""? initialValue : previewForm.get('docCouncilRef').value;
      case outputParametersListFromTheForm['AUTHOR OF PROPOSAL']:
        return previewForm.get('authorOfProposal').value.join(", ");

      // valeur du tableau  
      case outputParametersListFromTheForm['AUTHORING COMMITTEE']:
        return previewForm.get('authoringCommittee').value;
      case outputParametersListFromTheForm['LEAD COMMITTEE']:
        // le "for the" est ajouté dans l'enum pour les comités simples
        return previewForm.get('leadCommittee').value;
      case outputParametersListFromTheForm['RAPPORTEURS / LIST OF ASSOC']:
        // formattage de la sortie ecran: 'noms des rapporteurs' , committe on 'le nom du committee'
        let outputValue: string = '';
        for (let index = 0; index < previewForm.get('listOfAssoc').value.length; index++) {
          outputValue += previewForm.get('listOfAssocRapporteurs').value[index]+ ', committee on ' + previewForm.get('listOfAssoc').value[index] + "\n";
        }
        return outputValue;
      case outputParametersListFromTheForm['LIST OF RAPPORTEURS']:
        return previewForm.get('listOfRapporteurs').value.join(", ");
      
      // to be checked if used
      case outputParametersListFromTheForm['PREFIX LIST OF RAPPORTEURS']:
        if (initialValue=='') return previewForm.prefixListOfRapporteurs;
        else {
          previewForm.prefixListOfRapporteurs = initialValue;
          return '';
        }
      case outputParametersListFromTheForm['SUFFIX LIST OF RAPPORTEURS']:
        if (initialValue=='') return previewForm.suffixListOfRapporteurs;
        else {
          previewForm.suffixListOfRapporteurs = initialValue;
          return '';
        }
      // end of to be checked
      
      case outputParametersListFromTheForm['COMMITTEE HAVING OPINION']:
        return 'Committee on '+previewForm.get('opinions').value;
      case outputParametersListFromTheForm['LIST OF COMMITTEES HAVING OPINION']:
        return 'the Committee on '+previewForm.get('opinions').value.join(", the Committee on ").replace( /(.*)\,/gm, '$1 and');
      case outputParametersListFromTheForm['COMMITTEE HAVING POSITION']:
        return 'the Committee on '+previewForm.get('positions').value;
      case outputParametersListFromTheForm['LIST OF COMMITTEES HAVING POSITION']:
        return 'the Committee on '+previewForm.get('positions').value.join(", the Committee on ").replace( /(.*)\,/gm, '$1 and');
      case outputParametersListFromTheForm['COMMITTEE HAVING LETTER']:
        return 'the Committee on '+previewForm.get('letters').value;
      case outputParametersListFromTheForm['LIST OF COMMITTEES HAVING LETTER']:
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
        style: rule.style!
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
  
  //Méthode qui regarde dans les sous-conditions les Input manquants
  /*
  checkSubCondition(rules: NewRule[]): Observable<string[]> {
    const observables: Observable<void>[] = [];
  
    rules.forEach(r => {
      const observable = this.newRuleService.getSubConditionsFromDB(r.ruleCondition.id).pipe(
        map(subCond => {
          subCond.forEach(sc => {
            let scformated = this.formatCondition(sc.textCondition);
            let scformatedSplitted = scformated.split(" ");
  
            scformatedSplitted.forEach(input => {
              var re = /[(!)\s]+/g;
              let paramTobeChecked = input.replace(re, "");
  
              if (this.listOfKnownParam.indexOf(paramTobeChecked) == -1) {
                if (this.unknownInput.indexOf(paramTobeChecked) == -1) {
                  this.unknownInput.push(paramTobeChecked);
                }
              }
            });
          });
        })
      );
  
      observables.push(observable);
    });
  
    // permet d'attendre que l'ensemble des requêtes en BDD soient finies
    return forkJoin(observables).pipe(
      map(() => this.unknownInput)
    );
  }*/

}