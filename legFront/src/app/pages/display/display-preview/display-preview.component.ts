import { Component, Input } from '@angular/core';
import { NewRule } from 'src/app/model/newrule';
import { RuleToEvaluate } from 'src/app/model/ruleToEvaluate';

@Component({
  selector: 'app-display-preview',
  templateUrl: './display-preview.component.html',
  styleUrls: ['./display-preview.component.css']
})
export class DisplayPreviewComponent {
  @Input() rulesToBeApplied: RuleToEvaluate[] | null=null;
  @Input() partSelectedForPreview?:string;
  value = {position: 'absolute',  top: '10px', left: '10px', 'font-weight': 'bold', 'font-size': '10px'}
}
