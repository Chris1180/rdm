import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditionComponent } from './pages/edition/edition.component';
import { FormComponent } from './pages/form/form.component';
import { PreviewComponent } from './pages/preview/preview.component';


const routes: Routes = [
  { path: 'CSIOForm', component: FormComponent },
  { path: 'Edition', component: EditionComponent },
  { path: 'Preview', component: PreviewComponent },
  { path: '',   redirectTo: '/CSIOForm', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
