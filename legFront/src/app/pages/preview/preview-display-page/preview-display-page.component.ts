import { Component, Input, OnInit } from '@angular/core';
import { Rule } from 'src/app/model/rule';

@Component({
  selector: 'app-preview-display-page',
  templateUrl: './preview-display-page.component.html',
  styleUrls: ['./preview-display-page.component.css']
})
export class PreviewDisplayPageComponent implements OnInit {

  @Input() rules:Rule[] | null=null;
  value = {position: 'absolute',  top: '10px', left: '10px', 'font-weight': 'bold', 'font-size': '10px'}
  constructor() { }

  ngOnInit(): void {
    
  }

}
