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
  rulesWithUnknownInput: number[] = [];
  unknownOutput: string[] = [];

  constructor() { }

  checkCondition(allRulesFromSelectedPart: Rule[], selectedPart: string) {
    this.rules = allRulesFromSelectedPart;
    // reinitialise la liste des règles
    this.rulesApplied = [];
    this.unknownInput = [];
    this.rulesWithUnknownInput = [];
    this.unknownOutput = [];
    
    // check des règles les unes après les autres pour formater la condition finale
    this.rules.forEach(r => {
      if (r.part==selectedPart) {
        let finalCondition: string = "";
      // D'abord on analyse le champ Condition et on le formate de manière à pouvoir l'évaluer 
      finalCondition = this.formatCondition(r.condition, r.id);
      r.finalCondition = finalCondition
      }
      
    }); // fin du foreach 
    return {unknownInput: this.unknownInput, rulesWithUnknownInput: this.rulesWithUnknownInput};
  }

  formatCondition(condition: string, id: number) {
    let finalCondition: string = "";
    let param: string = "";
    let listOfKnownParam = [
      "||", "&&", "true", "false" , "",
      "INI", "COD", "INL", "DEC", "REG",
      "RPCD", "RPCF", "OPCD", "OPCF",
      "ONGOING_DRAFT", "FINALISED_DRAFT", "SENT_TO_TOP", "AFTER_VOTE", "TABLED",
      "JOINTCOM",
      "ASSOCOM",
      "FIRST_READING", "SECOND_READING", "THIRD_READING", "RECAST",
      "NA","AMEND", "APPROVE_APP", "REJECT_REJ",
      "LETTERS", "LETTER", "POSITION", "POSITIONS", "OPINION", "OPINIONS",
      "BG", "ES", "CS", "DA", "DE", "ET", "EL", "EN", "FR", "GA", "HR", "IT", "LV", "LT", "HU", "MT", "NL", "PL", "PT", "RO", "SK", "SL", "FI", "SV",
      "AUTHCOM_MAN","AUTHCOM_MEN","AUTHCOM_WOMAN","AUTHCOM_WOMEN","AUTHCOM_BOTH",
      "ASSOCOM_MAN","ASSOCOM_MEN","ASSOCOM_WOMAN","ASSOCOM_WOMEN","ASSOCOM_BOTH"
    ]
    // on parcour la chaine caractère par caractère
    //console.log("condition initiale:")
    //console.log(condition)
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
        if (listOfKnownParam.indexOf(paramTobeChecked) == -1) {
          if(this.unknownInput.indexOf(paramTobeChecked) == -1)
          this.unknownInput.push(paramTobeChecked);
          if(this.rulesWithUnknownInput.indexOf(id) == -1)
          this.rulesWithUnknownInput.push(id)
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

  getOutputParameter(outputParam: string, idRule: number, initialValue: string){
    
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
        return this.form.listOfAssocRapporteurs;
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
      case OutputParametersList['[COMMITTEE HAVING OPINION]']:
        return this.form.opinions;
      case OutputParametersList['[LIST OF COMMITTEES HAVING OPINION]']:
        return this.form.opinions.join(", ");
      case OutputParametersList['[COMMITTEE HAVING POSITION]']:
        return this.form.positions;
      case OutputParametersList['[LIST OF COMMITTEES HAVING POSITION]']:
        return this.form.positions.join(", ");
      case OutputParametersList['[COMMITTEE HAVING LETTER]']:
        return this.form.letters;
      case OutputParametersList['[LIST OF COMMITTEES HAVING LETTER]']:
        return this.form.letters.join(", ");
      
    }// fin du switch
    // ajout du paramètre manquant si pas déjà dans la liste
    if (this.unknownOutput.indexOf(outputParam)==-1){
      this.unknownOutput.push(outputParam)
    }
    return (outputParam)
  }

  evalRules(form: any, inputMissingParamMap: Map<string, boolean>, rulesWithUnknownInput: number[], partSelectedForPreview: string){
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
    let AFTER_VOTE: boolean = (this.form.documentStatus == "AFTER_VOTE");
    let TABLED: boolean = (this.form.documentStatus == "TABLED");
    let authoringCommittee = String(this.form.authoringCommittee);
    let JOINTCOM: boolean = (authoringCommittee.startsWith('Joint'));
    
    // Doc with Assoc (le champ docWithAssoc du formulaire ne sera plus utilisé puisque déterminé par la valeur du tableau 'List of Assoc')
    let listOfAssoc = String(this.form.listOfAssoc).split(',')
    let ASSOCOM: boolean = (listOfAssoc.length === 1 && listOfAssoc[0].length!=0)|| listOfAssoc.length>1;

    // Reading
    let FIRST_READING: boolean = (this.form.reading == "FIRST_READING");
    let SECOND_READING: boolean = (this.form.reading == "SECOND_READING");
    let THIRD_READING: boolean = (this.form.reading == "THIRD_READING");
    let RECAST: boolean = (this.form.reading == "RECAST");
    // DocLegSpecialization
    let NA: boolean = (this.form.docLegSpecialization == "NA");
    let AMEND: boolean = (this.form.docLegSpecialization == "AMEND");
    let APPROVE_APP: boolean = (this.form.docLegSpecialization == "APPROVE_APP");
    let REJECT_REJ: boolean = (this.form.docLegSpecialization == "REJECT_REJ");
    // Form
    //let STANDARD: boolean = (this.form.form == "STANDARD");
    //let POSITION: boolean = (this.form.form == "POSITION");
    //let LETTER: boolean = (this.form.form == "LETTER")
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
    
    // Drafting Letter
    let letters = String(this.form.letters).split(',')
    let LETTER: boolean = (letters.length === 1 && letters[0].length!=0); 
    let LETTERS: boolean = (letters.length > 1);
    // Drafting Opinion
    let opinions = String(this.form.opinions).split(',')
    let OPINION: boolean = (opinions.length === 1 && opinions[0].length!=0);
    let OPINIONS: boolean = (opinions.length > 1);
    // Drafting Position
    let positions = String(this.form.positions).split(',')
    let POSITION: boolean = (positions.length === 1 && positions[0].length!=0); 
    let POSITIONS: boolean = (positions.length > 1);
    // Title for Authoring Committe
    let AUTHCOM_MAN: boolean = this.form.listOfRapporteursTitle == 'M'
    let AUTHCOM_MEN: boolean = this.form.listOfRapporteursTitle == 'MM'
    let AUTHCOM_WOMAN: boolean = this.form.listOfRapporteursTitle == 'F'
    let AUTHCOM_WOMEN: boolean = this.form.listOfRapporteursTitle == 'FF'
    let AUTHCOM_BOTH: boolean = this.form.listOfRapporteursTitle == 'MF'
    // Title for ASSOCOM Committe
    let ASSOCOM_MAN: boolean = this.form.listOfAssocRapporteursTitle == 'M'
    let ASSOCOM_MEN: boolean = this.form.listOfAssocRapporteursTitle == 'MM'
    let ASSOCOM_WOMAN: boolean = this.form.listOfAssocRapporteursTitle == 'F'
    let ASSOCOM_WOMEN: boolean = this.form.listOfAssocRapporteursTitle == 'FF'
    let ASSOCOM_BOTH: boolean = this.form.listOfAssocRapporteursTitle == 'MF'

    // on remplace la valeur des paramètres manquants par la valeur saisie par l'utilisateur
    if (inputMissingParamMap.size>0){
      //console.log(rulesWithUnknownInput)

      this.rulesWithUnknownInput.forEach(rid=>{
        // on récupère la règle dans la liste
        let rule = this.rules.find( ({id}) => id === rid);
        
        // on vérifie pour chaque input manquant si dans la règle il faut changer le finalcondition
        for (let [key, value] of inputMissingParamMap) {
          //rule!.finalCondition = rule!.finalCondition.replace(" "+key+" ", " "+value.toString()+" ");
          rule!.finalCondition = rule!.finalCondition.replace(key,value.toString());            
        }
        //console.log(rule)
      })

    }
    //console.log(this.rules)
    // on évalue les conditions en remplissant rulesApllied et unknowoutput
    this.rules.forEach(r => {
      if(partSelectedForPreview==r.part){
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
          console.error('SyntaxError on rule number : ' + r.id + "\nrule code is : " + r.condition + "\nfinal condition is : " + r.finalCondition) // It is a SyntaxError
        }
      }
      
  
    }); // fin du foreach

    return {unknownOutput : this.unknownOutput, rulesApllied: this.rulesApplied};
  } // fin du eval rule
   

}




