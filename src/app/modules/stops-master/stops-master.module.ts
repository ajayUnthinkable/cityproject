import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StopMasterComponent } from './stop-master.component';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { StopService } from './stop-master.service';
import { EditStopsComponent } from './components/edit-stops/edit-stops.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import {routes as route} from '../../utils/config/constants';
import { TranslationModule } from 'src/app/components/translation-component/translation.module';
import { NgxPaginationModule } from 'ngx-pagination';

const routes = [
  { path: '', component: StopMasterComponent },
  { path: route.editStopRoute, component: EditStopsComponent }
]

@NgModule({
  declarations: [StopMasterComponent, 
    EditStopsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslationModule,
    NgxPaginationModule
  ],
  providers: [StopService]
})
export class StopsMasterModule { }
