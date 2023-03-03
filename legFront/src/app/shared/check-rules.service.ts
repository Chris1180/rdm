import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Rule } from '../model/rule';
import { RulesService } from './rules.service';

@Injectable({
  providedIn: 'root'
})
export class CheckRulesService {

  rules!: Array<Rule>;
  errorMessage!: string;
  rulesApplied: Rule[] = [];
  form! : any;

  constructor(private ruleService: RulesService) { }

  check(form : any) {
    this.form=form;
    // vérifie si le service est déjà initialisé avec les infos du Back-End
    if (!this.ruleService.getRules()) {
      console.log('init component for the first time')
      this.ruleService.initCompo().subscribe({
        next: (data) => {
          //initialise le service avec les info du Back-End
          this.ruleService.setRules(data);
        },
        error: (err) => {
          this.errorMessage = err;
          console.log("Une erreur est remontée" + this.errorMessage);
        },
        complete: ()=>{
          this.rules = this.ruleService.getAllRules();
          //console.log(this.rules);
          this.CheckRules();
        }
      });
    }else{
      console.log("component already initialized");
      this.rules = this.ruleService.getAllRules();
      //console.log(this.rules);
      this.CheckRules();
    }

    
  }// end of check

  CheckRules(){
    // reinitialise la liste des règles
    this.rulesApplied = []; 
    // mise à jour des variables d'entrée
    // Procedure Type
    let INI : boolean = (this.form.procedureType == "INI");
    let COD : boolean = (this.form.procedureType == "COD");
    let INL : boolean = (this.form.procedureType == "INL");
    let DEC : boolean = (this.form.procedureType == "DEC");
    let REG : boolean = (this.form.procedureType == "REG");
    // Document Type
    let OPCD : boolean = (this.form.documentType == "OPCD");
    let OPCF : boolean = (this.form.documentType == "OPCF");
    let RPCD : boolean = (this.form.documentType == "RPCD");
    let RPCF : boolean = (this.form.documentType == "RPCF");
    // Document Status
    let ONGOING_DRAFT : boolean = (this.form.documentStatus == "ONGOING_DRAFT");
    let FINALISED_DRAFT : boolean = (this.form.documentStatus == "FINALISED_DRAFT");
    let SENT_TO_TOP : boolean = (this.form.documentStatus == "SENT_TO_TOP");
    let TABLED : boolean = (this.form.documentStatus == "TABLED");
    // Doc with Joint
    let JOINTCOMM : boolean = (this.form.docWithJoint == "JOINTCOMM");
    let NOJOINTCOM : boolean = (this.form.docWithJoint == "NOJOINTCOM")
    // Doc with Assoc
    let ASSOCCOMM : boolean = (this.form.docWithAssoc == "ASSOCCOMM");
    let NOASSOCCOMM : boolean = (this.form.docWithAssoc == "NOASSOCCOMM");
    // Reading
    let FIRST_READING : boolean = (this.form.reading == "FIRST_READING");
    let SECOND_READING : boolean = (this.form.reading == "SECOND_READING");
    let THIRD_READING : boolean = (this.form.reading == "THIRD_READING");
    let RECAST : boolean = (this.form.reading == "RECAST");
    // Form
    let STANDARD : boolean = (this.form.form == "STANDARD");
    let POSITION : boolean = (this.form.form == "POSITION");
    let LETTER : boolean = (this.form.form == "LETTER")
    
    
    // check des règles les unes après les autres
    this.rules.forEach(r => {
      if (r.condition.trim() == "VRAI" || r.condition.trim() == "TRUE" || r.condition.trim() == ""){
        if (r.command.startsWith('[')){
          r.outputValue = this.getInputValue(r.command, r.initialValue);
        }else{
          r.outputValue = r.initialValue;
        }
        console.log("eval true "+ r.condition.trim() + " => "+ r.id);
        this.rulesApplied.push(r);
      }else {
        // analyse de la condition
        // on commence par récupérer tous les mots-clés séparer par un espace
        let elements = r.condition.split(" ");
        let finalCondition = "";
        for (let index = 0; index < elements.length; index++) {
          let element = elements[index];
          // remplace la chaine NOT_ par !
          if (element.toLocaleUpperCase().startsWith("NOT_")) {
            element = element.replace("NOT_","!");
          }

          // teste les valeurs du Procedure Type
          if (element.toLocaleUpperCase().includes("INI") || element.toLocaleUpperCase().includes("COD") || element.toLocaleUpperCase().includes("INL") || element.toLocaleUpperCase().includes("DEC") || element.toLocaleUpperCase().includes("REG")) {
            finalCondition += element.toLocaleUpperCase()+ " ";
          } 
          // teste les valeurs du document type
          if (element.toLocaleUpperCase().includes("RPCD") || element.toLocaleUpperCase().includes("RPCF") || element.toLocaleUpperCase().includes("OPCD") || element.toLocaleUpperCase().includes("OPCF")) {
            finalCondition += element.toLocaleUpperCase()+ " ";
          } 
          // teste les valeurs de document status
          if (element.toLocaleUpperCase().includes("ONGOING_DRAFT") || element.toLocaleUpperCase().includes("FINALISED_DRAFT") || element.toLocaleUpperCase().includes("SENT_TO_TOP") || element.toLocaleUpperCase().includes("TABLED") ) {
            finalCondition += element.toLocaleUpperCase()+ " ";
          }
          // teste les valeurs de Doc with Joint
          if (element.toLocaleUpperCase().includes("JOINTCOMM") || element.toLocaleUpperCase().includes("NOJOINTCOM")) {
            finalCondition += element.toLocaleUpperCase()+ " ";
          }
          // teste les valeurs de Doc With Assoc
          if (element.toLocaleUpperCase().includes("ASSOCCOMM") || element.toLocaleUpperCase().includes("NOASSOCCOMM")) {
            finalCondition += element.toLocaleUpperCase()+ " ";
          }
          // teste les valeurs de reading
          if (element.toLocaleUpperCase().includes("_READING") || element.toLocaleUpperCase().includes("RECAST")) {
            finalCondition += element.toLocaleUpperCase()+ " ";
          }
          // teste les valeurs de form
          if (element.toLocaleUpperCase().includes("STANDARD") || element.toLocaleUpperCase().includes("POSITION") || element.toLocaleUpperCase().includes("LETTER")) {
            finalCondition += element.toLocaleUpperCase()+ " ";
          }
          // teste les valeurs de condition
          if (element.toLocaleLowerCase() == "or") {
            finalCondition += "|| ";
          }
          if (element.toLocaleLowerCase() == "and") {
            finalCondition += "&& ";
          }
          
        } // fin du for

        //console.log(this.form.procedureType);
        //ajout ou non de la règle à la liste rulesApplied
        try {
          if (eval(finalCondition)) {
            console.log("eval true "+ finalCondition + " => "+ r.id);
            
            if (r.command.includes('[')){
              if(r.label.includes("of the")){
                r.outputValue = "of the ".concat(this.getInputValue(r.command, r.initialValue));
              }else{
                r.outputValue = this.getInputValue(r.command, r.initialValue);
              }  
            }else {
              r.outputValue = r.initialValue;
            }

            if (r.label == "List Authoring Rapporteurs - Prefix" && !r.command.includes('[')) {
              this.form.prefixListOfRapporteurs = r.command;
              //console.info(this.form.prefixListOfRapporteurs)
            }

            if (r.label == "List Authoring Rapporteurs - Suffix" && !r.command.includes('[')) {
              this.form.suffixListOfRapporteurs = r.command;
            }

            if(r.label == "Justification Rule"){
              r.outputValue = r.command;
            }
            this.rulesApplied.push(r);
          }else {
            console.log("eval false "+ finalCondition + " => "+ r.id);
          } // Try evaluating the code
        } catch (e) {
                   
          console.error('A SyntaxError has been caught on rule number : '+r.id+ "\nrule code is : "+finalCondition) // It is a SyntaxError
        }
        
        
        // affichage de la condition pour debug
        //console.log(r.id+ " "+finalCondition);


      }// fin du else


    });  
  }

  getRulesApplied(){
    return this.rulesApplied;
  }


  getInputValue (command : string, initialValue : string){
     // on met la valeur collecté dans initialvalue
     let outputValue : string =""; 
     
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
        if (this.form.procedureNumber!="") outputValue = this.form.procedureNumber; 
        else outputValue = initialValue;
      break;
      case "[Generation Date]":
        outputValue = this.form.generatingDate.day+"."+this.form.generatingDate.month+"."+this.form.generatingDate.year;  
      break;
      case "[PREFIX_TITLE] + [ITER_TITLE]":
        if (this.form.iterTitle!="") outputValue = this.form.prefixTitle+" "+this.form.iterTitle;
        else outputValue =  this.form.prefixTitle+" "+ initialValue;
      break;
      case "with recommandation to the Commission [PREFIX_TITLE] + [ITER_TITLE]":
        outputValue = "with recommandation to the Commission "+this.form.prefixTitle+" "+this.form.iterTitle;  
      break;
      case "on discharge in respect of the implementation [PREFIX_TITLE] + [ITER_TITLE]":
        outputValue = "on discharge in respect of the implementation "+this.form.prefixTitle+" "+this.form.iterTitle;  
      break;
      case "On behalf of the [Authoring Committee]:":
        // prefixe ajouté à la liste des rapporteurs
        this.form.prefixListOfRapporteurs = "On behalf of the "+this.form.authoringCommittee;
        //this.form.listOfRapporteurs = "On behalf of the "+this.form.authoringCommittee+": "+this.form.listOfRapporteurs; 
        //initialValue = "";
      break;
      case "[List of Rapporters]":
        outputValue = ((this.form.prefixListOfRapporteurs!=''? this.form.prefixListOfRapporteurs+": ":"")+this.form.listOfRapporteurs+" "+this.form.suffixListOfRapporteurs).trim();  
      break;
      case "[Sent-to-TOP date]":
        outputValue = this.form.sendToTopDate.day+"."+this.form.sendToTopDate.month+"."+this.form.sendToTopDate.year;  
      break;
      case "[Sent-to-TRAD date]":
        outputValue = this.form.sendToTradDate.day+"."+this.form.sendToTradDate.month+"."+this.form.sendToTradDate.year;  
      break;
      case "[Author(s) of the proposal]":
        outputValue = "Author(s) of the proposal: "+this.form.authorOfProposal;  
      break;
      case "[List of Rapporteurs/Associated Committee]":            
        for (let index = 0; index < this.form.listOfAssoc.length; index++) {
          outputValue += this.form.listOfAssoc[index]+"\n";
        }
        //console.info(initialValue)  
      break;
      default:
        outputValue = "not defined";
        break;
    }
    return outputValue;
  }


}




