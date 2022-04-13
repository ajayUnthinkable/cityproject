import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogueComponent } from '../../../../components/confirmation-dialogue/confirmation-dialogue.component';
import { Router } from '@angular/router';
import { StopService } from '../../stop-master.service';
import { Helpers } from 'src/providers/helper';
import { FormGroup, Form, FormBuilder } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { langCodes } from 'src/app/utils/config/constants';
declare var google;

@Component({
  selector: 'app-edit-stops',
  templateUrl: './edit-stops.component.html',
  styleUrls: ['./edit-stops.component.scss']
})
export class EditStopsComponent implements OnInit {

  isShowLoader = false;
  stopDetails;
  map;
  isEdit = {};
  editStopForm: FormGroup;
  @ViewChild('map') mapRef: ElementRef;
  @ViewChild('stopName', { static: false }) stopName: MatInput;
  @ViewChild('code', { static: true }) code: MatInput;
  @ViewChild('alias', { static: false }) alias: MatInput;
  languagesList;
  prefilledTranslatedList = {};
  finalTranslationValues;

  constructor(private dialog: MatDialog, private router: Router, private stopService: StopService, private helpers: Helpers, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.stopDetails = JSON.parse(localStorage.getItem('stopData'));
    this.languagesList = this.stopDetails.languageList;
      // this.editStopForm = this.formBuilder.group({
      //   stopName: this.stopDetails.stopName || '',
      //   code: this.stopDetails.code || '',
      //   alias: this.stopDetails.alias || ''
      // })
    setTimeout(() => {
      this.initMap();
    }, 1000);
  }

  goBack() {
    const dialogRef = this.dialog.open(ConfirmationDialogueComponent,
      {
        data: {
          message: 'All the changes will be discarded. So are you sure you want to go back?',
          successButton:'Yes',
          cancelButton:'No'
        },
        panelClass:'custom-dialog-container'
      })

    dialogRef.afterClosed().subscribe(res => {
      if (res === "yes") {
        localStorage.removeItem('stopData');
        this.router.navigateByUrl('/home/stopMaster');
      }
    })
  }

  initMap() {
    console.log(this.mapRef);
    this.map = new google.maps.Map(this.mapRef.nativeElement, {
      center: { lat: this.stopDetails.lat, lng: this.stopDetails.long },
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      clickableIcons: false,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
    });

    this.setMarker();
  }

  setMarker() {
    let marker;
    let position = new google.maps.LatLng(this.stopDetails.lat, this.stopDetails.long);
    marker = new google.maps.Marker({
      position: position,
      draggable: true,
      icon: {
        url: 'assets/images/yellow-map-pin.png',
        labelOrigin: { x: 15, y: 18 }
      },
      title: this.stopDetails['stopName'],
    });
    marker.setMap(this.map);
    marker.addListener('dragend', (event) => {
      const position = event.latLng;
      const lat = position.lat();
      const long = position.lng();
      this.stopDetails['lat'] = lat;
      this.stopDetails['long'] = long;
    })
  }

  cancelEditing(info) {
    this.isEdit[info] = false;
  }

  editDetails(value, title) {
    this.isEdit[title] = false;
    if(title == 'ls') {
      this.finalTranslationValues = this.helpers.getTranslationData();
      console.log("form data==>",this.finalTranslationValues);
      let updatedTranslationObj = {};
      if(this.finalTranslationValues && this.finalTranslationValues.length) {
        for(let i=0; i<this.finalTranslationValues.length; i++) {
          let dataObj = {};
          let key = this.finalTranslationValues[i].controls['languageId'].value;
          dataObj['name'] = this.finalTranslationValues[i].controls['translatedText'].value;
           updatedTranslationObj[key] = dataObj;
        }
      }
      value = updatedTranslationObj;
      // console.log(updatedTranslationObj,this.languagesList);
    }
    this.stopDetails[title] = value;
  }

  edit(info) {
    this.isEdit[info] = true;
    if(info == 'ls') {
      if(!(this.languagesList && this.languagesList.length)) {
        this.isEdit[info] = false;
        this.helpers.showSnackBar("No Lanaguage Available.");
        return;
      }
      if(this.languagesList && this.languagesList.length) {
        this.prefilledTranslatedList['data'] = this.stopDetails['ls'];
        this.prefilledTranslatedList['from'] = 'stops';
      }
    }
    // if (info === 'stopName') {
    //  this.stopName.focus();
    // } else if(info === 'code') {
    //   this.code.focus();
    // } else {
    //   this.alias.focus();
    // }

  }

  getDesiredLanguage(key,stop) {
    if(key && stop && stop['ls'] && stop['ls'][key] && stop['ls'][key]['name']) {
      return stop['ls'][key]['name'];
    }
  }

  isAvailableTranslation(key,stop){
    if(key && stop && stop['ls'] && stop['ls'][key] && stop['ls'][key]['name']) {
      return true;
    } else {
      return false;
    }
  }

  getStopTranslatedName(stop) {
    return stop['ls'][Object.keys(stop['ls'])[0]]['name'];
  }

  getKeyForTranslation(stop,key){
    let translatedValuesObj = Object.keys(langCodes);
    let keys = Object.keys(stop['ls']);
    if(keys.includes(key)) {
      if(translatedValuesObj.includes(key)) {
        return langCodes[key];
      } else {
        return key;
      }
    }
  }

  submitStop() {
    const dialogRef = this.dialog.open(ConfirmationDialogueComponent,
      {
        panelClass:'custom-dialog-container',
        data: {
          message: 'Are you sure you want to save changes?',
          successButton:'Okay',
          cancelButton:'Cancel'
        }
      })

    dialogRef.afterClosed().subscribe(res => {
      if (res === "yes") {
        this.isShowLoader = true;
        this.stopService.editStop(this.stopDetails).then(res => {
          this.isShowLoader = false;
          console.log("result=============", res);
          if (res === 'Stop added') {
            localStorage.removeItem('stopData');
            this.router.navigateByUrl('/home/stopMaster');
            this.helpers.showSnackBar("Stop added successfully");
          }
        }).catch(err => {
          this.isShowLoader = false;
          this.helpers.showSnackBar('Error:' + err.message);
        })
      }
    })
  }
}
