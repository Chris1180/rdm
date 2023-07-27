import { KeyValue } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
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
  partUniqueValues: Array<string>= [];
  partSelectedForPreview: string = "";
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
  // pour le tableau des inputs
  ListOfCommittee: string[] = [
    'Constitutional Affairs',
    'Foreign Affairs',
    'Agriculture and Rural Development',
    'Budgetary Conciliation Committee',
    'Budgets',
    'Budgetary Control',
    'Culture and Education',
    'Development',
    'Human Rights',
    'Economic and Monetary Affairs',
    'Employment and Social Affairs',
    'Environment, Public Health and Food Safety',
    'Women’s Rights and Gender Equality',
    'Tax Matters',
    'Civil Liberties, Justice and Home Affairs',
    'Joint ITRE - TRAN',
    'Joint IMCO - TRAN',
    'Joint DEVE - FEMM',
    'Joint JURI - LIBE - AFCO',
    'Joint CONT - LIBE',
  
  ];

  headers = ['Authoring Committee [JOINTCOM]', 'Lead Committee', 'Drafting Letter \n [LETTER(S)]', 'Drafting Opinion [OPINION(S)]', 'Drafting Position [POSITION(S)]', 'List Of Assoc / Rapporteurs [ASSOCCOMM]']
  



  constructor(private checkRules: CheckRulesService, private ruleService: RulesService) { 
    const numRows = this.ListOfCommittee.length;
    const numCols = this.headers.length;
  }

  ngOnInit(): void {
    
    this.rulesDataState$ = this.ruleService.getRulesFromDB().pipe(
      map(data=>{
        this.ruleService.setRules(data);
        this.allRules = data;
        this.partUniqueValues = this.ruleService.getPartUniqueValues();
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
      procedureType : new FormControl<string>('INI'),
      documentType : new FormControl<string>('OPCD'),
      documentStatus : new FormControl<string>('ONGOING_DRAFT'),
      docWithJoint : new FormControl<string>('NOJOINTCOM'), // to be removed
      docWithAssoc : new FormControl<string>('NOASSOCCOMM'), // to be removed
      reading : new FormControl<string>('FIRST_READING'),
      form : new FormControl<string>('STANDARD'), // to be removed
      language : new FormControl<string>('EN'),
      procedureNumber : new FormControl<string>('2023/0011(INI)'),
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
      peNumber : new FormControl<string>('PE234.334v01.00'),
      docRef : new FormControl<string>('2022/057(INI)'),
      epadesRef : new FormControl<string>('PR\\1269845EN.docx'),
      docLanguage : new FormControl<string>('EN'),
      prefixTitle : new FormControl<string>('on'),
      iterTitle : new FormControl<string>('lessons learnt from the Pandora Papers and other revelations'),
      authoringCommittee : new FormControl<string>('Committee on Constitutional Affairs'),
      leadCommittee : new FormControl<string>('for the Committee on Constitutional Affairs'),
      prefixListOfRapporteurs : new FormControl<string>(''),
      listOfRapporteurs : new FormControl<[string]>(['Jan Mulder']),
      suffixListOfRapporteurs : new FormControl<string>(''), // to be checked if used
      authorOfProposal : new FormControl<[string]>(['Sara Matthieu']),
      listOfAssoc : new FormControl<[string]>(["Constitutional Affairs"]),
      letters : new FormControl<any>([]),
      opinions : new FormControl<any>(["Constitutional Affairs"]),
      positions : new FormControl<any>([]),
    });
  }// fin du ngOnInit


  onSubmit(){
    //console.log(this.partSelectedForPreview);
    // la méthode checkCondition formate la condition avant l'eval et fait une liste des Input manquants
    let checkCondition : {unknownInput: string[], rulesWithUnknownInput: number[]};
    checkCondition = this.checkRules.checkCondition(this.ruleService.getAllRules(), this.partSelectedForPreview);
    this.rulesWithUnknownInput = checkCondition.rulesWithUnknownInput;
    //récup des valeurs input manquantes dans un map
    if (checkCondition.unknownInput.length > 0){  // pour ne pas redemander à chaque fois les inputs manquants: this.inputMissingParamMap.size==0 && 
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
    resultEval = this.checkRules.evalRules(this.previewForm.value, this.inputMissingParamMap, this.rulesWithUnknownInput, this.partSelectedForPreview);
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

  assignValue(part:string){
    this.partSelectedForPreview=part;
  }

  onChange(index:number, committee:string, event:any){
    
    switch (index) {
      case 0:
        this.previewForm.get('authoringCommittee')?.setValue(committee)
        break;
      case 1:
        this.previewForm.get('leadCommittee')?.setValue(committee)
        break;
      case 2:
        let letters= this.previewForm.get('letters')?.value;
        if (event.target.checked) {
          letters.push(committee);
        }else{
          const indexASupprimer: number = letters.indexOf(committee);
          if (indexASupprimer!=-1) {
            letters.splice(indexASupprimer,1)
          }
        }
        this.uncheckboxes(3);
        this.uncheckboxes(4);
        this.previewForm.get('letters')?.setValue(letters);
        break;
      case 3:
        let opinions= this.previewForm.get('opinions')?.value;
        if (event.target.checked) {
          opinions.push(committee);
        }else{
          const indexASupprimer: number = opinions.indexOf(committee);
          if (indexASupprimer!=-1) {
            opinions.splice(indexASupprimer,1)
          }
        }
        this.uncheckboxes(2);
        this.uncheckboxes(4);
        this.previewForm.get('opinions')?.setValue(opinions);
        break;
      case 4:
        let positions= this.previewForm.get('positions')?.value;
        if (event.target.checked) {
          positions.push(committee);
        }else{
          const indexASupprimer: number = positions.indexOf(committee);
          if (indexASupprimer!=-1) {
            positions.splice(indexASupprimer,1)
          }
        }
        this.uncheckboxes(2);
        this.uncheckboxes(3);
        this.previewForm.get('positions')?.setValue(positions);
        break;
      case 5:
        let listOfAssoc= this.previewForm.get('listOfAssoc')?.value;
        if (event.target.checked) {
          listOfAssoc.push(committee);
        }else{
          const indexASupprimer: number = listOfAssoc.indexOf(committee);
          if (indexASupprimer!=-1) {
            listOfAssoc.splice(indexASupprimer,1)
          }
        }
        this.previewForm.get('listOfAssoc')?.setValue(listOfAssoc);
      break;
      default:
        break;
    }
  }

  uncheckboxes(column: number){
    var cbs = Array.from(document.getElementsByClassName("cb"+column)) as HTMLInputElement[];
    
    for (var i = 0; i < cbs.length; i++) {
      //console.log(cbs[i].checked)  
      cbs[i].checked = false;
    }
    switch (column) {
      case 2:
        this.previewForm.get('letters')?.setValue([]);
        break;
      case 3:
        this.previewForm.get('opinions')?.setValue([]);
        break;
      case 4:
      this.previewForm.get('positions')?.setValue([]);
      break;
    }
  }
}