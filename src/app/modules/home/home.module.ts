import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';

import { HomeComponent } from './home.component';
import { routes as route } from '../../utils/config/constants'
import { SideMenuComponent } from './component/side-menu/side-menu.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { MatDialogModule } from '@angular/material/dialog';
import { CityService } from '../select-city/select-city.service';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';

const routes: Routes = [
    {
        path: '', component: HomeComponent,
        children: [
            { path: route.routeMasterRoute, loadChildren: () => import('../route-master/route-master.module').then(m => m.RouteMasterModule) },
            { path: route.stopMasterRoute, loadChildren: () => import('../stops-master/stops-master.module').then(m => m.StopsMasterModule) },
            { path: route.reportsRoute, loadChildren: () => import('../reports/reports.module').then(m => m.ReportsModule) },
            { path: route.eventControlRoute, loadChildren: () => import('../event-control/event-control.module').then(m => m.EventControlModule) },
            { path: '', redirectTo: route.routeMasterRoute }
        ]
    }
]

@NgModule({
    declarations: [HomeComponent, SideMenuComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatSidenavModule,
        FontAwesomeModule,
        MatDialogModule,
        MatSelectModule,
        MatMenuModule
    ],
    providers: [CityService]
})
export class HomeModule { }
