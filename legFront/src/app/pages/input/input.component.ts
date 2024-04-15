import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup} from '@angular/forms';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Input } from 'src/app/model/input';
import { InputService } from 'src/app/shared/input.service';
import { OrderCustomSortService } from 'src/app/shared/orderCustomSort.service';
import { AppDataState, RuleStateEnum } from 'src/app/shared/rules.state';

declare var window: any;

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class ConditionComponent implements OnInit {

  conditionDataState$!: Observable<AppDataState<Input[]>>;
  readonly RuleStateEnum = RuleStateEnum;
  allInputs: Input[] = [];
  filteredInputs: Input[] = [];
  listInputGroups: string[] = [];
  listInputLabels: string[] = [];
  totalResults: number = 0;
  filterFormGroup: FormGroup = new FormGroup(
    {
      inputGroup: new FormControl("allGroups"), //valeur par defaut
      label: new FormControl("allLabels"), //valeur par defaut
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
  constructor(private InputService: InputService, private orderCustomSortService: OrderCustomSortService) { }

  ngOnInit(): void {
    this.userFeedBackToast = new window.bootstrap.Toast(document.getElementById('userFeedBack'));
    this.conditionDataState$ = this.InputService.getInputsFromDB().pipe(
      map(data => {
        this.allInputs = this.orderCustomSortService.customSortInput(data);
        this.filteredInputs = [...this.allInputs];
        this.listInputGroups = [...new Set(this.allInputs.map(c => c.inputGroup))];
        this.listInputLabels = [...new Set(this.allInputs.map(c => c.label))];
        this.totalResults = this.filteredInputs.length;
        return ({ dataState: RuleStateEnum.LOADED, data: data });
      }),
      startWith({ dataState: RuleStateEnum.LOADING }),
      catchError(err => of({ dataState: RuleStateEnum.ERROR, errorMessage: err.message }))
    )
  }

  editConditionOnline(condition: any, newValue: any, field: any){
   
    if(condition[field]!=newValue.trim()){
      
      condition[field] = newValue.trim();
      //console.log("Changement détecté pour l\'input: "+condition.name)

      this.InputService.modifyInput(condition).subscribe({
        next : (data)=>{// affichage sous forme de modal que tout c'est bien passé
          this.openFeedBackUser("Change saved Succesfully", "bg-success");
        },
        error: (err) => {
          this.openFeedBackUser("Error during saving process in Back-End", "bg-danger")
        },
        complete: ()=>{
          if(field=="label"){
            // on met à jour la liste des labels dans le select
            this.listInputLabels = [...new Set(this.allInputs.map(c => c.label))];
            // on classe les resultats 
            this.orderCustomSortService.customSortInput(this.filteredInputs)
            this.orderCustomSortService.customSortInput(this.allInputs)
          }
          if(field=="inputGroup"){
            this.listInputGroups = [...new Set(this.allInputs.map(c => c.inputGroup))];
          }
          if (field='order') {
            // on classe les resultats 
            this.orderCustomSortService.customSortInput(this.filteredInputs)
            this.orderCustomSortService.customSortInput(this.allInputs)
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
    this.userFeedBackToast.show();
  }
  closeFeedBackUser() {
    this.userFeedBackToast.hide();
  }

  deleteCondition(condition: Input) {
    let conf = confirm("Are you sure?");
    if (conf == false) return;

    this.InputService.deleteInput(condition.id).subscribe({
      next: (data) => {// affichage sous forme de modal que tout c'est bien passé
        this.openFeedBackUser("Deletion done Succesfully", "bg-success");
        // ici on rafraichi la liste de la copie locale des styles 
        let index = this.allInputs.indexOf(condition);
        this.allInputs.splice(index, 1); // ici on supprime l'element dans la copie locale pour le composant
        index = this.filteredInputs.indexOf(condition);
        this.filteredInputs.splice(index, 1);
      },
      error: (err) => {
        this.openFeedBackUser("Error during deletion process in Back-End", "bg-danger")
      }
    })
  }

  duplicateCondition(condition: Input){
    //let newStyle : Style =  { id: 0, name: style.name+'(copy)', margintop: style.margintop, marginleft: style.marginleft, relatif: style.relatif, font: style.font, size: style.size, bold: style.bold, italic: style.italic};
    let newCondition : Input = {...condition};
    newCondition.id=0;
    newCondition.name=condition.name+' (copy)'
    
    this.InputService.modifyInput(newCondition).subscribe({
      next : (data)=>{// affichage sous forme de modal que tout c'est bien passé
        this.openFeedBackUser("Change saved Succesfully", "bg-success");
        this.allInputs.push(data);
        this.filteredInputs.push(data);
        //this.conditions.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
      },
      error: (err) => {
        this.openFeedBackUser("Error during saving process in Back-End", "bg-danger")
      }
    })
  }

  onFilterChange(){
    let filterLabel = this.filterFormGroup.get('label')?.value;
    let filterGroup = this.filterFormGroup.get('inputGroup')?.value

    this.filteredInputs = this.allInputs
    
    if (filterGroup!='allGroups'){
      this.filteredInputs = this.filteredInputs.filter(c => c.inputGroup==this.filterFormGroup.get('inputGroup')?.value);
    }
    if (filterLabel!='allLabels') {
      this.filteredInputs = this.filteredInputs.filter(c => c.label==this.filterFormGroup.get('label')?.value);
    }
    this.totalResults = this.filteredInputs.length;
  }
}
