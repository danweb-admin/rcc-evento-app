import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './landing-routing.module';
import { EventoLandingComponent } from './evento-landing/evento-landing.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InscricaoDialogComponent } from './inscricao-dialog/inscricao-dialog.component';


@NgModule({
  declarations: [
    EventoLandingComponent,
    InscricaoDialogComponent
  ],
  imports: [
    CommonModule,
    LandingRoutingModule,
    ReactiveFormsModule
  ]
})
export class LandingModule { }
