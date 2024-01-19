import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbDateCustomParserFormatter } from './shared/ngbDateCustomParserFormatter';
import { StyleComponent } from './pages/style/style.component';

import { ConditionComponent } from './pages/input/input.component';
import { OutputComponent } from './pages/output/output.component';
import { RulesComponent } from './pages/rules/rules.component';
import { EditRuleComponent } from './pages/edit-rule/edit-rule.component';
import { DisplayComponent } from './pages/display/display.component';
import { DisplayPreviewComponent } from './pages/display/display-preview/display-preview.component';
import { DisplayRulesAppliedComponent } from './pages/display/display-rules-applied/display-rules-applied.component';


@NgModule({
  declarations: [
    AppComponent,
    StyleComponent,
    ConditionComponent,
    OutputComponent,
    RulesComponent,
    EditRuleComponent,
    DisplayComponent,
    DisplayPreviewComponent,
    DisplayRulesAppliedComponent
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
