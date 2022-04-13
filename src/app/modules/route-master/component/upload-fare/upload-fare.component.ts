import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { Helpers } from 'src/providers/helper';
import { RouteService } from '../../route-master.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-upload-fare',
  templateUrl: './upload-fare.component.html',
  styleUrls: ['./upload-fare.component.scss']
})
export class UploadFareComponent implements OnInit {

  isSaveDisable: boolean = false;
  csvJSON;
  transportType;
  routeId;
  errorMsg;
  multipleAllow;
  heading;
  isReverse: boolean = false;
  city;
  errorKeys;

  @ViewChild('file', { static: false }) file: ElementRef;
  constructor(private routeService: RouteService, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<UploadFareComponent>, private helpers: Helpers) {
    this.transportType = data.transportType,
      this.routeId = data.routeId,
      this.multipleAllow = data.multipleAllow,
      this.heading = data.heading
  }

  ngOnInit() {
  }

  fileSelected(e) {
    this.errorMsg = '';
    if (this.multipleAllow) {
      let name = '';
      let files = [];
      let totalFiles = Object.keys(e.target.files);
      totalFiles.forEach((key, index) => {
        files.push(e.target.files[key])
        name = name + e.target.files[key].name;
        if (index < totalFiles.length - 1) {
          name = name + ', ';
        }
      })
      this.file.nativeElement.innerHTML = name;
      this.csvJSON = files;
    }
    else {
      const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
      this.csvJSON = file;
      this.file.nativeElement.innerHTML = file.name;
    }
  }

  close() {
    this.dialogRef.close();
  }

  upload() {
    const dispatchInfo = localStorage.getItem('dispatchInfo');
    const userDetails = localStorage.getItem('userDetails');
    const email = JSON.parse(userDetails).email.toLowerCase();
    this.city = JSON.parse(dispatchInfo).city.name.toLowerCase();
    let params = {
      city: this.city,
      mode: this.transportType ? this.transportType.toUpperCase() : 'BUS',
      syncTime: null,
      syncStatus: null,
      isRev: this.isReverse,
      uby :email
    }
    this.isSaveDisable = true;
    const url = `${environment.data_tool_url}datatool/route/upload`;
    if (this.multipleAllow || (!this.multipleAllow && this.file.nativeElement.innerHTML.includes(this.routeId))) {
      this.routeService.uploadCsvFile(this.csvJSON,url,params).then(res => {
        res = JSON.parse(res);
        if (res['status'][0] == "Uploaded the files successfully") {
          this.isSaveDisable = false;
          this.close();
          this.helpers.showSnackBar('File successfully upload');
          // this.deployFare();
        } else {
          this.isSaveDisable = false;
          this.csvJSON = null;
          let newRes; 
          delete res['status'];
          // newRes = JSON.stringify(res);
          newRes = res;
          this.errorMsg = newRes;
          this.errorKeys = Object.keys(newRes);
          
        }
      }).catch(err => {
        this.isSaveDisable = false;
        this.csvJSON = null;
        err = JSON.parse(err);
        let newRes; 
        delete err['status'];
        // newRes = JSON.stringify(err);
        newRes = err;
        this.errorMsg = newRes;
        this.errorKeys = Object.keys(newRes);
      });
    }
    else {
      this.isSaveDisable = false;
      this.csvJSON = null;
      this.errorMsg = {'err':["File name does not matched with route id"]};
      this.errorKeys = ['err'];
    }
  }


  deployFare() {
    const url = `${environment.dataToolUrl}scheduler/${this.city.toLowerCase()}/deploy`;
    this.routeService.deployFareList(url).then(
      res => {
        this.isSaveDisable = false;
        if (res) {
          this.close();
          this.helpers.showSnackBar('File successfully upload');
        }
        else {
          this.csvJSON = null;
          this.errorMsg = res;
        }
      }
    ).catch(err => {
      this.isSaveDisable = false;
      this.csvJSON = null;
      this.errorMsg = err;
      this.helpers.showSnackBar('Something went wrong');
    })
  }


  setReverseOption(isChecked) {
    this.isReverse = isChecked;
  }

}
