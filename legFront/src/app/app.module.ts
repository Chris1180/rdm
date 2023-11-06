import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormComponent } from './pages/form/form.component';
import { EditionComponent } from './pages/edition/edition.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PreviewComponent } from './pages/preview/preview.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbDateCustomParserFormatter } from './shared/ngbDateCustomParserFormatter';
import { RulesAppliedListComponent } from './pages/preview/rules-applied-list/rules-applied-list.component';
import { StyleComponent } from './pages/style/style.component';
import { PreviewDisplayPageComponent } from './pages/preview/preview-display-page/preview-display-page.component';
import { ConditionComponent } from './pages/condition/condition.component';
import { CommandComponent } from './pages/command/command.component';
import { RulesComponent } from './pages/rules/rules.component';
import { EditRuleComponent } from './pages/edit-rule/edit-rule.component';


@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    EditionComponent,
    PreviewComponent,
    RulesAppliedListComponent,
    StyleComponent,
    PreviewDisplayPageComponent,
    ConditionComponent,
    CommandComponent,
    RulesComponent,
    EditRuleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter } ],
  bootstrap: [AppComponent]
})
export class AppModule { }
