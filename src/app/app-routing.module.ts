import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { routes as route } from './utils/config/constants'
import { AuthGuard } from 'src/providers/auth-guard';

const routes: Routes = [
  {
    path: route.loginRoute,
    pathMatch: 'full',
    loadChildren: () => import('./modules/user-authentication/user-authentication.module').then(m => m.UserAuthenticationModule)
  },
  {
    path: route.cityRoute,
    loadChildren: () => import('./modules/select-city/select-city.module').then(m => m.SelectCityModule),
    canActivate: [AuthGuard]
  },
  {
    path: route.homeRoute,
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
    , canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: route.cityRoute ,
    pathMatch: 'full'
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
