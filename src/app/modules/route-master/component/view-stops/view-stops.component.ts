import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouteService } from '../../route-master.service';
import { Helpers } from 'src/providers/helper';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-stops',
  templateUrl: './view-stops.component.html',
  styleUrls: ['./view-stops.component.scss']
})
export class ViewStopsComponent implements OnInit {

  routeId;
  routeName;
  stopList = [];
  selectedTabIndex = 0;
  newStopName;
  isEdit: boolean = false;
  isShowLoader: boolean = true;
  editableStopId;
  routeDetails;
  backLink;
  constructor(public dialogRef: MatDialogRef<ViewStopsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private routeService: RouteService, private helpers: Helpers,private router:Router) {
    this.routeId = data.routeId;
    this.routeName = data.routeName;
    this.routeDetails = data.details;
    this.backLink = data.back;
  }

  ngOnInit(): void {
    this.getStopDetails();
  }

  clear() {
    this.dialogRef.close();
  }

  editStop() {
    const stopList = this.stopList.map((item,index)=>{
      return {
        lat: item.stop_lat,
        long: item.stop_lon,
        id:item.stop_id,
        stopName:item.stop_name,
        seqNo: index+1
      }
    })
    let data ={...this.routeDetails};
  
    data['stopList'] = [...stopList]
    this.routeService.setNewRouteDetails(data);
    this.router.navigate(['/home/routeMaster/addStop'],{ queryParams: { back: this.backLink }});
    // this.router.navigateByUrl('/home/routeMaster/addStop',{ queryParams: { back: this.backLink }});
  }


  saveOrCancelStop(task, stopId?) {
    if (task === 'save') {
      if (this.newStopName) {
        this.isShowLoader = true;
        this.routeService.updateStopDetail(stopId, this.newStopName).then(res => {
          if (res) {
            this.isEdit = false;
            this.editableStopId = '';
            this.helpers.showSnackBar("Stop updated successfully");
            this.newStopName = '';
            this.getStopDetails();
          }
          this.isShowLoader = false;
        }).catch(err => {
          this.isShowLoader = false;
          this.helpers.showSnackBar("Some Error occured:" + err.message);
        })
      }
    }
    else {
      this.isEdit = false;
    }
  }

  stopNameChange(value, stopId) {
    console.log("updated stop name", value, 'for route id', stopId);
    this.newStopName = value
  }

  getStopDetails() {
    this.isShowLoader = true;
    this.routeService.getStopDetail(this.selectedTabIndex, this.routeId).then(res => {
      this.stopList = res.stopSequenceWithDetails;
      if(res.poly) {
        this.routeDetails['poly'] = res.poly;
      }
      this.isShowLoader = false;
    }).catch(err => {
      this.isShowLoader = false;
      this.helpers.showSnackBar('Error occured:' + err.message);
    })
  }

  tabChange() {
    this.getStopDetails();
  }

downloadCityStops() {
    const cityStopList = this.stopList;
    this.downloadCSV(cityStopList);
}

downloadCSV(stopList) {
    const dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
    // const city = dispatchedInfo.city["name"];
    const data = [];
    for (let index = 0; index < stopList.length; index++) {
        var obj = {
            'Stop Name': stopList[index].stop_name,
            'Lat': stopList[index].stop_lat,
            'Long': stopList[index].stop_lon,
            'Stop ID': stopList[index].stop_id,
            'code': stopList[index].code ? stopList[index].code : '',
        };
        data.push(obj);
    }
    // const csv = this.helpers.downloadCSV(data, `${city} stop list`);
    const csv = this.helpers.downloadCSV(data, `${this.routeId}`);
    console.log(csv);
}

}
