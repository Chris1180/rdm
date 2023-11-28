import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditionComponent } from './pages/edition/edition.component';
import { FormComponent } from './pages/form/form.component';
import { PreviewComponent } from './pages/preview/preview.component';
import { StyleComponent } from './pages/style/style.component';
import { ConditionComponent } from './pages/condition/condition.component';
import { OutputComponent } from './pages/output/output.component';
import { RulesComponent } from './pages/rules/rules.component';
import { EditRuleComponent } from './pages/edit-rule/edit-rule.component';
import { DisplayComponent } from './pages/display/display.component';


const routes: Routes = [
  { path: 'Rules', component: RulesComponent },
  { path: 'CSIOForm', component: FormComponent },
  { path: 'Edition', component: EditionComponent },
  { path: 'Preview', component: PreviewComponent },
  { path: 'Display', component: DisplayComponent },
  { path: 'Styles', component: StyleComponent },
  { path: 'Inputs', component: ConditionComponent },
  { path: 'Outputs', component: OutputComponent },
  { path: 'EditRule', component: EditRuleComponent },
  { path: '',   redirectTo: '/Rules', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
