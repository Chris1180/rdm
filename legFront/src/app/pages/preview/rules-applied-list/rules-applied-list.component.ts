import { Component, Input, OnInit } from '@angular/core';
import { Rule } from 'src/app/model/rule';

@Component({
  selector: 'app-rules-applied-list',
  templateUrl: './rules-applied-list.component.html',
  styleUrls: ['./rules-applied-list.component.css']
})
export class RulesAppliedListComponent implements OnInit {

  @Input() rules: Rule[] | null=null;
  
  constructor() { }

  ngOnInit(): void {
  }

}
