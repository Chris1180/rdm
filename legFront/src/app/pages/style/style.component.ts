import { Component, HostListener, OnInit } from '@angular/core';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { NewRule } from 'src/app/model/newrule';
import { Style } from 'src/app/model/style';
import { NewRulesService } from 'src/app/shared/newrules.service';
import { RuleStateEnum } from 'src/app/shared/rules.state';
import { AppDataState } from 'src/app/shared/rules.state';
import { StyleService } from 'src/app/shared/style.service';

declare var window: any;

@Component({
  selector: 'app-style',
  templateUrl: './style.component.html',
  styleUrls: ['./style.component.css']
})
export class StyleComponent implements OnInit {

  styleDataState$!: Observable<AppDataState<Style[]>>;
  readonly RuleStateEnum=RuleStateEnum;
  // oldValue pour l'édition en ligne en cas d'appui sur la touche echap
  oldValue : string = '';
  // Variables pour le message de confirmation lors d'une modification 
  userFeedBackToast: any;
  userFeedBackMessage!: string;
  userFeedBackStyle!: string;
  styles : Style[] = [];
  rules : NewRule[] = []

  @HostListener('focusin', ['$event'])
  @HostListener('keydown.escape', ['$event'])
  fn($event: any) {
    if ($event.type =='focusin') {
      // lorsque le focus est mis sur un champ on sauveagarde l'ancienne valeur du champ pour permettre un retour en arrière avec escape
      this.oldValue = $event.target.innerText
    }
    if ($event.type =='keydown') {
      // lorsque on presse escape alors c'est l'ancienne valeur qui est mise
      $event.target.innerText = this.oldValue 
    }
  }  

  constructor(private styleService: StyleService, private newRuleService: NewRulesService) { }

  ngOnInit(): void {
    this.userFeedBackToast = new window.bootstrap.Toast(document.getElementById('userFeedBack'));
    this.styleDataState$ = this.styleService.getStylesFromDB().pipe(
      map(data=>{
        this.styles = data;
        return ({dataState : RuleStateEnum.LOADED,data:data});
      }),
      startWith({dataState : RuleStateEnum.LOADING}),
      catchError(err=>of({dataState : RuleStateEnum.ERROR, errorMessage:err.message}))
    )
    
    if (!this.newRuleService.getAllRules()){
      this.newRuleService.getRulesFromDB().subscribe(
        rules => this.rules = rules
      )  
    }else this.rules = this.newRuleService.getAllRules();
     
  }

  editStyleOnline(style: any, newValue: any, field: any){
    //console.log(newValue)
    //console.log(style[field])
    if(style[field]!=newValue){
      //console.log("Changement détecté")
      style[field] = newValue;
      this.styleService.modifyStyle(style).subscribe({
        next : (data)=>{// affichage sous forme de modal que tout c'est bien passé
          this.openFeedBackUser("Change saved Succesfully", "bg-success");
        },
        error: (err) => {
          this.openFeedBackUser("Error during saving process in Back-End", "bg-danger")
        },
        complete: ()=>{
          if (field=='name'){
            this.styles.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
          }
        }
      })
    }else{
      //console.log("pas de changement détecté")
    }
  }

  openFeedBackUser(message: string, style: string) {
    this.userFeedBackMessage = message;
    this.userFeedBackStyle = style;
    this.userFeedBackToast.show() ;
  }
  closeFeedBackUser(){
    this.userFeedBackToast.hide();
  }

  deleteStyle(style :Style){
    let conf = confirm("Are you sure?");
    if (conf == false) return;
    
    // avant de faire la suppression en backEnd il faut vérifier qu'aucune règle n'utilise ce style
    const found = this.rules.find(rule => rule.style?.id === style.id);
    if (found === undefined) { // return undefined if no match
      this.styleService.deleteStyle(style.id).subscribe({
        next : (data)=>{// affichage sous forme de modal que tout c'est bien passé
          this.openFeedBackUser("Deletion done Succesfully", "bg-success");
          // ici on rafraichi la liste de la copie locale des styles 
          let index = this.styles.indexOf(style);
          this.styles.splice(index, 1); // ici on supprime l'element dans la copie locale pour le composant
        },
        error: (err) => {
          this.openFeedBackUser("Error during deletion process in Back-End", "bg-danger")
        }
      })
    } else {
      this.openFeedBackUser("Style is used by rule: "+found.id+ "=> deletion not allowed", "bg-danger")
    }
    
  }

  duplicateStyle(style: Style){
    //let newStyle : Style =  { id: 0, name: style.name+'(copy)', margintop: style.margintop, marginleft: style.marginleft, relatif: style.relatif, font: style.font, size: style.size, bold: style.bold, italic: style.italic};
    let newStyle : Style = {...style};
    newStyle.id=0;
    newStyle.name=style.name+' (copy)'
    this.styleService.modifyStyle(newStyle).subscribe({
      next : (data)=>{// affichage sous forme de modal que tout c'est bien passé
        this.openFeedBackUser("Change saved Succesfully", "bg-success");
        this.styles.push(data);
        this.styles.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
      },
      error: (err) => {
        this.openFeedBackUser("Error during saving process in Back-End", "bg-danger")
      }
    })
  }

}
