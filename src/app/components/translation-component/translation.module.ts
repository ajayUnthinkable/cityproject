import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslationComponentComponent } from './translation-component.component';
import { RouteService } from 'src/app/modules/route-master/route-master.service';



@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [TranslationComponentComponent],
  providers: [
    RouteService
  ],
  exports : [
    TranslationComponentComponent
  ]
})
export class TranslationModule { }
