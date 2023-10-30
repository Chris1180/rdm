import { KeyValue } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { Condition } from 'src/app/model/condition';
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
import { ConditionService } from 'src/app/shared/condition.service';
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
  conditionDataState$!: Observable<AppDataState<Condition[]>>;
  
  previewForm! : UntypedFormGroup;
  //procedureType = ProcedureType;
  procedureType : Condition[] = [];
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

  headers = ['Authoring Committee \n (ACJOINTCOM)\n [AUTHORING COMMITTEE]', 'Lead Committee \n (LCJOINTCOM) \n [LEAD COMMITTEE]', 'Drafting Letter \n (LETTER(S)) \n ', 'Drafting Opinion \n (OPINION(S)) \n ', 'Drafting Position \n (POSITION(S)) \n ', 'List Of Assoc \n (ASSOCOM) \n ', 'Rapporteur(s) \n (AUTHCOM_...) (ASSOCOM_...)\n[LIST OF RAPPORTEURS] [RAPPORTEURS / LIST OF ASSOC]']
  



  constructor(private checkRules: CheckRulesService, private ruleService: RulesService, private conditionService: ConditionService) { 
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
    // pour récupérer la liste des inputs param de la base de donnée
    this.conditionDataState$ = this.conditionService.getConditionsFromDB().pipe(
      map(data => {
        data.forEach(c=> {if (c.inputGroup =='Procedure Type') this.procedureType.push(c)});
        return ({ dataState: RuleStateEnum.LOADED, data: data });
      }),
      startWith({ dataState: RuleStateEnum.LOADING }),
      catchError(err => of({ dataState: RuleStateEnum.ERROR, errorMessage: err.message }))
    )
    this.conditionDataState$.subscribe()
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
    let filteredRulesByPart : Rule[] = this.ruleService.getAllRules().filter(r => r.part == this.partSelectedForPreview);
    checkCondition = this.checkRules.checkCondition(filteredRulesByPart);
    this.rulesWithUnknownInput = checkCondition.rulesWithUnknownInput;
    
    //récup des valeurs input manquantes dans un map
    if (checkCondition.unknownInput.length > 0){  // pour ne pas redemander à chaque fois les inputs manquants: this.inputMissingParamMap.size==0 && 
      
      // On ne veut pas demander la valeur d'inputs qui ne seront pas utilisés
      // ex: COD && AAAA => pas besoin de demander la valeur de AAAA si ce n'est pas un COD
      // il faut donc mettre à jour le tableau unknownInput et retirer les valeurs dont l'éval est fausse
      
      // Procedure Type
      let INI: boolean = (this.previewForm.get('procedureType')?.value == "INI");
      let COD: boolean = (this.previewForm.get('procedureType')?.value == "COD");
      let INL: boolean = (this.previewForm.get('procedureType')?.value == "INL");
      let DEC: boolean = (this.previewForm.get('procedureType')?.value == "DEC");
      let REG: boolean = (this.previewForm.get('procedureType')?.value == "REG");
      // Document Type
      let OPCD: boolean = (this.previewForm.get('documentType')?.value == "OPCD");
      let OPCF: boolean = (this.previewForm.get('documentType')?.value == "OPCF");
      let RPCD: boolean = (this.previewForm.get('documentType')?.value == "RPCD");
      let RPCF: boolean = (this.previewForm.get('documentType')?.value == "RPCF");
      // Document Status
      let ONGOING_DRAFT: boolean = (this.previewForm.get('documentStatus')?.value == "ONGOING_DRAFT");
      let FINALISED_DRAFT: boolean = (this.previewForm.get('documentStatus')?.value == "FINALISED_DRAFT");
      let SENT_TO_TOP: boolean = (this.previewForm.get('documentStatus')?.value == "SENT_TO_TOP");
      let AFTER_VOTE: boolean = (this.previewForm.get('documentStatus')?.value == "AFTER_VOTE");
      let TABLED: boolean = (this.previewForm.get('documentStatus')?.value == "TABLED");
      let authoringCommittee = this.previewForm.get('authoringCommittee')?.value.split("Committee on");
      let ACJOINTCOM: boolean = (authoringCommittee.length>2);
      let leadCommittee = this.previewForm.get('leadCommittee')?.value.split("Committee on");
      let LCJOINTCOM: boolean = (leadCommittee.length>2);

      // Doc with Assoc (le champ docWithAssoc du formulaire ne sera plus utilisé puisque déterminé par la valeur du tableau 'List of Assoc')
      let listOfAssoc = String(this.previewForm.get('listOfAssoc')?.value).split(',')
      let ASSOCOM: boolean = (listOfAssoc.length === 1 && listOfAssoc[0].length!=0)|| listOfAssoc.length>1;

      // Reading
      let FIRST_READING: boolean = (this.previewForm.get('reading')?.value == "FIRST_READING");
      let SECOND_READING: boolean = (this.previewForm.get('reading')?.value == "SECOND_READING");
      let THIRD_READING: boolean = (this.previewForm.get('reading')?.value == "THIRD_READING");
      let RECAST: boolean = (this.previewForm.get('reading')?.value == "RECAST");
      // DocLegSpecialization
      let NA: boolean = (this.previewForm.get('docLegSpecialization')?.value == "NA");
      let AMEND: boolean = (this.previewForm.get('docLegSpecialization')?.value == "AMEND");
      let APPROVE_APP: boolean = (this.previewForm.get('docLegSpecialization')?.value == "APPROVE_APP");
      let REJECT_REJ: boolean = (this.previewForm.get('docLegSpecialization')?.value == "REJECT_REJ");
      // Language
      let BG: boolean = (this.previewForm.get('language')?.value == "BG");
      let ES: boolean = (this.previewForm.get('language')?.value == "ES");
      let CS: boolean = (this.previewForm.get('language')?.value == "CS");
      let DA: boolean = (this.previewForm.get('language')?.value == "DA");
      let DE: boolean = (this.previewForm.get('language')?.value == "DE");
      let ET: boolean = (this.previewForm.get('language')?.value == "ET");
      let EL: boolean = (this.previewForm.get('language')?.value == "EL");
      let EN: boolean = (this.previewForm.get('language')?.value == "EN");
      let FR: boolean = (this.previewForm.get('language')?.value == "FR");
      let GA: boolean = (this.previewForm.get('language')?.value == "GA");
      let HR: boolean = (this.previewForm.get('language')?.value == "HR");
      let IT: boolean = (this.previewForm.get('language')?.value == "IT");
      let LV: boolean = (this.previewForm.get('language')?.value == "LV");
      let LT: boolean = (this.previewForm.get('language')?.value == "LT");
      let HU: boolean = (this.previewForm.get('language')?.value == "HU");
      let MT: boolean = (this.previewForm.get('language')?.value == "MT");
      let NL: boolean = (this.previewForm.get('language')?.value == "NL");
      let PL: boolean = (this.previewForm.get('language')?.value == "PL");
      let PT: boolean = (this.previewForm.get('language')?.value == "PT");
      let RO: boolean = (this.previewForm.get('language')?.value == "RO");
      let SK: boolean = (this.previewForm.get('language')?.value == "SK");
      let SL: boolean = (this.previewForm.get('language')?.value == "SL");
      let FI: boolean = (this.previewForm.get('language')?.value == "FI");
      let SV: boolean = (this.previewForm.get('language')?.value == "SV");
      
      // Drafting Letter
      let letters = String(this.previewForm.get('letters')?.value).split(',')
      let LETTER: boolean = (letters.length === 1 && letters[0].length!=0); 
      let LETTERS: boolean = (letters.length > 1);
      // Drafting Opinion
      let opinions = String(this.previewForm.get('opinions')?.value).split(',')
      let OPINION: boolean = (opinions.length === 1 && opinions[0].length!=0);
      let OPINIONS: boolean = (opinions.length > 1);
      // Drafting Position
      let positions = String(this.previewForm.get('positions')?.value).split(',')
      let POSITION: boolean = (positions.length === 1 && positions[0].length!=0); 
      let POSITIONS: boolean = (positions.length > 1);
      // Title for Authoring Committe
      let AUTHCOM_MAN: boolean = this.previewForm.get('listOfRapporteursTitle')?.value == 'M'
      let AUTHCOM_MEN: boolean = this.previewForm.get('listOfRapporteursTitle')?.value == 'MM'
      let AUTHCOM_WOMAN: boolean = this.previewForm.get('listOfRapporteursTitle')?.value == 'F'
      let AUTHCOM_WOMEN: boolean = this.previewForm.get('listOfRapporteursTitle')?.value == 'FF'
      let AUTHCOM_BOTH: boolean = this.previewForm.get('listOfRapporteursTitle')?.value == 'MF'
      // Title for ASSOCOM Committe
      let ASSOCOM_MAN: boolean = this.previewForm.get('listOfAssocRapporteursTitle')?.value == 'M'
      let ASSOCOM_MEN: boolean = this.previewForm.get('listOfAssocRapporteursTitle')?.value == 'MM'
      let ASSOCOM_WOMAN: boolean = this.previewForm.get('listOfAssocRapporteursTitle')?.value == 'F'
      let ASSOCOM_WOMEN: boolean = this.previewForm.get('listOfAssocRapporteursTitle')?.value == 'FF'
      let ASSOCOM_BOTH: boolean = this.previewForm.get('listOfAssocRapporteursTitle')?.value == 'MF'
      
      // dans ce tableau on ne mettra que les règles dont on a besoin des inputs
      let filteredRulesByPartEvaluated: Rule[] = [];
      filteredRulesByPart.filter(r => this.rulesWithUnknownInput.includes(r.id)).forEach(r => {
        //eval
        try {
          eval(r.finalCondition);
        } catch (e) {
          filteredRulesByPartEvaluated.push(r)
          // It is a SyntaxError
        }  
      });
      checkCondition = this.checkRules.checkCondition(filteredRulesByPartEvaluated);
      this.rulesWithUnknownInput = checkCondition.rulesWithUnknownInput;
      
      // on refait le test de savoir si on a besoin de demander à l'utilisateur des inputs manquants
      if (checkCondition.unknownInput.length > 0) {
        // comme on veut conserver les valeurs précédentes des inputs on copie les valeurs avant de les effacer
        let inputMissingParamMapTemp = new Map(this.inputMissingParamMap); // clone le Map
        this.inputMissingParamMap.clear();
        // initialise les valeurs manquantes
        checkCondition.unknownInput.forEach(unknownInput => {
          if (inputMissingParamMapTemp.has(unknownInput)){
            //on remet la valeur de l'input param précédente
            this.inputMissingParamMap.set(unknownInput, inputMissingParamMapTemp.get(unknownInput)||false)
          }else{
            // par défaut la valeur de l'input param est fausse
            this.inputMissingParamMap.set(unknownInput, false)
          }
        });
        //demande à l'utilisateur de les saisir via vrai/faux
        this.inputModal.show();
      }else{
        // pas de Input param manquant on peut directement évaluer les conditions
        this.evalCondition();
      }
      
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
    
    resultEval = this.checkRules.evalRules(this.previewForm.value, this.inputMissingParamMap, this.rulesWithUnknownInput, this.ruleService.getAllRules().filter(r => r.part == this.partSelectedForPreview));
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


