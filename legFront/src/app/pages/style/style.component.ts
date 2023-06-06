import { Component, OnInit } from '@angular/core';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Style } from 'src/app/model/style';
import { RuleStateEnum } from 'src/app/shared/rules.state';
import { AppDataState } from 'src/app/shared/rules.state';
import { StyleService } from 'src/app/shared/style.service';

@Component({
  selector: 'app-style',
  templateUrl: './style.component.html',
  styleUrls: ['./style.component.css']
})
export class StyleComponent implements OnInit {

  styleDataState$!: Observable<AppDataState<Style[]>>;
  readonly RuleStateEnum=RuleStateEnum;
  
  constructor(private styleService: StyleService) { }

  ngOnInit(): void {
    this.styleDataState$ = this.styleService.getStylesFromDB().pipe(
      map(data=>{
        return ({dataState : RuleStateEnum.LOADED,data:data});
      }),
      startWith({dataState : RuleStateEnum.LOADING}),
      catchError(err=>of({dataState : RuleStateEnum.ERROR, errorMessage:err.message}))
    ) 
  }

}
