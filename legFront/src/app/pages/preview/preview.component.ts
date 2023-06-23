import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
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
  previewForm! : UntypedFormGroup;
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
  outputMissingParamMap = new Map<string, string>();
  rulesWithUnknownInput: number[] = [];
  inputMissingParamMap = new Map<string, boolean>();

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
    this.inputModal = new window.bootstrap.Modal(document.getElementById('inputModal'));

    this.previewForm = new UntypedFormGroup({
      procedureType : new UntypedFormControl('INI'),
      documentType : new UntypedFormControl('OPCD'),
      documentStatus : new UntypedFormControl('ONGOING_DRAFT'),
      docWithJoint : new UntypedFormControl('NOJOINTCOM'),
      docWithAssoc : new UntypedFormControl('NOASSOCCOMM'),
      reading : new UntypedFormControl('FIRST_READING'),
      form : new UntypedFormControl('STANDARD'),
      language : new UntypedFormControl('EN'),
      procedureNumber : new UntypedFormControl('2023/0011(INI)'),
      generatingDate : new UntypedFormControl({
        year: this.d.getFullYear(),
        month: this.d.getMonth()+1,
        day: this.d.getDate(),
      }),
      sendToTopDate : new UntypedFormControl({
        year: this.d.getFullYear(),
        month: this.d.getMonth()+1,
        day: this.d.getDate(),
      }),
      tablingDate : new UntypedFormControl({
        year: this.d.getFullYear(),
        month: this.d.getMonth()+1,
        day: this.d.getDate(),
      }),
      peNumber : new UntypedFormControl('PE234.334v01.00'),
      docRef : new UntypedFormControl('2022/057(INI)'),
      epadesRef : new UntypedFormControl('PR\\1269845EN.docx'),
      docLanguage : new UntypedFormControl('EN'),
      prefixTitle : new UntypedFormControl('on'),
      iterTitle : new UntypedFormControl('lessons learnt from the Pandora Papers and other revelations'),
      authoringCommittee : new UntypedFormControl('Committee on Constitutional Affairs'),
      leadCommittee : new UntypedFormControl('for the Committee on Constitutional Affairs'),
      prefixListOfRapporteurs : new UntypedFormControl(''),
      listOfRapporteurs : new UntypedFormControl(['Jan Mulder']),
      suffixListOfRapporteurs : new UntypedFormControl(''),
      authorOfProposal : new UntypedFormControl(['Sara Matthieu']),
      listOfAssoc : new UntypedFormControl(["Colm Markey, Committee on Transport and Tourism"]),
    });
  }// fin du ngOnInit


  onSubmit(){
    // la méthode checkCondition formate la condition avant l'eval et fait une liste des Input manquants
    let checkCondition : {unknownInput: string[], rulesWithUnknownInput: number[]};
    checkCondition = this.checkRules.checkCondition(this.ruleService.getAllRules());
    this.rulesWithUnknownInput = checkCondition.rulesWithUnknownInput;
    //récup des valeurs input manquantes dans un map
    if (this.inputMissingParamMap.size==0 && checkCondition.unknownInput.length > 0){
      // initialise les valeur manquantes à faux
      checkCondition.unknownInput.forEach(unknownInput => {
        this.inputMissingParamMap.set(unknownInput, false)
      });
      //demande à l'utilisateur de les saisir via vrai/faux
      this.inputModal.show();
    }else{
      // pas de Input param manquant on peut directement évaluer les conditions
      this.evalCondition();
    }
    
  }
  // Utiliser pour afficher les valeurs des enum dans l'ordre de saisie
  originalOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
  return 0;
  }

  // méthode utilisée pour les Output Parameters manquants
  changeValueOutput(key: string, value: any){
    this.outputMissingParamMap.set(key, value.value)
  }
  changeValueInput(key: string, value: any){
    this.inputMissingParamMap.set(key, value.checked)
  }

  onSubmitOutputParam(){
    // il faut maintenant passer en revue les commandes du tableau rulesApplied pour modifier les outputvalues
    for (let map of this.outputMissingParamMap.entries()){
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
  onIgnoreOutputParam(){
    this.outputModal.hide();
  }
  onIgnoreInputParam(){
    this.inputModal.hide();
  }
  onSubmitInputParam(){
    //console.log(this.inputMissingParamMap);
    this.inputModal.hide();
    this.evalCondition();
  }

  evalCondition(){
    let resultEval : {unknownOutput : string[], rulesApllied : Rule[]}
    resultEval = this.checkRules.evalRules(this.previewForm.value, this.inputMissingParamMap, this.rulesWithUnknownInput);
    let outputMissingParam: string[] = resultEval.unknownOutput;
    this.rulesApplied = resultEval.rulesApllied;
    
    // initialisation de la liste des paramètres output manquants si pas déjà fait (si déjà fait alors on garde les anciennes valeurs) 
    if (this.outputMissingParamMap.size==0 && outputMissingParam.length > 0){
      outputMissingParam.forEach(unknownOutput => {
        this.outputMissingParamMap.set(unknownOutput,"")
      });
    }
    if(outputMissingParam.length>0){
      // des valeurs de Output Param sont manquantes alors on les demande dans le modal
      this.outputModal.show();
    }else{
      // pas de valeur Output inconnue alors on affiche la preview dans le modal
      this.previewModal.show();     
    }
  }
}