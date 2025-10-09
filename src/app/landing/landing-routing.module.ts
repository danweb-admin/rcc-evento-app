import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { EventoLandingComponent } from './evento-landing/evento-landing.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Landing page
  { path: 'eventos/:slug', component: EventoLandingComponent }, // detalhe do evento
  {
    path: 'admin',
    loadChildren: () => import('../admin/admin.module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: '' } // rota padrão
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
