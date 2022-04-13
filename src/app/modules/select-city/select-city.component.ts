import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Helpers } from 'src/providers/helper';
import { CitySelectionComponent } from './components/city-selection/city-selection.component';

@Component({
  selector: 'app-select-city',
  templateUrl: './select-city.component.html'
})
export class SelectCityComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private dialog: MatDialog, private helper: Helpers) {

  }
  ngOnInit() {
    let dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
    if (dispatchInfo && dispatchInfo.city) {
      this.router.navigateByUrl('/home')
    }
    else {
      const dialogRef = this.dialog.open(CitySelectionComponent, {
        data: { isFrom: 'login' },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result => {
      });
    }
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }
}
