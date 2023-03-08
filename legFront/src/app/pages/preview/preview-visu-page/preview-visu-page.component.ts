import { Component, Input, OnInit } from '@angular/core';
import { Rule } from 'src/app/model/rule';

@Component({
  selector: 'app-preview-visu-page',
  templateUrl: './preview-visu-page.component.html',
  styleUrls: ['./preview-visu-page.component.css']
})
export class PreviewVisuPageComponent implements OnInit {

  @Input() rules:Rule[] | null=null;
  constructor() { }

  ngOnInit(): void {
  }

}
