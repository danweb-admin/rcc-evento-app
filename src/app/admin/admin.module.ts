import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AdminRoutingModule } from './admin-routing.module';
import { SectionFormComponent } from './section-form/section-form.component';
import { SectionListComponent } from './section-list/ section-list.component';
import { EventoFormComponent } from './evento-form/evento-form.component';
import { EventoListComponent } from './evento-list/evento-list.component';
import { AngularEditorModule } from '@kolkov/angular-editor';


@NgModule({
  declarations: [
    EventoListComponent,
    EventoFormComponent,
    SectionListComponent,
    SectionFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AdminRoutingModule,
    AngularEditorModule
  ]
})
export class AdminModule {}
