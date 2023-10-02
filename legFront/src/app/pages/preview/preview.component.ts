import { KeyValue } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { DocLegSpecialization } from 'src/app/model/inputParameters/docLegSpecialization';
import { DocumentStatus } from 'src/app/model/inputParameters/documentStatus';
import { DocumentType } from 'src/app/model/inputParameters/documentType';
import { DocWithAssoc } from 'src/app/model/inputParameters/docWithAssoc';
import { DocWithJoint } from 'src/app/model/inputParameters/docWithJoint';
import { Language } from 'src/app/model/inputParameters/language';
import { ProcedureType } from 'src/app/model/inputParameters/procedureType';
import { Reading } from 'src/app/model/inputParameters/reading';
import { AuthorOfProposal } from 'src/app/model/outputParameters/authorOfProposal';
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
  docLegSpecialization = DocLegSpecialization;
  language = Language;
  outputLanguage = OutputLanguage; 
  authorOfProposal = AuthorOfProposal;
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
  
  // pour le tableau des inputs et le rendu
  ListOfCommitteeMap: Map<string, string> = new Map<string,string>([
    ['Constitutional Affairs', 'Committee on Constitutional Affairs'],
    ['Foreign Affairs','Committee on Foreign Affairs'],
    ['Agriculture and Rural Development', 'Committee on Agriculture and Rural Development'],
    ['Budgets', 'Committee on Budgets'],
    ['Budgetary Control','Committee on Budgetary Control'],
    ['Culture and Education', 'Committee on Culture and Education'],
    ['Development', 'Committee on Development'],
    ['Economic and Monetary Affairs', 'Committee on Economic and Monetary Affairs'],
    ['Employment and Social Affairs', 'Committee on Employment and Social Affairs'],
    ['Environment, Public Health and Food Safety', 'Committee on Environment, Public Health and Food Safety'],
    ['Women’s Rights and Gender Equality', 'Committee on Women’s Rights and Gender Equality'],
    ['Civil Liberties, Justice and Home Affairs', 'Committee on Civil Liberties, Justice and Home Affairs'],
    ['Joint ENVI - ITRE', 'Committee on Environment, Public Health and Food Safety \n Committee on Industry, Research and Energy'],
    ['Joint IMCO - JURI', 'Committee on the Internal Market and Consumer Protection \n Committee on Legal Affairs'],
    ['Joint AFET - DEVE', 'Committee on Foreign Affairs \n Committee on Development'],
    ['Joint JURI - LIBE', 'Committee on International Trade \n Committee on Civil Liberties, Justice and Home Affairs'],
    ['Joint FEMM - LIBE', 'Committee on Women’s Rights and Gender Equality \n Committee on Civil Liberties, Justice and Home Affairs']
  ]);
  ListOfRapporteurs: string[] = [
    'Domènec Ruiz Devesa (M), Sven Simon (M)',
    'Alviina Alametsä (F), Hilde Vautmans (F)',
    'Elisabeth Jeggle (F)',
    'Giovanni La Via (M), Georgios Papastamkos (M)',
    'Tamás Deutsch (M), Iliana Ivanova (F)',
    'Laurence Farreng (F)',
    'Birgit Schnieber-Jastram (F)',
    'Markus Ferber (M)',
    '',
    'Karin Kadenbach (F)',
    'Heléne Fritzon (F), Michal Šimečka (M)',
    'Juan Fernando López Aguilar (M)',
    'Pascal Canfin (M), Jutta Paulus (F)',
    'Pascal Arimont (M), Vlad-Marius Botoş (M)',
    'Michael Gahler (M), Charles Goerens (M), Pedro Marques (M), Tomas Tobé (M)',
    'Marina Kaljurand (F)',
    'Heléne Fritzon (F), Eugenia Rodríguez Palop (F)',
  ];
  TitleList: string[] = [
    'MM','FF','F','MM','MF','F','F','M','','F','MF','M','MF','MM','MM','F','FF'
  ]

  headers = ['Authoring Committee \n (JOINTCOM)\n [AUTHORING COMMITTEE]', 'Lead Committee \n \n [LEAD COMMITTEE]', 'Drafting Letter \n (LETTER(S)) \n ', 'Drafting Opinion \n (OPINION(S)) \n ', 'Drafting Position \n (POSITION(S)) \n ', 'List Of Assoc \n (ASSOCOM) \n ', 'Rapporteur(s) \n (AUTHCOM_...) (ASSOCOM_...)\n[LIST OF RAPPORTEURS] [RAPPORTEURS / LIST OF ASSOC]']
  



  constructor(private checkRules: CheckRulesService, private ruleService: RulesService) { 
    const numRows = this.ListOfCommitteeMap.size;
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
      reading : new FormControl<string>('FIRST_READING'),
      docLegSpecialization : new FormControl<string>('NA'),
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
      axxNumber : new FormControl<string>(''),
      epadesRef : new FormControl<string>('PR\\1269845EN.docx'),
      docLanguage : new FormControl<string>('EN'),
      prefixTitle : new FormControl<string>('on'), // to be checked if used
      iterTitle : new FormControl<string>('lessons learnt from the Pandora Papers and other revelations'),
      docComRef : new FormControl<string>('COM(2021)0664'),
      docCouncilRef : new FormControl<string>('C9-0397/2021'),
      authoringCommittee : new FormControl<string>('Committee on Constitutional Affairs'),
      leadCommittee : new FormControl<string>('Committee on Foreign Affairs'),
      prefixListOfRapporteurs : new FormControl<string>(''),
      listOfRapporteurs : new FormControl<[string]>(['Domènec Ruiz Devesa (M), Sven Simon (M)']),
      listOfRapporteursTitle : new FormControl<string>('MM'),
      suffixListOfRapporteurs : new FormControl<string>(''), // to be checked if used
      authorOfProposal : new FormControl<[string]>(['Sara Matthieu']),
      listOfAssoc : new FormControl<any>([]),
      listOfAssocRapporteurs : new FormControl<any>([]),
      listOfAssocRapporteursTitle : new FormControl<string>(''),
      letters : new FormControl<any>([]),
      opinions : new FormControl<any>(["Agriculture and Rural Development"]),
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

  onChange(index:number, committee:string, event:any, line: number){
    
    switch (index) {
      case 0:
        
        //console.log(this.ListOfCommitteeMap.get(committee))
        
        this.previewForm.get('authoringCommittee')?.setValue(this.ListOfCommitteeMap.get(committee))
        this.previewForm.get('listOfRapporteurs')?.setValue([this.ListOfRapporteurs[line]])
        this.previewForm.get('listOfRapporteursTitle')?.setValue(this.TitleList[line])
        break;
      case 1:
        this.previewForm.get('leadCommittee')?.setValue(this.ListOfCommitteeMap.get(committee)?.replace('\n','and the '))
        break;
      case 2: //LETTER(S)
        this.uncheckOtherLines('letters', 'opinions', 'positions', event.target.checked, committee, line)
        break;
      case 3: //OPINIONS
        this.uncheckOtherLines('opinions', 'letters', 'positions', event.target.checked, committee, line)
        break;
      case 4: //POSITIONS
        this.uncheckOtherLines('positions', 'letters', 'opinions', event.target.checked, committee, line)
        break;
      case 5:
        let listOfAssoc= this.previewForm.get('listOfAssoc')?.value;
        // C'est la liste des ASSOCCOM qui définie la liste des rapporteurs de la valeur listOfAssocRapporteurs
        // il faut donc également mettre à jour le formulaire avec les valeurs séléctionnées
        let listOfAssocRapporteurs = this.previewForm.get('listOfAssocRapporteurs')?.value;
        if (event.target.checked) {
          listOfAssoc.push(committee);
          listOfAssocRapporteurs.push(this.ListOfRapporteurs[line])
        }else{
          const indexASupprimer: number = listOfAssoc.indexOf(committee);
          if (indexASupprimer!=-1) {
            listOfAssoc.splice(indexASupprimer,1)
          }
          const indexRapporteurASupprimer: number = listOfAssocRapporteurs.indexOf(this.ListOfRapporteurs[line]);
          if (indexRapporteurASupprimer!=-1) {
            listOfAssocRapporteurs.splice(indexRapporteurASupprimer,1)
          }
        }
        this.previewForm.get('listOfAssoc')?.setValue(listOfAssoc);
        this.previewForm.get('listOfAssocRapporteurs')?.setValue(listOfAssocRapporteurs);
        // à faire avant d'ajouter le titre pour assoccomm (vérif des titres des autres commités)
        // parcours l'ensemble des rapporteurs de l'assocomm puis pour chaque valeur de TitleLIST
        let titleToBeSet = '';
        for (let index = 0; index < listOfAssocRapporteurs.length; index++) {
          // recherche de l'index dans la liste globale pour avoir le titre (grace à l'index)
          let indexTitleList = this.ListOfRapporteurs.indexOf(listOfAssocRapporteurs[index])
          // ensemble de règles (masculin l'emporte sur le femminin)
          let title = this.TitleList[indexTitleList];
          switch (title) {
            case '':
              // pas d'action dans le cas dun comité vide
              break;
            case 'M':
              if (titleToBeSet=='M') titleToBeSet='MM'
              if (titleToBeSet=='') titleToBeSet='M'
              if (titleToBeSet=='F' || titleToBeSet=='FF') titleToBeSet='MF'
              break;
            case 'F':
              if (titleToBeSet=='F') titleToBeSet='FF'
              if (titleToBeSet=='') titleToBeSet='F'
              if (titleToBeSet=='M' || titleToBeSet== 'MM') titleToBeSet='MF' 
              break;
            case 'MF'||'FM':
              titleToBeSet = 'MF' 
            break;
            case 'MM':
              if (titleToBeSet=='' || titleToBeSet=='M') titleToBeSet='MM'
              if (titleToBeSet=='F' || titleToBeSet=='FM' || titleToBeSet=='MF') titleToBeSet='MF'
            break;
            case 'FF':
              if (titleToBeSet=='' || titleToBeSet=='F') titleToBeSet='FF'
              if (titleToBeSet=='M' || titleToBeSet=='MM') titleToBeSet='MF'
            break;
          }
          
        } // fin de la boucle for
        this.previewForm.get('listOfAssocRapporteursTitle')?.setValue(titleToBeSet)
        //console.log(this.previewForm.get('listOfAssoc')?.value)
        //console.log (this.previewForm.get('listOfRapporteursTitle')?.value);
        //console.log (this.previewForm.get('listOfAssocRapporteursTitle')?.value);
        

      break;
      default:
        break;
    }
  }
  checkProcNumber(){
    //Modifie la valeur par defaut de [Procedure Number] en fonction de la valeur de procedure type
    let procedureType = this.previewForm.get('procedureType')?.value;
    this.previewForm.get('procedureNumber')?.setValue('2023/0011('+procedureType+')')
  }

  uncheckOtherLines(actionValue: string, uncheckValue1: string, uncheckValue2: string, checked: boolean, committee: any, line: number) {
    // dans cette fonction on vérifie que si la case est cochée pour letters, sur la même ligne opinion et position sont décochés
    let listActionValue = this.previewForm.get(actionValue)?.value;
    if (checked) { // la case vient d'être cochée
      // mise à jour du champ dans le formulaire
      listActionValue.push(committee)
      this.previewForm.get(actionValue)?.setValue(listActionValue);
      // suppression du committe dans les liste opinion et position (si letters)
      let update1 = this.previewForm.get(uncheckValue1)?.value;
      var indexASupprimer: number =update1.indexOf(committee)
      if (indexASupprimer!=-1) {
        update1.splice(indexASupprimer,1)
      }
      let update2= this.previewForm.get(uncheckValue2)?.value;
      indexASupprimer =update2.indexOf(committee)
      if (indexASupprimer!=-1) {
        update2.splice(indexASupprimer,1)
      }
      //uncheck des cases à cocher dans la page HTML
      var cbs = Array.from(document.getElementsByClassName("cb"+line)) as HTMLInputElement[];
      for (let index = 0; index < cbs.length; index++) {
        if (cbs[index].name != actionValue) cbs[index].checked = false
      }
    }else{
      const indexASupprimer: number = this.previewForm.get(actionValue)?.value.indexOf(committee);
      if (indexASupprimer!=-1) {
        listActionValue.splice(indexASupprimer,1);
        this.previewForm.get(actionValue)?.setValue(listActionValue)
      }
    }
    
  }
}


