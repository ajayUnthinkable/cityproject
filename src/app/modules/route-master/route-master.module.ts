import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatMenuModule } from '@angular/material/menu';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatSliderModule } from '@angular/material/slider';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { RouteMasterComponent } from './route-master.component';
import { RouteService } from './route-master.service';
import { UploadFareComponent } from './component/upload-fare/upload-fare.component';
import { ViewRouteComponent } from './component/view-route/view-route.component';
import { ConfirmUploadComponent } from './component/confirm-upload/confirm-upload.component';

import { ViewStopsComponent } from './component/view-stops/view-stops.component';
import { ViewFareComponent } from './component/view-fare/view-fare.component';
import { MapComponent } from './component/map/map.component';
import { TimeTableComponent } from './component/time-table/time-table.component';
import { UploadTimeTableComponent } from './component/upload-time-table/upload-time-table.component';

import { CustomLowerCasePipe, CustomUpperCasePipe } from '../../../providers/upper-case.pipe';
import { AddRouteDetailsComponent } from './component/add-route-details/add-route-details.component';
import { AddStopTimetableComponent } from './component/add-stop-timetable/add-stop-timetable.component';
import { ReviewChangesComponent } from './component/review-changes/review-changes.component';
import { ViewTimetableComponent } from './component/view-timetable/view-timetable.component';
import { GenericListFilterModule } from 'generic-list-filter';
import { ReportService } from '../reports/reports.service';
import { TranslationModule } from 'src/app/components/translation-component/translation.module';

const routes: Routes = [
  { path: 'addStop', pathMatch: 'full', component: AddStopTimetableComponent },
  { path: 'routes/:route', component: RouteMasterComponent },
  { path: 'poly', component: MapComponent },
  { path: '', redirectTo: 'routes/liveRoutes' }
]
@NgModule({
  declarations: [
    RouteMasterComponent,
    UploadFareComponent,
    ConfirmUploadComponent,
    ViewStopsComponent,
    ViewRouteComponent,
    ViewFareComponent,
    ViewTimetableComponent,
    MapComponent,
    TimeTableComponent,
    UploadTimeTableComponent,
    CustomLowerCasePipe,
    CustomUpperCasePipe,
    AddRouteDetailsComponent,
    AddStopTimetableComponent,
    ReviewChangesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    NgxPaginationModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatTabsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatSliderModule,
    DragDropModule,
    FormsModule, 
    ReactiveFormsModule,
    GenericListFilterModule,
    TranslationModule
  ],
  providers: [RouteService,ReportService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RouteMasterModule { }
