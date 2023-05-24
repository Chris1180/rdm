import { Injectable } from '@angular/core';
import { Rule } from '../model/rule';
import { OutputParametersList } from '../model/outputParameters/outputParametersList';

@Injectable({
  providedIn: 'root'
})
export class CheckRulesService {

  rules!: Array<Rule>;
  rulesApplied: Rule[] = [];
  form!: any;
  unknownInput: string[] = [];
  unknownOutput: string[] = [];

  constructor() { }

  checkCondition(allRules: Rule[]) {
    this.rules = allRules;
    // reinitialise la liste des règles
    this.rulesApplied = [];
    this.unknownInput = [];
    this.unknownOutput = [];
    
    // check des règles les unes après les autres pour formater la condition finale
    this.rules.forEach(r => {
      let finalCondition: string = "";
      // D'abord on analyse le champ Condition et on le formate de manière à pouvoir l'évaluer 
      finalCondition = this.formatCondition(r.condition);
      r.finalCondition = finalCondition
    }); // fin du foreach 
    return {unknownInput: this.unknownInput};
  }

  formatCondition(condition: string) {
    let finalCondition: string = "";
    // on commence par récupérer tous les mots-clés séparer par un espace
    let elements = condition.split(" ");
    
    for (let index = 0; index < elements.length; index++) {
      let element = elements[index].toLocaleUpperCase();
      let closingBracket = false;
      let doubleclosingBracket = false;
      // cas du TRUE / VRAI ...
      if (element === "TRUE" || element === "VRAI") {
        finalCondition += "true ";
        continue;
      }
      // cas du FALSE / FAUX ...
      if (element === "FALSE" || element === "FAUX") {
        finalCondition += "false ";
        continue;
      }
      // remplace la chaine NOT_ par !
      if (element.startsWith("NOT_")) {
        finalCondition += "!";
        element = element.replace("NOT_", "");
      }
      if (element.startsWith("((")){
        finalCondition += "((";
        element = element.replace("((", "");
      }
      if (element.startsWith("(")){
        finalCondition += "(";
        element = element.replace("(", "");
      }
      if (element.endsWith("))")){
        doubleclosingBracket = true;
        element = element.replace("))", "");
      }
      if (element.endsWith(")")){
        closingBracket = true;
        element = element.replace(")", "");
      }
      
      // teste les valeurs du Procedure Type
      if (element === "INI" || element === "COD" || element === "INL" || element === "DEC" || element === "REG") {
        finalCondition += element 
        if(closingBracket) finalCondition += ")"
        if(doubleclosingBracket) finalCondition += "))"
        finalCondition += " "
        continue;
      }
      // teste les valeurs du document type
      if (element === "RPCD" || element === "RPCF" || element === "OPCD" || element === "OPCF") {      
        finalCondition += element 
        if(closingBracket) finalCondition += ")"
        if(doubleclosingBracket) finalCondition += "))"
        finalCondition += " "
        continue;
      }
      // teste les valeurs de document status
      if (element === "ONGOING_DRAFT" || element === "FINALISED_DRAFT" || element === "SENT_TO_TOP" || element === "TABLED") {
        finalCondition += element 
        if(closingBracket) finalCondition += ")"
        if(doubleclosingBracket) finalCondition += "))"
        finalCondition += " "
        continue;
      }
      // teste les valeurs de Doc with Joint
      if (element === "JOINTCOMM" || element === "NOJOINTCOM") {
        finalCondition += element 
        if(closingBracket) finalCondition += ")"
        if(doubleclosingBracket) finalCondition += "))"
        finalCondition += " "
        continue;
      }
      // teste les valeurs de Doc With Assoc
      if (element === "ASSOCCOMM" || element === "NOASSOCCOMM") {
        finalCondition += element 
        if(closingBracket) finalCondition += ")"
        if(doubleclosingBracket) finalCondition += "))"
        finalCondition += " "
        continue;
      }
      // teste les valeurs de reading
      if (element === "FIRST_READING" || element === "SECOND_READING" || element === "THIRD_READING" || element === "RECAST") {
        finalCondition += element 
        if(closingBracket) finalCondition += ")"
        if(doubleclosingBracket) finalCondition += "))"
        finalCondition += " "
        continue;
      }
      // teste les valeurs de form
      if (element === "STANDARD" || element === "POSITION" || element === "LETTER") {
        finalCondition += element 
        if(closingBracket) finalCondition += ")"
        if(doubleclosingBracket) finalCondition += "))"
        finalCondition += " "
        continue;
      }

      // teste les valeurs de language

      if (element === "BG" || element === "ES" || element === "CS"
        || element === "DA" || element === "DE" || element === "ET"
        || element === "EL" || element === "EN" || element === "FR"
        || element === "GA" || element === "HR" || element === "IT"
        || element === "LV" || element === "LT" || element === "HU"
        || element === "MT" || element === "NL" || element === "PL"
        || element === "PT" || element === "RO" || element === "SK"
        || element === "SL" || element === "FI" || element === "SV"){
          finalCondition += element 
          if(closingBracket) finalCondition += ")"
          if(doubleclosingBracket) finalCondition += "))"
          finalCondition += " "
          continue;
      }
      // teste les valeurs de condition
      if (element == "OR") {
        finalCondition += "|| ";
        continue;
      }
      if (element == "AND") {
        finalCondition += "&& ";
        continue;
      }

      // aucune correspondance avec un champ Input n'a été trouvé on ajoute cet élément au tableau des règles n'étant pas évaluées
      // si il n'y est pas déjà
      
      if (element.length > 0 && element !== "IF"){
        finalCondition += element;
        if(closingBracket) finalCondition += ")"
        if(doubleclosingBracket) finalCondition += "))"
        finalCondition += " "
        if(this.unknownInput.indexOf(element) == -1)
          this.unknownInput.push(element);
      }
        
    }// fin du for

    return finalCondition
  }

  getOutputParameter(outputParam: string, idRule: number, initialValue: string){
    
    switch (outputParam.toLocaleUpperCase()){
      case OutputParametersList['[AUTHOR OF PROPOSAL]']:
        return this.form.authorOfProposal.join(", ");
      case OutputParametersList['[AUTHORING COMMITTEE]']:
        return this.form.authoringCommittee;
      case OutputParametersList['[DOC LANGUAGE]']:
        return this.form.docLanguage;
      case OutputParametersList['[DOC REF]']:
        return this.form.docRef;
      case OutputParametersList['[EPADES REF]']:
        return this.form.epadesRef;
      case OutputParametersList['[GENERATING DATE]']:
        return  this.form.generatingDate.day + "." + this.form.generatingDate.month + "." + this.form.generatingDate.year;
      case OutputParametersList['[ITER TITLE]']:
        return this.form.iterTitle.trim()==""? initialValue : this.form.iterTitle ;
      case OutputParametersList['[LEAD COMMITTEE]']:
        // le "for the" est ajouté dans l'enum pour les comités simples
        return this.form.leadCommittee;
      case OutputParametersList['[LIST OF ASSOC / RAPPORTEURS]']:
        let outputValue: string = '';
        for (let index = 0; index < this.form.listOfAssoc.length; index++) {
          outputValue += this.form.listOfAssoc[index] + "\n";
        }
        return outputValue;
      case OutputParametersList['[LIST OF RAPPORTEURS]']:
        return this.form.listOfRapporteurs.join(", ");
      case OutputParametersList['[PE NUMBER]']:
        return this.form.peNumber;
      case OutputParametersList['[PREFIX TITLE]']:
        return this.form.prefixTitle;
      case OutputParametersList['[PROCEDURE/AXX NUMBER]'] || "[PROCEDURE NUMBER]":
        return this.form.procedureNumber.trim()==""? initialValue : this.form.procedureNumber;
      case OutputParametersList['[SEND TO TOP DATE]']:
        return this.form.sendToTopDate.day + "." + this.form.sendToTopDate.month + "." + this.form.sendToTopDate.year;
      case OutputParametersList['[TABLING DATE]']:
        return this.form.tablingDate.day + "." + this.form.tablingDate.month + "." + this.form.tablingDate.year;
      case OutputParametersList['[DOC MULTI LANG]']:
        if (this.form.language == 'EN') {
          return this.rules.find(r => r.id == idRule)?.initialValue!;
        } else {
          return this.rules.find(r => r.id == idRule)?.languages.find(lang => lang.lang == this.form.language)?.value!;
        }
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
    }
    // ajout du paramètre manquant si pas déjà dans la liste
    if (this.unknownOutput.indexOf(outputParam)==-1){
      this.unknownOutput.push(outputParam)
    }
    return (outputParam)
  }

  evalRules(form: any, inputMissingParamMap: Map<string, boolean>){
    this.form = form;
    // mise à jour des variables d'entrée (INPUT PARAMETERS)
    // Procedure Type
    let INI: boolean = (this.form.procedureType == "INI");
    let COD: boolean = (this.form.procedureType == "COD");
    let INL: boolean = (this.form.procedureType == "INL");
    let DEC: boolean = (this.form.procedureType == "DEC");
    let REG: boolean = (this.form.procedureType == "REG");
    // Document Type
    let OPCD: boolean = (this.form.documentType == "OPCD");
    let OPCF: boolean = (this.form.documentType == "OPCF");
    let RPCD: boolean = (this.form.documentType == "RPCD");
    let RPCF: boolean = (this.form.documentType == "RPCF");
    // Document Status
    let ONGOING_DRAFT: boolean = (this.form.documentStatus == "ONGOING_DRAFT");
    let FINALISED_DRAFT: boolean = (this.form.documentStatus == "FINALISED_DRAFT");
    let SENT_TO_TOP: boolean = (this.form.documentStatus == "SENT_TO_TOP");
    let TABLED: boolean = (this.form.documentStatus == "TABLED");
    // Doc with Joint
    let JOINTCOMM: boolean = (this.form.docWithJoint == "JOINTCOMM");
    let NOJOINTCOM: boolean = (this.form.docWithJoint == "NOJOINTCOM")
    // Doc with Assoc
    let ASSOCCOMM: boolean = (this.form.docWithAssoc == "ASSOCCOMM");
    let NOASSOCCOMM: boolean = (this.form.docWithAssoc == "NOASSOCCOMM");
    // Reading
    let FIRST_READING: boolean = (this.form.reading == "FIRST_READING");
    let SECOND_READING: boolean = (this.form.reading == "SECOND_READING");
    let THIRD_READING: boolean = (this.form.reading == "THIRD_READING");
    let RECAST: boolean = (this.form.reading == "RECAST");
    // Form
    let STANDARD: boolean = (this.form.form == "STANDARD");
    let POSITION: boolean = (this.form.form == "POSITION");
    let LETTER: boolean = (this.form.form == "LETTER")
    // Language
    let BG: boolean = (this.form.language == "BG");
    let ES: boolean = (this.form.language == "ES");
    let CS: boolean = (this.form.language == "CS");
    let DA: boolean = (this.form.language == "DA");
    let DE: boolean = (this.form.language == "DE");
    let ET: boolean = (this.form.language == "ET");
    let EL: boolean = (this.form.language == "EL");
    let EN: boolean = (this.form.language == "EN");
    let FR: boolean = (this.form.language == "FR");
    let GA: boolean = (this.form.language == "GA");
    let HR: boolean = (this.form.language == "HR");
    let IT: boolean = (this.form.language == "IT");
    let LV: boolean = (this.form.language == "LV");
    let LT: boolean = (this.form.language == "LT");
    let HU: boolean = (this.form.language == "HU");
    let MT: boolean = (this.form.language == "MT");
    let NL: boolean = (this.form.language == "NL");
    let PL: boolean = (this.form.language == "PL");
    let PT: boolean = (this.form.language == "PT");
    let RO: boolean = (this.form.language == "RO");
    let SK: boolean = (this.form.language == "SK");
    let SL: boolean = (this.form.language == "SL");
    let FI: boolean = (this.form.language == "FI");
    let SV: boolean = (this.form.language == "SV");

    //Eval de la règle et ajout ou non à la liste rulesApplied
    //dans les rulesApplied le champ OutputValue est ce qui sera affiché en preview

    // on remplace la valeur des paramètres manquants par la valeur saisie par l'utilisateur
    if (inputMissingParamMap.size>0){
      this.rules.forEach(r=> {
        for (let [key, value] of inputMissingParamMap) {
          r.finalCondition = r.finalCondition.replace(" "+key+" ", " "+value.toString()+" ");
          //console.log(r.finalCondition);
        }
      })
    }
    // on évalue les conditions en remplissant rulesApllied et unknowoutput
    this.rules.forEach(r => {
      try {
        if (eval(r.finalCondition)) {
          
          console.log("Rule :" + r.id + " True => " + r.finalCondition);
          this.rulesApplied.push(r);
  
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
              r.outputValue += this.getOutputParameter(commandOutputParam, r.id, r.initialValue);
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
        console.error('SyntaxError on rule number : ' + r.id + "\nrule code is : " + r.condition) // It is a SyntaxError
      }
  
    }); // fin du foreach

    return {unknownOutput : this.unknownOutput, rulesApllied: this.rulesApplied};
  } // fin du eval rule
   

}




