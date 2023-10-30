import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Condition } from 'src/app/model/condition';
import { ConditionService } from 'src/app/shared/condition.service';
import { AppDataState, RuleStateEnum } from 'src/app/shared/rules.state';

declare var window: any;

@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.css']
})
export class ConditionComponent implements OnInit {

  conditionDataState$!: Observable<AppDataState<Condition[]>>;
  readonly RuleStateEnum = RuleStateEnum;
  allConditions: Condition[] = [];
  filteredConditions: Condition[] = [];
  listInputGroups: string[] = [];
  filterFormGroup: FormGroup = new FormGroup(
    {
      inputGroup: new FormControl("allGroups"), //valeur par defaut
    }
  );

  // oldValue pour l'édition en ligne en cas d'appui sur la touche echap
  oldValue: string = '';
  // Variables pour le message de confirmation lors d'une modification 
  userFeedBackToast: any;
  userFeedBackMessage!: string;
  userFeedBackStyle!: string;

  @HostListener('focusin', ['$event'])
  @HostListener('keydown.escape', ['$event'])
  fn($event: any) {
    if ($event.type == 'focusin') {
      // lorsque le focus est mis sur un champ on sauveagarde l'ancienne valeur du champ pour permettre un retour en arrière avec escape
      this.oldValue = $event.target.innerText
    }
    if ($event.type == 'keydown') {
      // lorsque on presse escape alors c'est l'ancienne valeur qui est mise
      $event.target.innerText = this.oldValue
    }
  }
  constructor(private conditionService: ConditionService) { }

  ngOnInit(): void {
    this.userFeedBackToast = new window.bootstrap.Toast(document.getElementById('userFeedBack'));
    this.conditionDataState$ = this.conditionService.getConditionsFromDB().pipe(
      map(data => {
        this.allConditions = data;
        this.filteredConditions = [...data];
        this.listInputGroups = [...new Set(this.allConditions.map(c => c.inputGroup))];
        return ({ dataState: RuleStateEnum.LOADED, data: data });
      }),
      startWith({ dataState: RuleStateEnum.LOADING }),
      catchError(err => of({ dataState: RuleStateEnum.ERROR, errorMessage: err.message }))
    )
  }

  editConditionOnline(condition: any, newValue: any, field: any){
    if(condition[field]!=newValue.trim()){
      
      condition[field] = newValue.trim();
      console.log("Changement détecté pour la condition: "+condition.name)

      this.conditionService.modifyCondition(condition).subscribe({
        next : (data)=>{// affichage sous forme de modal que tout c'est bien passé
          this.openFeedBackUser("Change saved Succesfully", "bg-success");
        },
        error: (err) => {
          this.openFeedBackUser("Error during saving process in Back-End", "bg-danger")
        },
        complete: ()=>{
          /*if (field=='name'){
            this.conditions.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
          }*/
        }
      })
    }else{
      //console.log("pas de changement détecté")
    }
  }

  openFeedBackUser(message: string, style: string) {
    
    this.userFeedBackMessage = message;
    this.userFeedBackStyle = style;
    this.userFeedBackToast.show();
  }
  closeFeedBackUser() {
    this.userFeedBackToast.hide();
  }

  deleteCondition(condition: Condition) {
    let conf = confirm("Are you sure?");
    if (conf == false) return;

    this.conditionService.deleteCondition(condition.id).subscribe({
      next: (data) => {// affichage sous forme de modal que tout c'est bien passé
        this.openFeedBackUser("Deletion done Succesfully", "bg-success");
        // ici on rafraichi la liste de la copie locale des styles 
        let index = this.allConditions.indexOf(condition);
        this.allConditions.splice(index, 1); // ici on supprime l'element dans la copie locale pour le composant
        index = this.filteredConditions.indexOf(condition);
        this.filteredConditions.splice(index, 1);
      },
      error: (err) => {
        this.openFeedBackUser("Error during deletion process in Back-End", "bg-danger")
      }
    })
  }

  duplicateCondition(condition: Condition){
    //let newStyle : Style =  { id: 0, name: style.name+'(copy)', margintop: style.margintop, marginleft: style.marginleft, relatif: style.relatif, font: style.font, size: style.size, bold: style.bold, italic: style.italic};
    let newCondition : Condition = {...condition};
    newCondition.id=0;
    newCondition.name=condition.name+' (copy)'
    
    this.conditionService.modifyCondition(newCondition).subscribe({
      next : (data)=>{// affichage sous forme de modal que tout c'est bien passé
        this.openFeedBackUser("Change saved Succesfully", "bg-success");
        this.allConditions.push(data);
        this.filteredConditions.push(data);
        //this.conditions.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
      },
      error: (err) => {
        this.openFeedBackUser("Error during saving process in Back-End", "bg-danger")
      }
    })
  }

  onFilterChange(){
    if (this.filterFormGroup.get('inputGroup')?.value=='allGroups') {
      this.filteredConditions = this.allConditions
    }
    else {
      this.filteredConditions = this.allConditions.filter(c => c.inputGroup==this.filterFormGroup.get('inputGroup')?.value);
    }
  }
}
