import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ViewFareComponent } from '../view-fare/view-fare.component';
import { RouteService } from '../../route-master.service';
import { Helpers } from 'src/providers/helper';
import { environment } from 'src/environments/environment';
import { UploadTimeTableComponent } from '../upload-time-table/upload-time-table.component';


@Component({
  selector: 'app-time-table',
  templateUrl: './time-table.component.html',
  styleUrls: ['./time-table.component.scss']
})
export class TimeTableComponent implements OnInit {

  isShowLoader: boolean = false;
  routeId;
  timeTable;
  selectedTabIndex = 0;

  constructor(private dialogeRef: MatDialogRef<ViewFareComponent>,
    @Inject(MAT_DIALOG_DATA) data: any, private dialoge: MatDialog, private routeService: RouteService, private helpers: Helpers) {
    this.routeId = data.routeId;
  }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogeRef.close();
  }

  getTimeTable() {
    this.isShowLoader = true;
    this.routeService.getTimeTable(this.routeId).then(res => {
      this.isShowLoader = false;
      this.timeTable = res;
      console.log("time table========", this.timeTable);
    }).catch(err => {
      this.isShowLoader = false;
      this.helpers.showSnackBar('error occured' + err.message);
    })
  }
  downloadTimeTable() {
    const dispatchInfo = localStorage.getItem('dispatchInfo');
    const city = JSON.parse(dispatchInfo).city.name.toLowerCase();
    let url = `${environment.apiUrl}scheduler_v4/${city}/download/timeTable?routeId=${this.routeId}`

    this.routeService.downloadFareandRouteList(url).then(res => {
      if (res) {
        window.open(url);
      }
    }).catch(err => {
      if (err.status === 500) {
        this.helpers.showSnackBar('Error : ' + err.error);
      } else {
        this.helpers.showSnackBar("Error :" + err.message);
      }
    })
  }

  uploadTimeTable() {
    this.dialoge.open(UploadTimeTableComponent, {
      data: {
        routeId: this.routeId,
      }
    });
  }

  tabChange() {

  }
}
