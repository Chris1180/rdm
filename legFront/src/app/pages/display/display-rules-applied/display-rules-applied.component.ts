import { Component, Input } from '@angular/core';
import { NewRule } from 'src/app/model/newrule';

@Component({
  selector: 'app-display-rules-applied',
  templateUrl: './display-rules-applied.component.html',
  styleUrls: ['./display-rules-applied.component.css']
})
export class DisplayRulesAppliedComponent {
  @Input() rulesApplied: NewRule[] | null=null;
}
