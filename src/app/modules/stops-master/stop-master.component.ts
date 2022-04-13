import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GoogleLoginService } from 'chalo-google-hybrid-login';
import { Helpers } from 'src/providers/helper';
import { StopService } from './stop-master.service';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
declare var google: any;
@Component({
  selector: 'app-stop-master',
  templateUrl: './stop-master.component.html',
  styleUrls: ['stop-master.component.scss']
})
export class StopMasterComponent implements OnInit {

  isShowLoader = false;
  stopList = [];
  map;
  stops;
  selectedStop;
  markersArray = [];
  latLngArray = [];
  infoWindow;
  stopMasterForm:FormGroup;
  routeData;
  isRouteData;
  userRole;
  languageList;
  cityInfo;
  pageNo =1;
  isSearchText;
  bounds;
  @ViewChild('map') mapRef: ElementRef;

  constructor( private stopService: StopService, private router: Router, private activatedRoute: ActivatedRoute,private formBuilder: FormBuilder) {
  }
  ngOnInit() {
    this.getStopList();
    this.stopMasterForm = this.formBuilder.group({
      searchText : ''
    })
    this.map = null;
    this.userRole = JSON.parse(localStorage.getItem('userDetails')).role.toLowerCase();
    this.stopService.getAgency(false).then(res => {
      this.cityInfo = res;
      this.isShowLoader = false;
      this.languageList = [];
      if(this.cityInfo && this.cityInfo.localeIds && this.cityInfo.localeIds.length) {
        this.languageList = this.cityInfo.localeIds;
      }
    }).catch(err => {
      this.isShowLoader = false;
    });

  }
  searchStop(searchText) {
    if (searchText) {
      this.pageNo = 1;
      this.stopList = _.filter(this.stops, (item) => {
        return (item.stopName.toLowerCase().includes(searchText.toLowerCase()) || item.id.toLowerCase().includes(searchText.toLowerCase()));
      });
      this.isSearchText = true;
      // this.setMarkers(null,null,true);
      this.pageChanged(this.pageNo);
    }
    else {
      this.stopList = [...this.stops];
      this.isSearchText = false;
      this.pageChanged(this.pageNo);
    }

  }

  getStopList() {
    this.isShowLoader = true;
    this.stopService.getCityStopList().then(res => {
      this.isShowLoader = false;
      // console.log("total stops list of the city", res);
      this.stopList = [...res];
      // this.stops.sort();
      this.stopList.sort((a, b) => {
        let fa = a.stopName.toLowerCase(),
            fb = b.stopName.toLowerCase();
    
        if (fa < fb) {
            return -1;
        }
        if (fa > fb) {
            return 1;
        }
        return 0;
    });

    for(let i=0;i<this.stopList.length;i++){
      this.stopList[i].seqNo = i;
    }
    this.stops = [...this.stopList];
    
      if (!this.map) {
        this.initMap();
      }
    }, err => {
      this.isShowLoader = false;
    })
  }

  initMap() {
    console.log("init map=======", this.mapRef);
    this.bounds = new google.maps.LatLngBounds();
    this.map = new google.maps.Map(this.mapRef.nativeElement, {
      center: { lat: this.stopList[0].lat, lng: this.stopList[0].long },
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      clickableIcons: false,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
    });

    // this.setMarkers();
    this.pageChanged(this.pageNo);
  }

  pageChanged($event){
    // console.log(this.stopList.length,this.markersArray.length);
    this.pageNo = $event;
    let startIndex = (this.pageNo-1)*10;
    let endIndex = (this.pageNo)*10 -1;
    if(endIndex >= this.stopList.length-1) {
      endIndex = this.stopList.length-1;
    }

    this.setMarkers(startIndex,endIndex);
    
  }

  removeAllMarkers(){
    if (this.markersArray && this.markersArray.length) {
      for (let i=0; i < this.markersArray.length; i++) {
          this.markersArray[i].setMap(null);
      }    
     this.markersArray.length = 0;
    }
  }

  setMarkers(startIndex?,endIndex?, isFromSearch?) {
    this.latLngArray = [];
    this.removeAllMarkers();

    if(isFromSearch && this.stopList && this.stopList.length) {
      for(let i =0; i< this.stopList.length;i++) {
        let marker;
        let position = new google.maps.LatLng(this.stopList[i]['lat'], this.stopList[i]['long']);
        marker = new google.maps.Marker({
          position: position,
          icon: 'assets/images/circlurar-marker.png',
          title: this.stopList[i]['stopName']
        });
        marker.setMap(this.map);
        console.log('marker',this.stopList[i]['stopName']);
        let latLng = {
          lat: this.stopList[i]['lat'],
          lng: this.stopList[i]['long']
        }
        this.latLngArray.push(latLng);
        this.markersArray.push(marker);
        marker.addListener('click', () => {
          const title = marker.getTitle();
          const index = _.findIndex(this.stopList, { stopName: title });
          this.selectStop(index%10,this.stopList[index].id,this.stopList[index]['seqNo']);
        });
       
      }
    } 

    if(!isFromSearch && this.stopList && this.stopList.length) {
      for(let i =startIndex; i<=endIndex;i++) {
        let marker;
        let position = new google.maps.LatLng(this.stopList[i]['lat'], this.stopList[i]['long']);
        marker = new google.maps.Marker({
          position: position,
          icon: 'assets/images/circlurar-marker.png',
          title: this.stopList[i]['stopName']
        });
        marker.setMap(this.map);
        let latLng = {
          lat: this.stopList[i]['lat'],
          lng: this.stopList[i]['long']
        }
        this.latLngArray.push(latLng);
        this.markersArray.push(marker);
        marker.addListener('click', () => {
          const title = marker.getTitle();
          const index = _.findIndex(this.stopList, { stopName: title });
          this.selectStop(index%10,this.stopList[index].id,this.stopList[index]['seqNo']);
        });
      }
    }

    if(this.map && this.latLngArray && this.latLngArray.length) {
      this.bounds = new google.maps.LatLngBounds();
      for (let i of this.latLngArray) {
        this.bounds.extend(i);
      }
      this.map.fitBounds(this.bounds);
    }

  }
  selectStop(index,stopId?,seqNo?) {
    this.selectedStop = null;
    if(this.isSearchText) {
      this.selectedStop =seqNo;
      // this.stopList[index]['seqNo'];
    } 
    console.log("index ====", index,'selectedStop',this.selectedStop,'seqNo',this.stopList[index]['seqNo'],stopId,this.markersArray);
    this.pageChanged(this.pageNo);
    console.log(this.pageNo,this.stopList[index]['seqNo']);
    
    if (this.selectedStop >= 0) {
      this.markersArray[index].setIcon({
        url: 'assets/images/circlurar-marker.png',
        labelOrigin: { x: 15, y: 18 }
      })
    }
    let index1 = (this.pageNo-1)*10 + index;
    if(!this.isSearchText){
      this.selectedStop = index1;
    }
      this.markersArray[index].setIcon({
        url: 'assets/images/yellow-map-pin.png',
        labelOrigin: { x: 15, y: 18 }
      });
    const lat = this.stopList[index1].lat;
    const long = this.stopList[index1].long;
    let positionCenter = {
      lat:lat,
      lng:long
    }
    this.map.setCenter(positionCenter);
    this.map.setZoom(15);
    this.infoWindow = this.setInfoWindow(index1, lat, long);
    this.infoWindow.open(this.map, this.markersArray[index]);
    if(stopId){
      this.routeData = null;
      this.getRoutes(stopId); 
    }
  }

  getRoutes(stopId) {
   this.isRouteData = true; 
   this.routeData =  this.stopService.getRoutes(stopId)
   .then(res =>{
     this.routeData = res;
     this.isRouteData = false; 
   })
   .catch(err=>{
    console.log(err);
    this.isRouteData = false; 
   });
  }

  setInfoWindow(index, lat, long) {
    let infoWindow;

    const content = document.createElement('div');
    content.className = 'info-window-wrapper';

    const stop = this.stopList[index].stopName;
    const stopNameContainer = document.createElement('div');
    const stopName = document.createElement('span');
    stopName.innerHTML = stop;
    stopName.setAttribute('id', 'stopName');
    stopNameContainer.appendChild(stopName);

    if(this.userRole !== 'data executive') {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'pd-5';
      const actionButtonContainer = document.createElement('div');
      actionButtonContainer.className = 'position';
      const editButton = document.createElement('span');
      const editIcon = document.createElement('img');
      editIcon.src = "../../../../../assets/images/pencil-alt-solid.png";
      editIcon.className = 'edit-icon';
      editButton.appendChild(editIcon);
      editButton.onclick = () => {
        this.editStop(index)
      };
      actionButtonContainer.appendChild(editButton);
      content.appendChild(stopNameContainer);
      content.appendChild(actionButtonContainer);
    }else {
      content.appendChild(stopNameContainer);
    }

    if (this.infoWindow) {
      this.infoWindow.close();
    }
    infoWindow = new google.maps.InfoWindow({
      content: content,
      position: { lat: lat, lng: long },
    })
    return infoWindow;
  }

  editStop(index,fromList?) {
    if(fromList) {
       index = (this.pageNo-1)*10 + index;
    }
    if(this.languageList && this.languageList.length){
      this.stopList[index]['languageList'] = this.languageList; 
    }
    localStorage.setItem('stopData',JSON.stringify(this.stopList[index]));
    this.router.navigate(['editStop'], { relativeTo: this.activatedRoute });
  }
  getStopTranslatedName(stop) {
    return stop['ls'][Object.keys(stop['ls'])[0]]['name'];
  }

  close() {
    this.stopMasterForm.controls.searchText.setValue('');
    this.stopList = [...this.stops];
    this.pageNo = 1;
    this.isSearchText = false;
    this.pageChanged(this.pageNo);
  }
}


