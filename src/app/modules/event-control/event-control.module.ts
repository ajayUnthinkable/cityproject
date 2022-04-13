import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../../providers/auth-guard';
import { EventControlComponent } from './event-control.component';
import { EventControlDataService } from './event-control.services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { EventDetailsFormComponent } from './component/event-details-form/event-details-form.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DisruptionFormComponent } from './component/disruption-form/disruption-form.component';
import { HomeScreenFormComponent } from './component/home-screen-form/home-screen-form.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxPaginationModule } from 'ngx-pagination';
import { GenericListFilterModule } from 'generic-list-filter';


const routes: Routes = [
    {
        'path': '',
        redirectTo: 'event-list/eventControlForm' 
    },
    {
        'path': 'event-list/:events',
        'component': EventControlComponent,
        'canActivate': [AuthGuard],
    },
    {
        'path': 'add-event',
        'component': EventDetailsFormComponent,
        'canActivate': [AuthGuard],
    }
];

@NgModule({
    declarations: [
        EventControlComponent,
        EventDetailsFormComponent,
        DisruptionFormComponent,
        HomeScreenFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        NgxMaterialTimepickerModule,
        RouterModule.forChild(routes),
        DragDropModule,
        NgxPaginationModule,
        GenericListFilterModule
    ],
    exports: [RouterModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [  EventControlDataService, MatNativeDateModule]
})
export class EventControlModule { }
