import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Rule } from 'src/app/model/rule';
import { RulesService } from 'src/app/shared/rules.service';

@Component({
  selector: 'app-edition',
  templateUrl: './edition.component.html',
  styleUrls: ['./edition.component.css']
})
export class EditionComponent implements OnInit {
  ruleForm! : FormGroup;
  // variable pour stocker les valeurs uniques par champ
  parts! : Array<string>;
  labels! : Array<string>;
  conditions! : Array<string>;
  commands! : Array<string>;
  positions! : Array<string>;
  formats! : Array<string>;
  rule! :Rule;
  errorMessage! : string;

  constructor(private ruleService : RulesService, private router: Router) { }

  ngOnInit(): void {
    this.rule = this.ruleService.getRuleToBeEdited();
    this.ruleForm = new FormGroup({
      id : new FormControl(this.rule.id),
      order : new FormControl(this.rule.order),
      part : new FormControl(this.rule.part),
      label : new FormControl(this.rule.label),
      condition : new FormControl(this.rule.condition),
      command : new FormControl(this.rule.command),
      mandatory : new FormControl(this.rule.mandatory),
      initialValue : new FormControl(this.rule.initialValue),
      position : new FormControl(this.rule.position),
      format : new FormControl(this.rule.format),
      comment : new FormControl(this.rule.comment),
      application : new FormControl(this.rule.application),
      example : new FormControl(this.rule.example)
    });
    
    this.parts = this.ruleService.getPartUniqueValues();
    this.labels = this.ruleService.getLabelUniqueValues();
    this.conditions = this.ruleService.getConditionUniqueValues();
    this.commands = this.ruleService.getCommandUniqueValues();
    this.positions = this.ruleService.getPositionUniqueValues();
    this.formats = this.ruleService.getFormatUniqueValues();
    
  }

  onSubmit() {
    this.rule.order = this.ruleForm.get('order')?.value;
    this.rule.part = this.ruleForm.get('part')?.value;
    this.rule.label = this.ruleForm.get('label')?.value;
    this.rule.condition = this.ruleForm.get('condition')?.value;
    this.rule.command = this.ruleForm.get('command')?.value;
    this.rule.mandatory = this.ruleForm.get('mandatory')?.value;
    this.rule.initialValue = this.ruleForm.get('initialValue')?.value;
    this.rule.position = this.ruleForm.get('position')?.value;
    this.rule.format = this.ruleForm.get('format')?.value;
    this.rule.comment = this.ruleForm.get('comment')?.value;
    this.rule.application = this.ruleForm.get('application')?.value;
    this.rule.example = this.ruleForm.get('example')?.value;
    this.ruleService.modifyRule(this.rule).subscribe({
      next : ()=>{
        //this.router.navigate(['/CSIOForm']);
      },
      error : (err) => {
        this.errorMessage = err;
        console.log("Une erreur est remontée"+this.errorMessage);
      },
      complete: ()=>{
        this.ruleService.initCompo().subscribe({
          next: (data) => {
            //initialise le service avec les info du Back-End
            this.ruleService.setRules(data);
          },
          error: (err) => {
            this.errorMessage = err;
            console.log("Une erreur est remontée" + this.errorMessage);
          },
          complete: () => {
            this.router.navigate(['/CSIOForm']);
          }
        });
        
      }
    });
  }

  onCancel() {
    this.router.navigate(['/CSIOForm']);
  }
}
