import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Validators, FormBuilder, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import {  MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { ActivatedRoute, Event, Router } from '@angular/router';
import { csv2json } from 'csvjson-csv2json';
import { Helpers } from '../../../../../providers/helper';
import { EventControlDataService } from '../../event-control.services';

@Component({
    selector: 'app-event-details-form',
    templateUrl: './event-details-form.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./event-details-form.component.scss']
})

export class EventDetailsFormComponent {

    routes: any;
    routesId: any;
    bgImages: any;
    eventForm: any;
    isSaveDisable = false;
    bgImagesForRoute: any;
    bgImagesForHome: any;
    editItem: any;
    csvJSON: any;
    fileName: any;
    mode:any;
    page:any;
    cityEmitter: any;
    currentlyChecked:any;
    constructor(private formBuilder: FormBuilder, private router: Router, private helpers: Helpers, private eventControlDataService: EventControlDataService, private snackBar: MatSnackBar, private _sanitizer: DomSanitizer, private helper: Helpers,private route:ActivatedRoute) {
        this.cityEmitter = this.helpers.changeCityEmitter.subscribe((data) => {
            this.routes = null;
            this.ngOnInit();
        });
        this.route.queryParams.subscribe(params => {
            this.mode = params['mode'];
            this.page = params['page'];
            if(this.mode==='add' && this.page==='eventControlForm') {
                this.currentlyChecked='DisruptionFormComponent';   
            }else {
                if(this.mode==='add' && this.page==='HomeScreenUpdateForm') {
                  this.currentlyChecked='HomeScreenUpdateForm';   
                }
            }
            if(this.mode==='edit' && this.page==='HomeScreenUpdate') {
                this.currentlyChecked='HomeScreenUpdateForm';   
            }else if(this.mode==='edit' && this.page==='disruptionUpdate') {
                this.currentlyChecked='DisruptionFormComponent';   
            }
          });
    }

    ngOnInit() {
        this.getRoutes(true);
        this.getBannerImagesForBanner(false);
        this.getBannerImagesForDialogue(false);
    }

    getRoutes(isRefresh) {
        this.eventControlDataService.getRoutes(isRefresh).then((res) => {
            this.routes = res;
            this.routesId = [...this.routes.map(item => item.route_id)];
        });
    }

    getBannerImagesForBanner(isRefresh) {
        this.eventControlDataService.getBannerImagesForBanner(isRefresh).then((res) => {
            this.bgImagesForRoute = res;
        });
    }

    getBannerImagesForDialogue(isRefresh) {
        this.eventControlDataService.getBannerImagesForDialogue(isRefresh).then((res) => {
            this.bgImagesForHome = res;
        });
    }

    showToaster(msg) {
        this.snackBar.open(msg, '', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 4000
        });
    }

    showLoader() {
        this.snackBar.open('Please wait...', '', {
            horizontalPosition: 'center',
            panelClass: 'middle-popup'
        });
    }

 
    selectCheckBox(targetType: any,event:Event) {
        this.currentlyChecked = targetType;
      }

    ngOnDestroy() {
        this.cityEmitter.unsubscribe();
    }
}