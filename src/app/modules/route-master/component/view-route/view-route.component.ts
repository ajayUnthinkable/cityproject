import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RouteService } from '../../route-master.service';
import { environment } from 'src/environments/environment';
import { Helpers } from 'src/providers/helper';
import * as _ from 'lodash'
import { AddRouteDetailsComponent } from '../add-route-details/add-route-details.component';

@Component({
  selector: 'app-view-route',
  templateUrl: './view-route.component.html',
  styleUrls: ['./view-route.component.scss']
})
export class ViewRouteComponent implements OnInit, OnDestroy {

  routeDetail;
  isEdit: boolean = false;
  preProdEditRouteForm: FormGroup;
  prodEditRouteForm: FormGroup;
  selectedTabIndex: number = 0;
  specialFeatures;
  routeId;
  isShowLoader;
  cityInfo;
  stopList;
  direction = { "up": "up", "down": "dn" };
  constructor(public dialogRef: MatDialogRef<ViewRouteComponent>, private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private formBuilder: FormBuilder, private routeService: RouteService, private helpers: Helpers) {
    this.routeId = data.routeId
  }

  ngOnInit(): void {
    this.getRouteDetails();
  }

  getRouteDetails() {
    this.isShowLoader = true;
    this.routeService.getRouteDetails(this.routeId, this.selectedTabIndex).then(res => {

      this.isShowLoader = false;
      this.routeDetail = _.find(res, (item) => {
        return item.route_id === this.routeId
      });
      if (this.routeDetail && this.routeDetail.special_features.length) {
        this.routeDetail['serviceTag'] = this.routeDetail.special_features.map(item => {
          return item.toLowerCase();
        })
      }

      if (this.routeDetail && this.routeDetail.spf.length) {
        const serviceTag = this.routeDetail.spf.map(item => {
          return item.toLowerCase();
        })
        if (this.routeDetail && this.routeDetail.serviceTag) {
          this.routeDetail['serviceTag'].push(...serviceTag);
        } else {
          this.routeDetail['serviceTag'] = [...serviceTag];
        }
      }
      if (this.routeDetail && this.routeDetail.o && this.routeDetail.o.length) {
        this.routeDetail.o = this.routeDetail.o.map(item => item.toLowerCase());
      }
    }).catch(err => {
      this.isShowLoader = false;
      this.helpers.showSnackBar('Error occured: ' + err.message);
    })
  }

  clear() {
    this.dialogRef.close();
  }

  download() {
    this.isShowLoader = true;
    const dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
    const city = dispatchedInfo["city"]["name"].toLowerCase();
    console.log("download button", this.routeDetail.route_id);
    let url = `${environment.apiUrl}scheduler_v4/${city}/download/routeDetail?routeId=${this.routeDetail.route_id}&env=preprod`
    if (this.selectedTabIndex) {
      url = `${environment.apiUrl}scheduler_v4/${city}/download/routeDetail?routeId=${this.routeDetail.route_id}&env=production`
    }
    this.routeService.downloadFareandRouteList(url).then(res => {
      this.isShowLoader = false;
      if (res.length) {
        window.open(url);
      }
      else {
        this.helpers.showSnackBar('Data not available');
      }
    }).catch(err => {
      this.isShowLoader = false;
      this.helpers.showSnackBar('err: ' + err);
    });
  }

  tabChange() {
    this.getRouteDetails();
    this.isEdit = false;
  }

  ngOnDestroy() {
  }
}
