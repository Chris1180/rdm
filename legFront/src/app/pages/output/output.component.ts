import { Component, HostListener } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Output } from 'src/app/model/output';
import { OutputService } from 'src/app/shared/output.service';
import { AppDataState, RuleStateEnum } from 'src/app/shared/rules.state';

declare var window: any;

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.css']
})
export class OutputComponent {
  commandDataState$!: Observable<AppDataState<Output[]>>;
  readonly RuleStateEnum = RuleStateEnum;
  allOutputs: Output[] = [];
  filteredCommands: Output[] = [];
  filterFormGroup: FormGroup = new FormGroup(
    {
      name: new FormControl(""), //valeur par defaut du champ de recherche
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
  constructor(private outputService : OutputService) { }

  ngOnInit(): void {
    this.userFeedBackToast = new window.bootstrap.Toast(document.getElementById('userFeedBack'));
    this.commandDataState$ = this.outputService.getOutputsFromDB().pipe(
      map(data => {
        this.allOutputs = data;
        this.filteredCommands = [...data];
        return ({ dataState: RuleStateEnum.LOADED, data: data });
      }),
      startWith({ dataState: RuleStateEnum.LOADING }),
      catchError(err => of({ dataState: RuleStateEnum.ERROR, errorMessage: err.message }))
    )
  }

  editConditionOnline(command: any, newValue: any, field: any){

    //console.log(command)
    //console.log(newValue)
    
    if(command[field]!=newValue){
      
      command[field] = newValue;
      
      this.outputService.modifyOutput(command).subscribe({
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

  deleteCommand(command: Output) {
    let conf = confirm("Are you sure?");
    if (conf == false) return;

    this.outputService.deleteOutput(command.id).subscribe({
      next: (data) => {// affichage sous forme de modal que tout c'est bien passé
        this.openFeedBackUser("Deletion done Succesfully", "bg-success");
        // ici on rafraichi la liste de la copie locale des styles 
        let index = this.allOutputs.indexOf(command);
        this.allOutputs.splice(index, 1); // ici on supprime l'element dans la copie locale pour le composant
        index = this.filteredCommands.indexOf(command);
        this.filteredCommands.splice(index, 1);
      },
      error: (err) => {
        this.openFeedBackUser("Error during deletion process in Back-End", "bg-danger")
      }
    })
  }

  duplicateCommand(command: Output){
    let newCommand : Output = {...command};
    newCommand.id=0;
    newCommand.name=command.name+' (copy)'
    
    this.outputService.modifyOutput(newCommand).subscribe({
      next : (data)=>{// affichage sous forme de modal que tout c'est bien passé
        this.openFeedBackUser("Change saved Succesfully", "bg-success");
        this.allOutputs.push(data);
        this.filteredCommands.push(data);
        //this.conditions.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
      },
      error: (err) => {
        this.openFeedBackUser("Error during saving process in Back-End", "bg-danger")
      }
    })
  }

  onFilterChange(){
      
    this.filteredCommands = this.allOutputs.filter(output => output.name.toLocaleLowerCase().includes(this.filterFormGroup.get('name')?.value.toLocaleLowerCase()));
    
  }
}
