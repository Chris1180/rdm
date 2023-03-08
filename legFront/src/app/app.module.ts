import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
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
import { PreviewVisuPageComponent } from './pages/preview/preview-visu-page/preview-visu-page.component';


@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    EditionComponent,
    PreviewComponent,
    RulesAppliedListComponent,
    PreviewVisuPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    BrowserAnimationsModule
  ],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter } ],
  bootstrap: [AppComponent]
})
export class AppModule { }
