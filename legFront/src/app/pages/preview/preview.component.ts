import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbDate, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DocumentStatus } from 'src/app/model/inputParameters/documentStatus';
import { DocumentType } from 'src/app/model/inputParameters/documentType';
import { DocWithAssoc } from 'src/app/model/inputParameters/docWithAssoc';
import { DocWithJoint } from 'src/app/model/inputParameters/docWithJoint';
import { Form } from 'src/app/model/inputParameters/form';
import { ProcedureType } from 'src/app/model/inputParameters/procedureType';
import { Reading } from 'src/app/model/inputParameters/reading';
import { AuthoringCommittee } from 'src/app/model/outputParameters/authoringCommittee';
import { LeadCommittee } from 'src/app/model/outputParameters/leadCommittee';
import { ListOfAssoc } from 'src/app/model/outputParameters/listOfAssoc';
import { ListOfRapporteurs } from 'src/app/model/outputParameters/listOfRapporteurs';
import { Rule } from 'src/app/model/rule';
import { CheckRulesService } from 'src/app/shared/check-rules.service';



@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {

  previewForm! : FormGroup;
  procedureType = ProcedureType;
  documentType = DocumentType;
  documentStatus = DocumentStatus;
  docWithJoint = DocWithJoint;
  docWithAssoc = DocWithAssoc;
  reading = Reading;
  form = Form;
  authoringCommittee = AuthoringCommittee;
  leadCommittee = LeadCommittee;
  listOfRapporteurs = ListOfRapporteurs;
  listOfAssoc = ListOfAssoc;
  // utilisé pur mettre la valeur du jour par defaut dans le datePicker
  d = new Date();

  rules! : Rule[];
  
  constructor(private checkRules: CheckRulesService) { }

  ngOnInit(): void {
    this.previewForm = new FormGroup({
      procedureType : new FormControl('INI'),
      documentType : new FormControl('OPCD'),
      documentStatus : new FormControl('ONGOING_DRAFT'),
      docWithJoint : new FormControl('NOJOINTCOM'),
      docWithAssoc : new FormControl('NOASSOCCOMM'),
      reading : new FormControl('FIRST_READING'),
      form : new FormControl('STANDARD'),
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
      sendToTradDate : new FormControl({
        year: this.d.getFullYear(),
        month: this.d.getMonth()+1,
        day: this.d.getDate(),
      }),
      peNumber : new FormControl('PE234.334v01.00'),
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
  }
  onSubmit(): void {
    //console.log(this.previewForm.value);
    this.checkRules.check(this.previewForm.value);
    this.rules = this.checkRules.getRulesApplied();
    

  }
  // Utiliser pour afficher les valeurs des enum dans l'ordre de saisie
  originalOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
  return 0;
  }

}