import { Component, Input } from '@angular/core';
import { NewRule } from 'src/app/model/newrule';
import { RuleToEvaluate } from 'src/app/model/ruleToEvaluate';

@Component({
  selector: 'app-display-rules-applied',
  templateUrl: './display-rules-applied.component.html',
  styleUrls: ['./display-rules-applied.component.css']
})
export class DisplayRulesAppliedComponent {
  @Input() rulesToBeApplied: RuleToEvaluate[] | null=null;
}
