import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { routes as route } from '../../utils/config/constants';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
    {
        path: route.emptyRoute, pathMatch: 'full', component: LoginComponent
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserAuthenticationRoutingModule { }
