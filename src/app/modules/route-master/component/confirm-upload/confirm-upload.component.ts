import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RouteService } from '../../route-master.service';
import { Helpers } from 'src/providers/helper';

@Component({
  selector: 'app-confirm-upload',
  templateUrl: './confirm-upload.component.html',
  styleUrls: ['./confirm-upload.component.scss']
})
export class ConfirmUploadComponent implements OnInit {

  errorMsg;
  isSaveDisable;
  environmentData;
  data;
  constructor(private dialogRef: MatDialogRef<ConfirmUploadComponent>, private routeService:RouteService, private helpers:Helpers) { }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

  deploy() {
    this.isSaveDisable = true;
    this.routeService.deployFaresToProd().then(res => {
      this.isSaveDisable = false;
      if (res && res.toLowerCase() === "ok") {
        this.helpers.showSnackBar('Fare deploy to production successfully');
        this.dialogRef.close();
      }
    }).catch(err => {
      this.isSaveDisable = false;
      this.helpers.showSnackBar('Something went wrong '+err);
    });
  }

  deployCityToDev() {
    this.isSaveDisable = true;
    this.routeService.deployCityToDev().then(res => {
      this.isSaveDisable = false;
      if (res && res.toLowerCase() === "ok") {
        this.helpers.showSnackBar('City deployed to development successfully');
        this.dialogRef.close();
      }
    }).catch(err => {
      this.isSaveDisable = false;
      this.helpers.showSnackBar('Something went wrong '+err);
    });
  }

  deployCityToProd() {
    this.isSaveDisable = true;
    this.routeService.deployCityToProd().then(res => {
      this.isSaveDisable = false;
      if (res && res.toLowerCase() === "ok") {
        this.helpers.showSnackBar('City deployed to production successfully');
        this.dialogRef.close();
      }
    }).catch(err => {
      this.isSaveDisable = false;
      this.helpers.showSnackBar('Something went wrong '+err);
    });
  }

  deployFaresOnly() {
    this.isSaveDisable = true;
    this.routeService.deployFaresOnlyProd().then(res => {
      this.isSaveDisable = false;
      if (res && res.toLowerCase() === "ok") {
        this.helpers.showSnackBar('Fare deployed to production successfully');
        this.dialogRef.close();
      }
    }).catch(err => {
      this.isSaveDisable = false;
      this.helpers.showSnackBar('Something went wrong '+err);
    });
  }

  upload() {
    if(!this.environmentData ||  !this.data) {
      return;
    }
    if(this.data=='all' && this.environmentData == 'dev'){
      this.deployCityToDev();
    } else if(this.data=='all' && this.environmentData == 'prod'){
      this.deployCityToProd();
    } else if(this.data=='fare' && this.environmentData == 'dev') {
      this.deployFaresOnly();
    } else if(this.data=='fare' && this.environmentData == 'prod') {
      this.deployFaresOnly();
    }
  }
}
