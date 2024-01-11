import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NewRule } from 'src/app/model/newrule';
import { RuleToEvaluate } from 'src/app/model/ruleToEvaluate';
import { NewRulesService } from 'src/app/shared/newrules.service';



@Component({
  selector: 'app-display-rules-applied',
  templateUrl: './display-rules-applied.component.html',
  styleUrls: ['./display-rules-applied.component.css']
})
export class DisplayRulesAppliedComponent implements OnInit {
  @Input() rulesToBeApplied: RuleToEvaluate[] | undefined;

  constructor(private newRulesService: NewRulesService, private router: Router){}
  ngOnInit(): void {
  }
  editRule(ruleId: number) {
    let allRules :NewRule[] = this.newRulesService.getAllRules();
    let ruleToBeEdited: NewRule | undefined = allRules.find(r => r.id == ruleId);
    if (ruleToBeEdited) {
      this.newRulesService.setRuleToBeEdited(ruleToBeEdited);
    }
    this.router.navigate(['/EditRule']);
  }

  deleteRule(ruleId: number) {
    let conf = confirm("Are you sure?");
    if (conf == false) return;

    let allRules :NewRule[] = this.newRulesService.getAllRules();
    let ruleToBeDeleted: NewRule | undefined = allRules.find(r => r.id == ruleId);
    if (ruleToBeDeleted) {
      this.newRulesService.deleteRule(ruleToBeDeleted).subscribe({
        next: () => {
          // Si tout s'est bien passé en Back End alors on met à jour la liste des règles dans le service
          // filter parcours le tableau et pour chaque rule on garde que les rules qui sont différentes de id
          allRules = allRules.filter(rule=>rule.id!=ruleId);
          this.newRulesService.setAllRules(allRules);
          // on met à jour l'affichage
          this.rulesToBeApplied = this.rulesToBeApplied?.filter(r=> r.idRule != ruleId)
          console.log('Rule numéro : '+ruleId+' supprimée');
        },
        error: (err) => {
          console.log("Error during deletion process in Back-End", "bg-danger")
        },
        complete: () => {
        } 
      })
    }// fin du if
  }
}
