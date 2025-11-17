import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './landing-routing.module';
import { EventoLandingComponent } from './evento-landing/evento-landing.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InscricaoDialogComponent } from './inscricao-dialog/inscricao-dialog.component';
import { NgxMaskModule } from 'ngx-mask';


@NgModule({
  declarations: [
    EventoLandingComponent,
    InscricaoDialogComponent
  ],
  imports: [
    CommonModule,
    LandingRoutingModule,
    ReactiveFormsModule,
    NgxMaskModule.forChild(),
  ]
})
export class LandingModule { }
