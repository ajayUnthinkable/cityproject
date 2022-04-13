import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { environment } from '../../../../../environments/environment'
import { RouteService } from '../../route-master.service';
import { Helpers } from 'src/providers/helper';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UploadFareComponent } from '../upload-fare/upload-fare.component';

@Component({
  selector: 'app-view-fare',
  templateUrl: './view-fare.component.html',
  styleUrls: ['./view-fare.component.scss']
})
export class ViewFareComponent implements OnInit, OnDestroy {

  routeId: any;
  fareList: any = [];
  routeBusStopData: any = [];
  isShowLoader: boolean = false;
  city: String;
  selectedTabIndex = 0;
  transportType;
  

  constructor(private routeService: RouteService, private helpers: Helpers, private dialogeRef: MatDialogRef<ViewFareComponent>,
    @Inject(MAT_DIALOG_DATA) data: any, private dialoge: MatDialog) {
    this.routeId = data.routeId;
    this.transportType = data.transportType
    let dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
    this.city = dispatchedInfo["city"]["name"].toLowerCase();


  }

  ngOnInit(): void {
    this.getFareList();
  }




  cancel() {
    this.dialogeRef.close();
  }
  getFareList() {
    let tempFareColumn = [""];
    this.isShowLoader = true;
    this.routeService.getFareList(this.routeId, this.selectedTabIndex).then(res => {
      this.isShowLoader = false;
      if (res) {
        this.fareList = res.fareMatrix[this.routeId];
        this.routeBusStopData = res.RouteBusStopData[this.routeId];
        this.fareList.forEach((i, index) => {
          tempFareColumn.push((index + 1).toString());
          i.unshift(`${(index + 1).toString()}, ${this.routeBusStopData[index]['busStopName']} (${this.routeBusStopData[index]['distance']})`);
        })
        this.fareList.unshift(tempFareColumn);
      } else {
        // this.helpers.showSnackBar('Fare data not available');
      }
    }).catch(err => {
      this.isShowLoader = false;
      this.helpers.showSnackBar('error occured' + err.message)
    })
  }



  tabChange() {
    this.getFareList();

  }



  downloadFare() {
    this.isShowLoader = true;
    let url = `${environment.preProd_url}scheduler_v4/${this.city}/download/fare?routeId=${this.routeId}`;
    if (this.selectedTabIndex) {
      url = `${environment.prod_url}scheduler_v4/${this.city}/download/fare?routeId=${this.routeId}`;
    }
    this.routeService.downloadFareandRouteList(url).then(result => {
      this.isShowLoader = false;
      if (result.length) {
        window.open(url);
      } else {
        this.helpers.showSnackBar('No Data Found');
      }
    }).catch(err => {
      this.isShowLoader = false;
      if (err.status === 500) {
        this.helpers.showSnackBar('Error : ' + err.error);
      }
      else {
        this.helpers.showSnackBar("Error :" + err.message);
      }
    })
  }

  uploadFare() {
    const dialogRef = this.dialoge.open(UploadFareComponent, {
      data: {
        transportType: this.transportType,
        routeId: this.routeId,
        multipleAllow: false,
        heading: "Upload Fare"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  ngOnDestroy() {
    this.dialoge.closeAll();
  }
}
