import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { DocumentStatus } from 'src/app/model/inputParameters/documentStatus';
import { DocumentType } from 'src/app/model/inputParameters/documentType';
import { DocWithAssoc } from 'src/app/model/inputParameters/docWithAssoc';
import { DocWithJoint } from 'src/app/model/inputParameters/docWithJoint';
import { Form } from 'src/app/model/inputParameters/form';
import { Language } from 'src/app/model/inputParameters/language';
import { ProcedureType } from 'src/app/model/inputParameters/procedureType';
import { Reading } from 'src/app/model/inputParameters/reading';
import { AuthoringCommittee } from 'src/app/model/outputParameters/authoringCommittee';
import { LeadCommittee } from 'src/app/model/outputParameters/leadCommittee';
import { ListOfAssoc } from 'src/app/model/outputParameters/listOfAssoc';
import { ListOfRapporteurs } from 'src/app/model/outputParameters/listOfRapporteurs';
import { OutputLanguage } from 'src/app/model/outputParameters/outputLanguage';
import { Rule } from 'src/app/model/rule';
import { CheckRulesService } from 'src/app/shared/check-rules.service';
import { RulesService } from 'src/app/shared/rules.service';
import { AppDataState, RuleStateEnum } from 'src/app/shared/rules.state';

declare var window: any;

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {

  rulesDataState$!: Observable<AppDataState<Rule[]>>;
  readonly RuleStateEnum=RuleStateEnum;
  previewForm! : FormGroup;
  procedureType = ProcedureType;
  documentType = DocumentType;
  documentStatus = DocumentStatus;
  docWithJoint = DocWithJoint;
  docWithAssoc = DocWithAssoc;
  reading = Reading;
  form = Form;
  language = Language;
  outputLanguage = OutputLanguage; 
  authoringCommittee = AuthoringCommittee;
  leadCommittee = LeadCommittee;
  listOfRapporteurs = ListOfRapporteurs;
  listOfAssoc = ListOfAssoc;
  // utilisé pur mettre la valeur du jour par defaut dans le datePicker
  d = new Date();
  allRules! : Rule[];
  rulesApplied! : Rule[];
  errorMessage?: string;
  // modal pour demander des valeurs suplémentaires
  previewModal: any;
  inputModal: any;
  outputModal: any;
  outputMissingParam = new Map<string, string>();

  constructor(private checkRules: CheckRulesService, private ruleService: RulesService) { }

  ngOnInit(): void {
    
    this.rulesDataState$ = this.ruleService.getRulesFromDB().pipe(
      map(data=>{
        this.ruleService.setRules(data);
        this.allRules = data;
        return ({dataState:RuleStateEnum.LOADED,data:data}) // lorsque des données sont reçues on retourne les data et le state
      }),
      startWith({dataState:RuleStateEnum.LOADING}),  // startWith est retourné dès que le pipe est executé
      catchError(err=>of({dataState:RuleStateEnum.ERROR, errorMessage:err.message}))
    )
    
    this.rulesDataState$.subscribe()
    this.previewModal = new window.bootstrap.Modal(document.getElementById('previewModal'));
    this.outputModal = new window.bootstrap.Modal(document.getElementById('outputModal'));

    this.previewForm = new FormGroup({
      procedureType : new FormControl('INI'),
      documentType : new FormControl('OPCD'),
      documentStatus : new FormControl('ONGOING_DRAFT'),
      docWithJoint : new FormControl('NOJOINTCOM'),
      docWithAssoc : new FormControl('NOASSOCCOMM'),
      reading : new FormControl('FIRST_READING'),
      form : new FormControl('STANDARD'),
      language : new FormControl('EN'),
      procedureNumber : new FormControl('2023/0011(INI)'),
      generatingDate : new FormControl({
        year: this.d.getFullYear(),
        month: this.d.getMonth()+1,
        day: this.d.getDate(),
      }),
      sendToTopDate : new FormControl({
        year: this.d.getFullYear(),
        month: this.d.getMonth()+1,
        day: this.d.getDate(),
      }),
      tablingDate : new FormControl({
        year: this.d.getFullYear(),
        month: this.d.getMonth()+1,
        day: this.d.getDate(),
      }),
      peNumber : new FormControl('PE234.334v01.00'),
      docRef : new FormControl('2022/057(INI)'),
      epadesRef : new FormControl('PR\\1269845EN.docx'),
      docLanguage : new FormControl('EN'),
      prefixTitle : new FormControl('on'),
      iterTitle : new FormControl('lessons learnt from the Pandora Papers and other revelations'),
      authoringCommittee : new FormControl('Committee on Constitutional Affairs'),
      leadCommittee : new FormControl('for the Committee on Constitutional Affairs'),
      prefixListOfRapporteurs : new FormControl(''),
      listOfRapporteurs : new FormControl(['Jan Mulder']),
      suffixListOfRapporteurs : new FormControl(''),
      authorOfProposal : new FormControl(['Sara Matthieu']),
      listOfAssoc : new FormControl(["Colm Markey, Committee on Transport and Tourism"]),
    });
  }// fin du ngOnInit


  onSubmit(){
    //console.log(this.previewForm.get('listOfRapporteurs')?.value);
    let checkResult : {rulesApplied :Rule[], unknownOutput: string[], unknownInput: Rule[]};
    checkResult = this.checkRules.check(this.previewForm.value, this.ruleService.getAllRules());
    this.rulesApplied = checkResult.rulesApplied;
    console.log (checkResult.unknownInput)
    //console.log (checkResult.unknownOutput)
    if(checkResult.unknownOutput.length==0){
      // pas de valeur Output inconnue
      this.previewModal.show();
    }else{
      // des valeurs de Output Param sont manquantes
      // on réinitialise 
      this.outputMissingParam.clear();
      checkResult.unknownOutput.forEach(unknownOutput => {
        this.outputMissingParam.set(unknownOutput,"")
      });
      
      this.outputModal.show();
      
    }
    
    //this.previewModal.show();
  }
  // Utiliser pour afficher les valeurs des enum dans l'ordre de saisie
  originalOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
  return 0;
  }

  // méthode utilisée pour les Output Parameters manquants
  changeValue(key: string, value: any){
    this.outputMissingParam.set(key, value.value)
  }

  onSubmitOutputParam(){
    //console.log(this.outputMissingParam);
    // il faut maintenant passer en revue les commandes du tableau rulesApplied pour modifier les outputvalues
    for (let map of this.outputMissingParam.entries()){
      this.rulesApplied.forEach(ruleApplied => {
        if (ruleApplied.outputValue.includes(map[0])){
          ruleApplied.outputValue = ruleApplied.outputValue.replace(map[0], map[1] )
          //console.log(map[0] + "--->" + map[1] )
          //console.log(ruleApplied)
        }
      })
    }
    this.outputModal.hide();
    this.previewModal.show();
    
  }

}