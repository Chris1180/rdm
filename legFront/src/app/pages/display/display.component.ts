import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, catchError, forkJoin, map, of, startWith } from 'rxjs';
import { Input } from 'src/app/model/input';
import { NewRule } from 'src/app/model/newrule';
import { AuthorOfProposal } from 'src/app/model/outputParameters/authorOfProposal';
import { OutputLanguage } from 'src/app/model/outputParameters/outputLanguage';
import { RuleToEvaluate } from 'src/app/model/ruleToEvaluate';
import { InputService } from 'src/app/shared/input.service';
import { NewCheckRulesService } from 'src/app/shared/newCheckRules.service';
import { NewRulesService } from 'src/app/shared/newrules.service';
import { AppDataState, RuleStateEnum } from 'src/app/shared/rules.state';

declare var window: any;

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit{
  rulesDataState$!: Observable<AppDataState<NewRule[]>>;
  readonly RuleStateEnum=RuleStateEnum;
  conditionDataState$!: Observable<AppDataState<Input[]>>;
  
  previewForm! : FormGroup;
  
  allConditions : Input[] = []; // toutes les conditions (input) de la DB
  procedureType : Input[] = [];
  documentType : Input[] = [];
  documentStatus  : Input[] = [];  
  reading : Input[] = [];
  docLegSpecialization : Input[] = [];
  language : Input[] = [];
  // pour l'évaluation des condition
  inputParamMap: Map<string, boolean> = new Map();

  // liste des langues utilisées dans les output param
  outputLanguage = OutputLanguage; 
  authorOfProposal = AuthorOfProposal;
  // utilisé pour l'affichage des boutons de rendu
  partUniqueValues: Array<string>= [];
  partSelectedForPreview: string = "";
  
  // utilisé pur mettre la valeur du jour par defaut dans le datePicker
  d = new Date();

  allRules! : NewRule[];
  rulesToBeEvaluated : NewRule[] = [];
  //rulesApplied! : NewRule[]; 
  rulesToBeApplied! : RuleToEvaluate[];
  errorMessage?: string;
  
  // modal pour demander des valeurs suplémentaires
  previewModal: any;
  inputModal: any;
  outputModal: any;
  outputMissingParamMap = new Map<string, string>();
  outputMissingParamMapArchive = new Map<string, string>();
  //rulesWithUnknownInput: number[] = [];
  inputMissingParamMap = new Map<string, boolean>();
  inputMissingParamMapArchive = new Map<string, boolean>();
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
  

  constructor(private NewRuleService: NewRulesService, private conditionService: InputService, private newCheckRulesService: NewCheckRulesService) { 
    const numRows = this.ListOfCommitteeMap.size;
    const numCols = this.headers.length;
  }

  ngOnInit(): void {
    this.rulesDataState$ = this.NewRuleService.getRulesFromDB().pipe(
      map(data=>{
        this.NewRuleService.setAllRules(data);
        this.allRules = data; 
        this.partUniqueValues = this.NewRuleService.getPartUniqueValues();
        return ({dataState:RuleStateEnum.LOADED,data:data}) // lorsque des données sont reçues on retourne les data et le state
      }),
      startWith({dataState:RuleStateEnum.LOADING}),  // startWith est retourné dès que le pipe est executé
      catchError(err=>of({dataState:RuleStateEnum.ERROR, errorMessage:err.message}))
    )
    // pour récupérer la liste des inputs param de la base de donnée
    this.conditionDataState$ = this.conditionService.getInputsFromDB().pipe(
      map(data => {
        return ({ dataState: RuleStateEnum.LOADED, data: data });
      }),
      startWith({ dataState: RuleStateEnum.LOADING }),
      catchError(err => of({ dataState: RuleStateEnum.ERROR, errorMessage: err.message }))
    )
    this.conditionDataState$.subscribe( data=>{
      //on remplit les champs inputs avec le résultat de la base de donnée
      this.allConditions = data.data!
      this.procedureType = data.data?.filter(c=>c.inputGroup=='Procedure Type')!;
      this.documentType = data.data?.filter(c=>c.inputGroup=='Document Type')!;
      this.documentStatus = data.data?.filter(c=>c.inputGroup=='Document Status')!;
      this.reading = data.data?.filter(c=>c.inputGroup=='Reading')!;
      this.docLegSpecialization = data.data?.filter(c=>c.inputGroup=='Doc Leg Specialization')!;
      this.language = data.data?.filter(c=>c.inputGroup=='Language')!;
    })
    this.rulesDataState$.subscribe()
    this.previewModal = new window.bootstrap.Modal(document.getElementById('previewModal'));
    this.outputModal = new window.bootstrap.Modal(document.getElementById('outputModal'));
    this.inputModal = new window.bootstrap.Modal(document.getElementById('inputModal'));

    this.previewForm = new FormGroup({
      procedureType : new FormControl<string>('INI'),
      documentType : new FormControl<string>('OPCD'),
      documentStatus : new FormControl<string>('ONGOING_DRAFT'),
      reading : new FormControl<string>('FIRST_READING'),
      docLegSpecialization : new FormControl<string>('NA'),
      language : new FormControl<string>('EN'),
      procedureNumber : new FormControl<string>('2023/0011(INI)'),
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
  }
  onSubmit(){
    //console.log(this.partSelectedForPreview);

    // on selectionne les règles concernées par l'affichage 
    let filteredRulesByPart : NewRule[] = this.NewRuleService.getAllRules().filter(r => r.part == this.partSelectedForPreview);
    // on réinitialize la liste des inputMissingParamMap
    this.inputMissingParamMap.clear();
    // console.log(filteredRulesByPart)
    this.rulesToBeEvaluated = []
    // on mappe les valeurs du formulaire pour l'eval
    this.mapInputValueFromTheForm();
    // on passe en revue toutes les règles de la partie selectionnée pour trouvé les input value manquantes
    filteredRulesByPart.forEach(r => {
      //console.log('avant le formattage de la condition')
      //console.log(r.ruleCondition.textCondition)
      // pour chaque condition  on formatte la condition
      let formattedCondition: string = this.newCheckRulesService.formatCondition(r.ruleCondition.textCondition).trim()
      //console.log('apres formatage')
      //console.log(formattedCondition)
      // On ne veut pas demander la valeur d'inputs qui ne seront pas utilisés
      // ex: COD && AAAA => pas besoin de demander la valeur de AAAA si ce n'est pas un COD
      // il faut donc évaluer chaque condition et lorsqu'une erreur est relevé alors il y a une input manquante
      for (let [key, value] of this.inputParamMap) {
        var re = new RegExp("\\b" + key + "\\b", "gi"); 
        formattedCondition = formattedCondition.replace(re , value.toString());             
      }
      //console.log('apres remplacement des valeurs du formulaire pour la règle: '+r.id)
      //console.log(formattedCondition)
      try {   
        //console.log( 'pas de pb avec : '+formattedCondition)
        
        if (eval(formattedCondition)){
          this.rulesToBeEvaluated.push(r)
          // si la condition possède des sous-conditions il faut aussi vérifier les inputs manquants des sous-conditions
          if(r.nestedCondition){
            this.getMissingInputFromSubCond(r).subscribe(inputValues => {
              inputValues.forEach(iv=>{
                // si une valeur déjà saisie exite dans le map inputMissingParamMapArchive
                // alors on retransmet la valeur dans le map inputMissingParamMap
                if (this.inputMissingParamMapArchive.has(iv)) {
                  this.inputMissingParamMap.set(iv, this.inputMissingParamMapArchive.get(iv)!)
                }else this.inputMissingParamMap.set(iv, false)
              })
            })
          }  
        } 
      } catch (e) { // It is a SyntaxError
        this.rulesToBeEvaluated.push(r)
        // il faut récupérer les input value manquante pour les demander à l'utilisateur
        let missingInputValues = this.getMissingInput(formattedCondition)
        // On ajoute la valeur dans le tableau des valeurs Input manquantes
        missingInputValues.forEach(iv=> {
          if (this.inputMissingParamMapArchive.has(iv)) {
            this.inputMissingParamMap.set(iv, this.inputMissingParamMapArchive.get(iv)!)
          }else this.inputMissingParamMap.set(iv, false)
        })
        // Une condition non évaluée peut également avoir des sous-conditions
        if (r.nestedCondition){
          this.getMissingInputFromSubCond(r).subscribe(inputValues => {
            inputValues.forEach(iv=>{
              if (this.inputMissingParamMapArchive.has(iv)) {
                this.inputMissingParamMap.set(iv, this.inputMissingParamMapArchive.get(iv)!)
              }else this.inputMissingParamMap.set(iv, false)
            })
          })
        }
      } // fin du try Catch
    }) 
    
    // affiche les valeurs du map pour le debug
    /*
    console.log('Valeurs de inputMissingParamMap')
    for (const [key, value] of this.inputMissingParamMap) {
      console.log(key+' '+value);
    }
    console.log('fin de l\'affichage des valeurs de inputMissingParamMap')
    
    for (const [key, value] of this.inputParamMap) {
      console.log(key+' '+value);
    }*/

    
    if(this.inputMissingParamMap.size == 0) {
       
      // la méthde formatConditionBeforeEval retourne un tableau d'objets  contenant la liste des conditions à évaluer
      this.newCheckRulesService.formatConditionsBeforeEval(filteredRulesByPart, this.previewForm.get('language')?.value).subscribe(
        (rulesToEvaluate: RuleToEvaluate[]) => {
          this.evalCondition(rulesToEvaluate)
        }
      )
    }else{
      this.inputModal.show();
    }
    

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
  checkProcNumber(){
    //Modifie la valeur par defaut de [Procedure Number] en fonction de la valeur de procedure type
    let procedureType = this.previewForm.get('procedureType')?.value;
    this.previewForm.get('procedureNumber')?.setValue('2023/0011('+procedureType+')')
  }
  // Utiliser pour afficher les valeurs des enum dans l'ordre de saisie
  originalOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
    return 0;
  }
  assignValue(part:string){
    this.partSelectedForPreview=part;
  }
  // méthode utilisée pour les Output Parameters manquants
  changeValueOutput(key: string, value: any){
    this.outputMissingParamMap.set(key, value.value)
  }
  changeValueInput(key: string, value: any){
    this.inputMissingParamMap.set(key, value.checked);
    this.inputMissingParamMapArchive.set(key, value.checked);
  }

  onSubmitOutputParam(){
    /*
    for (const [key, value] of this.outputMissingParamMap) {
      console.log(key+' '+value);
    }*/
    // on sauvegarde les valeurs du map outputMissingParamMap dans l'archive outputMissingParamMapArchive
    for (const [key, value] of this.outputMissingParamMap){
      // mise à jour de l'archive ou ajout si besoin
      this.outputMissingParamMapArchive.set(key, value)
    }

    // il faut maintenant passer en revue les commandes du tableau rulesToBeEvaluated pour modifier les outputvalues
    this.rulesToBeApplied.forEach(rule => {
      //console.log('avant remplacement')
      //console.log(rule.outputValue)
      
      for (const [key, value] of this.outputMissingParamMap) {
        if (rule.outputValue.includes(key)){
          //console.log(rule.outputValue.includes(key))
          if (value==''){
            // il faut vérifier si une valeur par défaut existe dans la liste des output value connue de la DB
            let outputDB = this.newCheckRulesService.listOfOutputParamFromDB.filter(output => '['+output.name.toLocaleUpperCase()+']' == key.toLocaleUpperCase())
            //console.log(outputDB)
            if (outputDB.length>0) rule.outputValue = rule.outputValue.replace(key, outputDB[0].initValue)
            else rule.outputValue = rule.outputValue.replace(key, value)
          }else rule.outputValue = rule.outputValue.replace(key, value)
          
        }
      }
      //console.log('après remplacement')
      //console.log(rule.outputValue)
      
    });
    
    /*
    for (let map of this.outputMissingParamMap.entries()){
      this.rulesToBeEvaluated.forEach(rules => {
        
        if (rules.outputValue.includes(map[0])){
          rules.outputValue = rules.outputValue.replace(map[0], map[1] )
          //console.log(map[0] + "--->" + map[1] )
          //console.log(ruleApplied)
        }
      })
    }*/

    this.outputModal.hide();
    // classement des règles suivant leur ordre
    this.rulesToBeApplied.sort(function(a, b) {
      return a.order - b.order;
    });
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
    //on ajoute les valeurs saisies par l'utilisateur pour les input manquant au map InputParam avant l'éval
    //for (let [key, value] of this.inputMissingParamMap) {
    //  this.inputParamMap.set(key, value)
    //}
    this.inputModal.hide();
    
    this.newCheckRulesService.formatConditionsBeforeEval(this.rulesToBeEvaluated, this.previewForm.get('language')?.value).subscribe(
      (rulesToEvaluate: RuleToEvaluate[]) => {
        this.evalCondition(rulesToEvaluate)
      }
    )
    
  }

  evalCondition(rulesToEvaluate: RuleToEvaluate[]){
    /* debug
    for (const [key, value] of this.inputMissingParamMap) {
      console.log(key+' '+value);
    }
    for (const [key, value] of this.inputParamMap) {
      console.log(key+' '+value);
    }
    // fin debug*/

    // la fonction evalRules reçoit les valeurs du formulaire dans inputMap et dans inputMissingMap (via le modal)
    // et retourne la liste des règles appliquées (sous la forme d'un objet RuleToEvaluate)
    
    this.rulesToBeApplied = this.newCheckRulesService.evalRules(this.inputParamMap, this.inputMissingParamMap, rulesToEvaluate);
    
    // avec la liste finale des règles à appliquer il faut determiner les outputValue de chaque commande
    // avant cela on vide le tableau des outputValue dans le service 
    this.newCheckRulesService.unknownOutput = [];
    // pour rappel une règle peut avoir plusieurs conditions vraies et donc plusieurs commandes
    this.rulesToBeApplied.forEach(
      r => {
        let commandOutputParam : string ="";
        let outputCommand : boolean = false;
        r.outputValue = "";
        // parcours de la chaine de caratère command pour en extraire les infos
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
            r.outputValue += this.newCheckRulesService.getOutputParameter(commandOutputParam, this.previewForm);
            continue;
          }
          if (outputCommand) {
            commandOutputParam += char;
          }else{
            // le char est directement repris dans le outputValue
            //console.log(char)
            r.outputValue += char;
          }
        } // fin du for 
      }
    )// fin du foreach

    //console.log('liste finale des règles DTO avant le preview')
    //console.log(this.rulesToBeApplied) 
    //console.log(this.newCheckRulesService.unknownOutput)
    
    let outputMissingParam: string[] = this.newCheckRulesService.unknownOutput;
    this.outputMissingParamMap.clear();
    // on initialise la map outputMissingParamMap avec une valeur par défaut vide ou une valeur déjà saisie précedement
    // et conservé dans outputMissingParamMapArchive    
    outputMissingParam.forEach(unknownOutput => {
      if(this.outputMissingParamMapArchive.has(unknownOutput)){
        //console.log('trouvé dans l\'archive')
        //console.log(unknownOutput + ' à pour valeur' + this.outputMissingParamMapArchive.get(unknownOutput))
        this.outputMissingParamMap.set(unknownOutput, this.outputMissingParamMapArchive.get(unknownOutput)!)
      }else this.outputMissingParamMap.set(unknownOutput,"")
    });
    
    // si des valeurs Output ne sont pas connues alors on affiche le modal pour mapper les valeurs dasn outputMissingParamMap 
    if(outputMissingParam.length>0){
      this.outputModal.show();
    }else{
      // classement des règles suivant leur ordre
      this.rulesToBeApplied.sort(function(a, b) {
        return a.order - b.order;
      });
      
      this.previewModal.show();     
    }
  }

  mapInputValueFromTheForm(){
    // avec les informations du formulaire on met à jour une map des input connus et de leur valeur dans inputParamMap
    this.allConditions.forEach(condition=>{
      // gestion des cas particuliers issus du tableau ou autre
      let letters = String(this.previewForm.get('letters')?.value).split(',')
      let opinions = String(this.previewForm.get('opinions')?.value).split(',')
      let positions = String(this.previewForm.get('positions')?.value).split(',')
      switch (condition.name) {
        case 'ACJOINTCOM':
          this.inputParamMap.set(condition.name, this.previewForm.get('authoringCommittee')?.value.split("Committee on").length>2)
          break;
        case 'LCJOINTCOM':
          this.inputParamMap.set(condition.name, this.previewForm.get('leadCommittee')?.value.split("Committee on").length>2)
          break;
        case 'ASSOCOM':
          let listOfAssoc = String(this.previewForm.get('listOfAssoc')?.value).split(',')
          this.inputParamMap.set(condition.name, (listOfAssoc.length === 1 && listOfAssoc[0].length!=0) || listOfAssoc.length>1)
          break;
        case 'LETTER':
          this.inputParamMap.set(condition.name, (letters.length === 1 && letters[0].length!=0))
          break;
        case 'LETTERS':
          this.inputParamMap.set(condition.name, letters.length > 1)
          break;
        case 'OPINION':
          this.inputParamMap.set(condition.name, (opinions.length === 1 && opinions[0].length!=0))
          break;
        case 'OPINIONS':
          this.inputParamMap.set(condition.name, opinions.length > 1)
          break;
        case 'POSITION':
          this.inputParamMap.set(condition.name, (positions.length === 1 && positions[0].length!=0))
          break;
        case 'POSITIONS':
          this.inputParamMap.set(condition.name, positions.length > 1)
          break;
        case 'AUTHCOM_MAN':
          this.inputParamMap.set(condition.name, this.previewForm.get('listOfRapporteursTitle')?.value == 'M')
          break;
        case 'AUTHCOM_MEN':
          this.inputParamMap.set(condition.name, this.previewForm.get('listOfRapporteursTitle')?.value == 'MM')
          break;
        case 'AUTHCOM_WOMAN':
          this.inputParamMap.set(condition.name, this.previewForm.get('listOfRapporteursTitle')?.value == 'F')
          break;
        case 'AUTHCOM_WOMEN':
          this.inputParamMap.set(condition.name, this.previewForm.get('listOfRapporteursTitle')?.value == 'FF')
          break;
        case 'AUTHCOM_BOTH':
          this.inputParamMap.set(condition.name, this.previewForm.get('listOfRapporteursTitle')?.value == 'MF')
          break;
        case 'ASSOCOM_MAN':
          this.inputParamMap.set(condition.name, this.previewForm.get('listOfAssocRapporteursTitle')?.value == 'M')
          break;
        case 'ASSOCOM_MEN':
          this.inputParamMap.set(condition.name, this.previewForm.get('listOfAssocRapporteursTitle')?.value == 'MM')
          break;
        case 'ASSOCOM_WOMAN':
          this.inputParamMap.set(condition.name, this.previewForm.get('listOfAssocRapporteursTitle')?.value == 'F')
          break;
        case 'ASSOCOM_WOMEN':
          this.inputParamMap.set(condition.name, this.previewForm.get('listOfAssocRapporteursTitle')?.value == 'FF')
          break;
        case 'ASSOCOM_BOTH':
          this.inputParamMap.set(condition.name, this.previewForm.get('listOfAssocRapporteursTitle')?.value == 'MF')
          break;
        default:
          if(condition.inputGroup == 'Procedure Type' || condition.inputGroup == 'Document Type' || condition.inputGroup == 'Reading' 
            || condition.inputGroup == 'Doc Leg Specialization' || condition.inputGroup == 'Language' || condition.inputGroup == 'Document Status' )
          this.inputParamMap.set(condition.name, this.previewForm.get(condition.formname)?.value == condition.name)
          break;
      }
    })// fin du foreach
  }

  getMissingInput(formattedCondition: string): string[] {
    //on supprime d'abord les caractères ( ) ! avec une expression régulière
    const regex = /[()!]/g;
    // et on découpe formattedCondition en input values
    let inputValue = formattedCondition.replace(regex,'').split(" ")
    //console.log('erreur avec : ' + formattedCondition)
    // console.log(inputValue)
    
    // Supprimer plusieurs éléments de la liste
    let elementsASupprimer: string[] = ["&&", "||" , "true", "false"];
    inputValue = inputValue.filter(item => !elementsASupprimer.includes(item));
    //console.log('après suppression des valeurs')
    //console.log(inputValue)
    return inputValue
  }

  getMissingInputFromSubCond(r: NewRule): Observable<string[]> {
    let missingInputs: string[] = [];
  
    // Créer un observable pour la requête à la BDD
    const subConditionsObservable = this.NewRuleService.getSubConditionsFromDB(r.ruleCondition.id);
  
    return new Observable<string[]>(observer => {
      // Souscrire à l'observable de la BDD
      subConditionsObservable.subscribe({
        next: (subconds) => {
          const observables = subconds.map(sc => {
            let scFormattedCondition: string = this.newCheckRulesService.formatCondition(sc.textCondition);
  
            return new Observable<string>(innerObserver => {
              scFormattedCondition.split(" ").forEach(input => {
                var re = /[(!)\s]+/g;
                let paramTobeChecked = input.replace(re, "");
                if (paramTobeChecked != "&&" && paramTobeChecked != "||") {
                  if (this.allConditions.filter(sc => (sc.name == paramTobeChecked && (sc.inputGroup == 'Procedure Type' || sc.inputGroup == 'Document Type' || sc.inputGroup == 'Reading'
                    || sc.inputGroup == 'Doc Leg Specialization' || sc.inputGroup == 'Document Status' || sc.inputGroup == 'Language'))).length == 0) {
                    if (missingInputs.indexOf(paramTobeChecked) == -1) missingInputs.push(paramTobeChecked);
                  }
                }
              });
              innerObserver.next();
              innerObserver.complete();
            });
          });
  
          // Utiliser forkJoin pour attendre la fin de tous les observables internes
          forkJoin(observables).subscribe({
            complete: () => {
              observer.next(missingInputs);
              observer.complete();
            }
          });
        },
        error: (err) => {
          console.log("Error during back end request for list of conditions");
          observer.error(err);
        }
      });
    });
  }

  // méthode utilisée pour afficher la description des input value dans le modal
  findDescription(key: string){
    return this.allConditions.find(c => c.name === key)
  }

  findOutputDescription(key: string){
    key = key.replace(/\[|\]/g, '')
    //console.log(this.newCheckRulesService.listOfOutputParamFromDB.find(o => o.name.toLowerCase() === key.toLowerCase()))
    return this.newCheckRulesService.listOfOutputParamFromDB.find(o => o.name.toLowerCase() === key.toLowerCase())
  }
}
