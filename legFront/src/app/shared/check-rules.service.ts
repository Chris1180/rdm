import { Injectable } from '@angular/core';
import { Rule } from '../model/rule';

@Injectable({
  providedIn: 'root'
})
export class CheckRulesService {

  rules!: Array<Rule>;
  errorMessage!: string;
  rulesApplied: Rule[] = [];
  form!: any;

  constructor() { }

  check(form: any, allRules: Rule[]) {
    this.form = form;
    this.rules = allRules;
    this.CheckRules();
    return this.rulesApplied;
  }

  private CheckRules() {
    // reinitialise la liste des règles
    this.rulesApplied = [];
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

    // check des règles les unes après les autres

    this.rules.forEach(r => {
      let finalCondition: string = "";
      // D'abord on analyse le champ Condition et on le formate de manière à pouvoir l'évaluer 
      finalCondition = this.formatCondition(r.condition);

      //Eval de la règle et ajout ou non à la liste rulesApplied
      //dans les rulesApplied le champ OutputValue est ce qui sera affiché en preview
      try {
        if (eval(finalCondition)) {
          console.log("Rule :" + r.id + " True => " + finalCondition);

          if (r.command.includes('[')) {
            if (r.label.includes("of the")) {
              r.outputValue = "of the ".concat(this.getInputValue(r.command, r.initialValue, r.id));
            } else {
              r.outputValue = this.getInputValue(r.command, r.initialValue, r.id);
            }
          } else {
            // à modifier en fonction de la langue
            r.outputValue = r.initialValue;
          }

          if (r.label == "List Authoring Rapporteurs - Prefix" && !r.command.includes('[')) {
            this.form.prefixListOfRapporteurs = r.command;
            //console.info(this.form.prefixListOfRapporteurs)
          }

          if (r.label == "List Authoring Rapporteurs - Suffix" && !r.command.includes('[')) {
            this.form.suffixListOfRapporteurs = r.command;
          }

          // attention 
          if (r.label == "Justification Rule") {
            r.outputValue = r.command;
          }
          // 


          this.rulesApplied.push(r);
        } else {
          console.warn("Rule :" + r.id + " False => " + finalCondition);
        } // Try evaluating the code
      } catch (e) {

        console.error('A SyntaxError has been caught on rule number : ' + r.id + "\nrule code is : " + finalCondition) // It is a SyntaxError
      }

    }); // fin du foreach  
  }// fin de CheckRules()

  formatCondition(condition: string) {
    let finalCondition: string = "";
    // on commence par récupérer tous les mots-clés séparer par un espace
    let elements = condition.split(" ");
    for (let index = 0; index < elements.length; index++) {
      let element = elements[index];

      // cas du TRUE / VRAI ...
      if (element.toLocaleUpperCase().match("TRUE") || element.toLocaleUpperCase().match("VRAI")) {
        finalCondition += "true ";
        continue;
      }
      // remplace la chaine NOT_ par !
      if (element.toLocaleUpperCase().startsWith("NOT_")) {
        element = element.replace("NOT_", "!");
      }

      // teste les valeurs du Procedure Type
      if (element.toLocaleUpperCase().match("INI") || element.toLocaleUpperCase().match("COD") || element.toLocaleUpperCase().match("INL") || element.toLocaleUpperCase().match("DEC") || element.toLocaleUpperCase().match("REG")) {
        finalCondition += element.toLocaleUpperCase() + " ";
        continue;
      }
      // teste les valeurs du document type
      if (element.toLocaleUpperCase().match("RPCD") || element.toLocaleUpperCase().match("RPCF") || element.toLocaleUpperCase().match("OPCD") || element.toLocaleUpperCase().match("OPCF")) {
        finalCondition += element.toLocaleUpperCase() + " ";
        continue;
      }
      // teste les valeurs de document status
      if (element.toLocaleUpperCase().match("ONGOING_DRAFT") || element.toLocaleUpperCase().match("FINALISED_DRAFT") || element.toLocaleUpperCase().match("SENT_TO_TOP") || element.toLocaleUpperCase().match("TABLED")) {
        finalCondition += element.toLocaleUpperCase() + " ";
        continue;
      }
      // teste les valeurs de Doc with Joint
      if (element.toLocaleUpperCase().match("JOINTCOMM") || element.toLocaleUpperCase().match("NOJOINTCOM")) {
        finalCondition += element.toLocaleUpperCase() + " ";
        continue;
      }
      // teste les valeurs de Doc With Assoc
      if (element.toLocaleUpperCase().match("ASSOCCOMM") || element.toLocaleUpperCase().match("NOASSOCCOMM")) {
        finalCondition += element.toLocaleUpperCase() + " ";
        continue;
      }
      // teste les valeurs de reading
      if (element.toLocaleUpperCase().match("_READING") || element.toLocaleUpperCase().match("RECAST")) {
        finalCondition += element.toLocaleUpperCase() + " ";
        continue;
      }
      // teste les valeurs de form
      if (element.toLocaleUpperCase().match("STANDARD") || element.toLocaleUpperCase().match("POSITION") || element.toLocaleUpperCase().match("LETTER")) {
        finalCondition += element.toLocaleUpperCase() + " ";
        continue;
      }

      // teste les valeurs de language

      if (element.toLocaleUpperCase().match("BG") || element.toLocaleUpperCase().match("ES") || element.toLocaleUpperCase().match("CS")
        || element.toLocaleUpperCase().match("DA") || element.toLocaleUpperCase().match("DE") || element.toLocaleUpperCase().match("ET")
        || element.toLocaleUpperCase().match("EL") || element.toLocaleUpperCase().match("EN") || element.toLocaleUpperCase().match("FR")
        || element.toLocaleUpperCase().match("GA") || element.toLocaleUpperCase().match("HR") || element.toLocaleUpperCase().match("IT")
        || element.toLocaleUpperCase().match("LV") || element.toLocaleUpperCase().match("LT") || element.toLocaleUpperCase().match("HU")
        || element.toLocaleUpperCase().match("MT") || element.toLocaleUpperCase().match("NL") || element.toLocaleUpperCase().match("PL")
        || element.toLocaleUpperCase().match("PT") || element.toLocaleUpperCase().match("RO") || element.toLocaleUpperCase().match("SK")
        || element.toLocaleUpperCase().match("SL") || element.toLocaleUpperCase().match("FI") || element.toLocaleUpperCase().match("SV")
      ) {
        finalCondition += element.toLocaleUpperCase() + " ";
        continue;
      }
      // teste les valeurs de condition
      if (element.toLocaleLowerCase() == "or") {
        finalCondition += "|| ";
        continue;
      }
      if (element.toLocaleLowerCase() == "and") {
        finalCondition += "&& ";
        continue;
      }
    }// fin du for

    return finalCondition
  }


  getInputValue(command: string, initialValue: string, idRule: number) {
    // on met la valeur collecté dans initialvalue
    let outputValue: string = "";

    switch (command.trim()) {
      case "[Authoring Committee]":
        outputValue = this.form.authoringCommittee;
        break;
      case "[Epades Ref]":
        outputValue = this.form.epadesRef;
        break;
      case "[Document Language]":
        outputValue = this.form.docLanguage;
        break;
      case "[PE Number]":
        outputValue = this.form.peNumber;
        break;
      case "[Lead Committee]":
        outputValue = this.form.leadCommittee;
        break;
      case "[Procedure Number]":
        if (this.form.procedureNumber != "") outputValue = this.form.procedureNumber;
        else outputValue = initialValue;
        break;
      case "[Generation Date]":
        outputValue = this.form.generatingDate.day + "." + this.form.generatingDate.month + "." + this.form.generatingDate.year;
        break;
      case "[PREFIX_TITLE] + [ITER_TITLE]":
        if (this.form.iterTitle != "") outputValue = this.form.prefixTitle + " " + this.form.iterTitle;
        else outputValue = this.form.prefixTitle + " " + initialValue;
        break;
      case "with recommandation to the Commission [PREFIX_TITLE] + [ITER_TITLE]":
        outputValue = "with recommandation to the Commission " + this.form.prefixTitle + " " + this.form.iterTitle;
        break;
      case "on discharge in respect of the implementation [PREFIX_TITLE] + [ITER_TITLE]":
        outputValue = "on discharge in respect of the implementation " + this.form.prefixTitle + " " + this.form.iterTitle;
        break;
      case "On behalf of the [Authoring Committee]:":
        // prefixe ajouté à la liste des rapporteurs
        this.form.prefixListOfRapporteurs = "On behalf of the " + this.form.authoringCommittee;
        //this.form.listOfRapporteurs = "On behalf of the "+this.form.authoringCommittee+": "+this.form.listOfRapporteurs; 
        //initialValue = "";
        break;
      case "[List of Rapporters]":
        outputValue = ((this.form.prefixListOfRapporteurs != '' ? this.form.prefixListOfRapporteurs + ": " : "") + this.form.listOfRapporteurs.join(", ") + " " + this.form.suffixListOfRapporteurs).trim();
        break;
      case "[Sent-to-TOP date]":
        outputValue = this.form.sendToTopDate.day + "." + this.form.sendToTopDate.month + "." + this.form.sendToTopDate.year;
        break;
      case "[Tabling date]":
        outputValue = this.form.tablingDate.day + "." + this.form.tablingDate.month + "." + this.form.tablingDate.year;
        break;
      case "[Author(s) of the proposal]":
        outputValue = "Author(s) of the proposal: " + this.form.authorOfProposal;
        break;
      case "[List of Rapporteurs/Associated Committee]":
        for (let index = 0; index < this.form.listOfAssoc.length; index++) {
          outputValue += this.form.listOfAssoc[index] + "\n";
        }
        //console.info(initialValue)  
        break;
      case "[Doc Language]":
        // selon la valeur de [Doc Language] l'output value change
        console.log('---------------------------------------------------------------------------')
        console.log(this.form.docLanguage)
        console.log(this.rules.find(r => r.id == idRule)?.languages.find(lang => lang.lang == this.form.docLanguage)?.value)
        if (this.form.docLanguage == 'EN') {
          outputValue = this.rules.find(r => r.id == idRule)?.initialValue!;
        } else {
          outputValue = this.rules.find(r => r.id == idRule)?.languages.find(lang => lang.lang == this.form.docLanguage)?.value!;
        }
        // outputValue = this.form.authorOfProposal;  
        break;
      default:
        outputValue = "not defined";
        break;
    }
    return outputValue;
  }


}




