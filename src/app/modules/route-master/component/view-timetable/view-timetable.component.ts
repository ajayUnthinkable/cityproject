// import { Component, OnInit } from '@angular/core';
import { Component, OnInit, Inject, Input, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

import { RouteService } from '../../route-master.service';
import { Helpers } from 'src/providers/helper';


@Component({
  selector: 'app-view-timetable',
  templateUrl: './view-timetable.component.html',
  styleUrls: ['./view-timetable.component.scss']
})
export class ViewTimetableComponent implements OnInit { 
  
  isShowLoader: boolean = false;
  routeId;
  timeTable;
  selectedTabIndex = 0;
  timeTableDataList:any;
  @Input() fileData: any;
  constructor(
    @Optional() private dialogeRef: MatDialogRef<ViewTimetableComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) data: any, private dialoge: MatDialog, private routeService: RouteService, private helpers: Helpers) {   
      if(data && data.fileData){
        this.setTimeTableData(data.fileData);
      }
    }

  ngOnInit(): void {
      if(this.fileData) {
        this.setTimeTableData(this.fileData);
      }
  }

  cancel() {
    this.dialogeRef.close();
  }
  setTimeTableData(timeTableData){
      let allTextLines = timeTableData.split(/\r?\n|\r/);
      let headers = allTextLines[0].split(',');
      let dataRows = [];
      for ( let i = 0; i < allTextLines.length; i++) {
        let data = allTextLines[i].split(',');
        if (data.length === headers.length) {
          let tarr = [];
          for ( let j = 0; j < headers.length; j++) {
              tarr.push(data[j]);
          } 
          dataRows.push(tarr);
      }
      }

      this.timeTableDataList = dataRows;
      let tempFareColumn = [""];
      this.timeTableDataList.forEach((i, index) => {
        // if(index>0){
          tempFareColumn.push((index).toString());
          i.unshift((index).toString());
        // }
      })
      this.timeTableDataList[0][0] = '';
      // this.timeTableDataList.unshift(tempFareColumn);
  }
}
