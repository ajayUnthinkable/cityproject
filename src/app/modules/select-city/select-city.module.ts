import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog'

import { MatSelectModule } from '@angular/material/select'
import { SelectCityComponent } from './select-city.component';
import { CitySelectionComponent } from './components/city-selection/city-selection.component';
import { CityService } from './select-city.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
  { path: '', component: SelectCityComponent }
]


@NgModule({
  declarations: [SelectCityComponent, CitySelectionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatDialogModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  providers:[CityService]
})
export class SelectCityModule { }
