import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { error } from 'console';
import { Observable, from, of } from 'rxjs';
import { Rule } from 'src/app/model/rule';
import { RulesService } from 'src/app/shared/rules.service';

declare var window: any;

@Component({
  selector: 'app-rules-applied-list',
  templateUrl: './rules-applied-list.component.html',
  styleUrls: ['./rules-applied-list.component.css']
})
export class RulesAppliedListComponent implements OnInit {

  @Input() rulesApplied: Rule[] | null=null;
 
  // Variables pour le message de confirmation lors d'une modification 
  userFeedBackToast: any;
  userFeedBackMessage!: string;
  userFeedBackStyle!: string;

  // oldValue pour l'édition en ligne en cas d'appui sur la touche echap
  oldValue : string = '';

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

  constructor(private rulesService : RulesService, private router: Router) { }

  ngOnInit(): void {
    //this.userFeedBackToast = new window.bootstrap.Toast(document.getElementById('userFeedBack'));
  }

  editRuleOnline(r: any, newValue: string, field: string){
    // supprime les espaces avant et après
    newValue = newValue.trim();
    // pour l'affichage du message de confirmation 
    this.userFeedBackToast = new window.bootstrap.Toast(document.getElementById('userFeedBack'));
    // sauvegarde de l'ancienne valeur fait par le listener
    let oldValue = r[field];

    if(r[field]!=newValue){
      r[field] = newValue;
      //console.log("Changement détecté dans le champ "+ field + " avec la nouvelle valeur : "+ newValue);  
      //console.log("et l'ancienne valeur : "+ oldValue)
      /*
      const isNum = /^\d+$/.test(newValue);
      console.log(isNum)
      if (field === 'order'){
        
      }else {
        this.openFeedBackUser("Only integers here", "bg-danger");
        console.log("Ancienne valeur : "+ oldValue)
        setTimeout(() => {
          r[field] = oldValue;
        }, 1000);
        
      }*/
      
      this.rulesService.saveRule(r).subscribe(
        {
          next : ()=>{
            this.openFeedBackUser("Rule "+r.id+ " updated Succesfully", "bg-success");
          },
          error: (err) => {
            this.openFeedBackUser("Error during saving process in Back-End", "bg-danger");
            r[field] = oldValue;
          }
        }
      )    
        
      
      

      /* à faire:
      - filtre sur valeur ? problème avec isNum qui est faux dans certain cas alors que non ???
      - copie de règle dans le form
      - ajout icone edition
      - double click pour edition et si escape pas de changement
      */
      
    }else{
      //r[field] = newValue.trim();
      //console.log(newValue);
      console.log("pas de changement détecté") 
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

  editRule(r: Rule) {
    this.rulesService.setRuleToBeEdited(r);
    this.router.navigate(['/Edition']);
  }

  deleteRule(r: Rule) {
    let conf = confirm("Are you sure?");
    if (conf == false) return;

    this.rulesService.deleteRule(r.id).subscribe({
      next: () => {
        // Si tout s'est bien passé en Back End alors on met à jour la liste des règles dans le service
        let allRules :Rule[] = this.rulesService.getAllRules();
        // filter parcours le tableau et pour chaque rule on garde que les rules qui sont différentes de id
        allRules = this.rulesService.getAllRules().filter(rule=>rule.id!=r.id);
        this.rulesService.setRules(allRules);
        this.openFeedBackUser("Rule number: "+r.id+" deleted succesfully", "bg-success");
        console.log('Rule numéro : '+r.id+' supprimée');
      },
      error: (err) => {
        this.openFeedBackUser("Error during deletion process in Back-End", "bg-danger")
      },
      complete: () => {
        // ici on rafraichi la liste de la copie locale des rules 
        this.rulesApplied = this.rulesApplied!.filter(rule=>rule.id!=r.id)
      } 
    })
  }

}
