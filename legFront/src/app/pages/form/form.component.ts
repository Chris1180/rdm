import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Rule } from 'src/app/model/rule';
import { RulesService } from 'src/app/shared/rules.service';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  rules!: Array<Rule>;
  //rulesDisplayed! : Array<Rule>;
  parts!: Array<string>;
  labels!: Array<string>;
  positions!: Array<string>;

  errorMessage!: string;
  filterFormGroup!: FormGroup;
  // pour la pagination
  currentPage: number = 0;
  pageSize: number = 10; // nombre d'éléments affiché par page
  totalPages: number = 0;
  totalResults: number = 0;
  filterActive: boolean = false; // pour savoir si un filtre est actif ou pas


  constructor(private ruleService: RulesService, private router: Router) { }

  ngOnInit(): void {
    // vérifie si le service est déjà initialisé avec les infos du Back-End
    if (!this.ruleService.getRules()) {
      console.log('init component for the first time')
      this.ruleService.initCompo().subscribe({
        next: (data) => {
          //initialise le service avec les info du Back-End
          this.ruleService.setRules(data);
        },
        error: (err) => {
          this.errorMessage = err;
          console.log("Une erreur est remontée" + this.errorMessage);
        },
        complete: () => {
          this.displayRules();
        }
      });
      this.filterFormGroup = new FormGroup({
        part: new FormControl("allPart"), //valeur par defaut
        label: new FormControl("allLabel"),
        position: new FormControl("allPosition"),
        condition: new FormControl(""),
        command: new FormControl("")
      });
    } else {
      // le composent est déjà init donc il faut récupérer la page et les filtres
      this.currentPage = this.ruleService.pageToDisplay;
      this.filterFormGroup = this.ruleService.filters;
      this.onFilterChange(this.currentPage);
      //this.displayRules();
    }

    
  }

  displayRules() {
    this.getPageRules();
    // récupère toutes les valeurs dans le filtre
    this.parts = this.ruleService.getPartUniqueValues();
    this.labels = this.ruleService.getLabelUniqueValues();
    this.positions = this.ruleService.getPositionUniqueValues();
  }

  getPageRules() {
    this.ruleService.getPageRules(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.rules = data.rules;
        this.totalPages = data.totalPages;
        this.totalResults = data.totalResults;
      },
      error: (err) => {
        this.errorMessage = err;
      }
    })
  }

  resetfilters() {
    this.filterFormGroup.get('part')?.setValue('allPart');
    this.filterFormGroup.get('label')?.setValue('allLabel');
    this.filterFormGroup.get('position')?.setValue('allPosition');
    this.filterFormGroup.get('condition')?.setValue('');
    this.filterFormGroup.get('command')?.setValue('');
    this.filterActive = false;
    this.onFilterChange(0);
  }

  deleteRule(r: Rule) {
    let conf = confirm("Are you sure?");
    if (conf == false) return;
    
    this.ruleService.deleteRule(r.id).subscribe({
      next: () => {},
      error: (err) => {
        this.errorMessage = err;
      },
      complete: () => {
        let index = this.rules.indexOf(r);
        this.rules.splice(index, 1); // ici on supprime l'element dans la copie locale pour le composant
        let ind = this.rules.indexOf(r);
        this.rules.splice(ind, 1);
        // on remet en forme la pagination
        this.getPageRules(); 
        if (this.totalPages==this.currentPage){
          this.currentPage--;
          this.getPageRules();
        }
        if (this.totalPages == 0){
          this.errorMessage = "No result to display"
        }
      }
    });
  }

  onFilterChange(page: number = 0) { 
    if (!this.filterFormGroup) {
      this.filterFormGroup = new FormGroup({
        part: new FormControl("allPart"), //valeur par defaut
        label: new FormControl("allLabel"),
        position: new FormControl("allPosition"),
        condition: new FormControl(""),
        command: new FormControl("")
      });            
    }
    if( this.filterFormGroup.get('part')?.value=="allPart" && 
        this.filterFormGroup.get('label')?.value == "allLabel" && 
        this.filterFormGroup.get('position')?.value == "allPosition" && 
        this.filterFormGroup.get('condition')?.value == "" && 
        this.filterFormGroup.get('command')?.value == ""){
          this.filterActive = false
        }else {
          this.filterActive = true;
        }
    this.ruleService.rulesFiltered(this.filterFormGroup.get('part')?.value, this.filterFormGroup.get('label')?.value, this.filterFormGroup.get('position')?.value, this.filterFormGroup.get('condition')?.value, this.filterFormGroup.get('command')?.value, page, this.pageSize).subscribe({
      next: (data) => {
        this.rules = data.rules;
        this.currentPage = page;
        this.totalPages = data.totalPages;
          this.totalResults = data.totalResults;
          if (this.totalPages == 0) {
            this.errorMessage = "No Result Found"
          }
          
        },
        error: (err) => {
          this.errorMessage = err;
        },
      complete: () => {
        // met à jour les filtres en fonction de la selection
        this.parts = this.ruleService.getPartUniqueValues();
        this.labels = this.ruleService.getLabelUniqueValues();
        this.positions = this.ruleService.getPositionUniqueValues();
        //console.log(this.rules)
      }
    })      
    

  }
  editRule(r: Rule) {
    this.ruleService.setRuleToBeEdited(r);
    this.ruleService.pageToDisplay = this.currentPage;
    this.ruleService.filters = this.filterFormGroup;
    this.router.navigate(['/Edition']);
  }

  addNewRule() {
    this.ruleService.setRuleToBeEdited({id: 0, part: '', label: '', condition: '', command: '', mandatory: true, initialValue: '', outputValue: '', example: '',
    position: '', format: '', comment: '', application: ''})
    this.router.navigate(['/Edition']);
  }

  preview() {
    this.router.navigate(['/Preview'])
  }

}
