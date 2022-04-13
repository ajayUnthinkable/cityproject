import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { RouteService } from '../../route-master.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Helpers } from 'src/providers/helper';
import { environment } from 'src/environments/environment';
import { ViewTimetableComponent } from '../view-timetable/view-timetable.component';

@Component({
  selector: 'app-upload-time-table',
  templateUrl: './upload-time-table.component.html',
  styleUrls: ['./upload-time-table.component.scss']
})
export class UploadTimeTableComponent implements OnInit {

  errorMsg;
  csvJSON;
  isSaveDisable;
  routeId;
  city;
  @ViewChild('file', { static: false }) file: ElementRef;
  constructor(private routeService: RouteService, @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UploadTimeTableComponent>, private helpers: Helpers,private dialog: MatDialog) {
    this.routeId = data.routeId
  }

  ngOnInit() {
    this.city = JSON.parse(localStorage.getItem('dispatchInfo')).city.name;
  }

  fileSelected(e) {
    this.errorMsg = '';
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    this.csvJSON = file;
    this.file.nativeElement.innerHTML = file.name;
    let reader: FileReader = new FileReader();
    let csvData:string;
    reader.readAsText(file);
    reader.onload = (e) => {
       csvData = reader.result as string;
       console.log(csvData);
     const valid =  this.isValid(csvData);
     if(valid){
       this.dialog.open(ViewTimetableComponent,{
        data: {
          fileData: csvData
        },
        width:'500px'
      });
     }else {
      this.isSaveDisable = false;
      this.csvJSON = null;
       this.helpers.showSnackBar('Invalid Headers.');
     }
    }
  }

  isValid(csvData){
    let allTextLines = csvData.split(/\r?\n|\r/);
    let headers = allTextLines[0].split(',');
    if(headers.includes('jour') && headers.includes('day') && headers.includes('st') && headers.includes('et') && headers.includes('freq')) {
      return true;
    }else {
      return false;
    }
  }

  close() {
    this.dialogRef.close();
  }

  upload() {
    const dispatchInfo = localStorage.getItem('dispatchInfo');
    const city = JSON.parse(dispatchInfo).city.name.toLowerCase();
    let params = {
      city: city
    }
    this.isSaveDisable = true;
    const url = `${environment.data_tool_url}datatool/${city.toLowerCase()}/updateTimetable`;
    if (this.file.nativeElement.innerHTML.includes(this.routeId)) {
      this.routeService.uploadCsvFile(this.csvJSON, url).then(res => {
        if (res === '["Uploaded the trips obj successfully"]') {
          this.close();
          this.helpers.showSnackBar('File successfully upload');
        } else {
          this.isSaveDisable = false;
          this.csvJSON = null;
          this.errorMsg = res;
        }
      }).catch(err => {
        this.isSaveDisable = false;
        this.csvJSON = null;
        this.errorMsg = err;
      });
    }
    else {
      this.isSaveDisable = false;
      this.csvJSON = null;
      this.errorMsg = "File name does not matched with route id";
    }
  }
}
