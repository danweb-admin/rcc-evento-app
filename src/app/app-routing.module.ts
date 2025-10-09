import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { 
    path: '', 
    loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule) 
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) 
  },
  { path: '**', redirectTo: '' }
];

const routerOptions: ExtraOptions = {
  anchorScrolling: 'enabled',   // Habilita rolagem até o fragment
  scrollOffset: [0, 64],        // Compensa a altura do seu navbar fixo
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
