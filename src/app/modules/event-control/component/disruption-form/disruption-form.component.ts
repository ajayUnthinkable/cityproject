import { Component} from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { Validators, FormBuilder, FormControl} from '@angular/forms';
import {  MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { csv2json } from 'csvjson-csv2json';
import { Helpers } from '../../../../../providers/helper';
import { EventControlDataService } from '../../event-control.services';

@Component({
  selector: 'app-disruption-form',
  templateUrl: './disruption-form.component.html',
  styleUrls: ['./disruption-form.component.scss']
})
export class DisruptionFormComponent {

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
  cityEmitter: any;
  checked:any;
  mode:any;

  constructor(private formBuilder: FormBuilder, private router: Router, private helpers: Helpers, private eventControlDataService: EventControlDataService, private snackBar: MatSnackBar, private _sanitizer: DomSanitizer, private helper: Helpers, private route: ActivatedRoute) {
    this.cityEmitter = this.helpers.changeCityEmitter.subscribe((data) => {
        this.routes = null;
        this.ngOnInit();
    });
    this.route.queryParams.subscribe(params => {
        this.mode = params['mode'];
      });
  }

  ngOnInit() {
    this.getRoutes(true);
    this.getBannerImagesForBanner(false);
    this.getBannerImagesForDialogue(false);
    this.createForm();
    this.formChangesEvent();
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

createForm() {
    this.eventForm = this.formBuilder.group({
        name: new FormControl(null, [<any>Validators.required]),
        routeIds: new FormControl(null, [<any>Validators.required]),
        r: new FormControl('false', [<any>Validators.required]),
        rD: new FormControl('false', [<any>Validators.required]),
        isRouteScreen: new FormControl(false, [<any>Validators.required]),
        routeBannerVisiblity: new FormControl(false, [<any>Validators.required]),
        routeBannerTitle: new FormControl(null),
        routeBannerStyle: new FormControl(1, null),
        routeBannerIcon: new FormControl(null),
        routeBannerCTALabel: new FormControl(null),
        routeBannerCTAAction: new FormControl(null),
        routeBannerCTALink: new FormControl(null, [Validators.pattern('https?://.+')]),
        routeDialogVisiblity: new FormControl(false, [<any>Validators.required]),
        routeDialogShowDialogFirst: new FormControl(null),
        routeDialogIcon: new FormControl(null),
        routeDialogHeadingText: new FormControl(null),
        routeDialogBodyText: new FormControl(null),
        routeDialogCTAText: new FormControl(null),
        isHomeScreen: new FormControl(false, [<any>Validators.required]),
        homeMessageFrom: new FormControl(1, [<any>Validators.required]),
        home1Icon: new FormControl(null),
        home1Heading: new FormControl(null),
        home1BodyCopy: new FormControl(null),
        home1CTALable: new FormControl(null),
        home1CTALink: new FormControl(null, [Validators.pattern('https?://.+')]),
        home2Icon: new FormControl(null),
        home2Message: new FormControl(null),
        home2CTALable: new FormControl(null),
        home2CTALink: new FormControl(null, [Validators.pattern('https?://.+')]),
        timelineType: new FormControl('oneTime', [<any>Validators.required]),
        startDate: new FormControl(null, [<any>Validators.required]),
        startTime: new FormControl(null, [<any>Validators.required]),
        endDate: new FormControl(null, [<any>Validators.required]),
        endTime: new FormControl(null, [<any>Validators.required])
    });
    this.setFormData();
}

setFormData() {
    this.editItem = this.eventControlDataService.getEditData();
    if (this.editItem) {
        this.eventForm.patchValue({
            name: this.editItem.data.eventDetails.name,
            routeIds: this.editItem.data.eventDetails.routeIds,
            r: this.editItem.data.eventDetails.r ? 'true' : 'false',
            rD: this.editItem.data.eventDetails.rD ? 'true' : 'false',
            isRouteScreen: this.editItem.data.routeScreenMessage ? true : false,
            routeBannerVisiblity: this.editItem.data.routeScreenMessage && this.editItem.data.routeScreenMessage.title ? true : false,
            routeBannerTitle: this.editItem.data.routeScreenMessage ? this.editItem.data.routeScreenMessage.title : null,
            routeBannerStyle: this.editItem.data.routeScreenMessage ? this.editItem.data.routeScreenMessage.style : 1,
            routeBannerIcon: this.editItem.data.routeScreenMessage ? this.editItem.data.routeScreenMessage.imageUrl : null,
            routeBannerCTALabel: this.editItem.data.routeScreenMessage && this.editItem.data.routeScreenMessage.cta ? this.editItem.data.routeScreenMessage.cta : null,
            routeBannerCTAAction: this.editItem.data.routeScreenMessage && this.editItem.data.routeScreenMessage.ctaAction && this.editItem.data.routeScreenMessage.ctaAction == 'Dialog' ? 'Dialog' : 'Open Link',
            routeBannerCTALink: this.editItem.data.routeScreenMessage && this.editItem.data.routeScreenMessage.ctaAction && this.editItem.data.routeScreenMessage.ctaAction == 'Dialog' ? null : (this.editItem.data.routeScreenMessage && this.editItem.data.routeScreenMessage.ctaAction ? this.editItem.data.routeScreenMessage.ctaAction : null),
            routeDialogVisiblity: this.editItem.data.routeScreenMessage && this.editItem.data.routeScreenMessage.ctaAction && this.editItem.data.routeScreenMessage.ctaAction == 'Dialog' ? true : false,
            routeDialogShowDialogFirst: this.editItem.data.routeScreenMessage ? (this.editItem.data.routeScreenMessage.dialogVisibility ? 'true' : 'false') : null,
            routeDialogIcon: this.editItem.data.routeScreenMessage ? this.editItem.data.routeScreenMessage.dialogImage : null,
            routeDialogHeadingText: this.editItem.data.routeScreenMessage ? this.editItem.data.routeScreenMessage.dialogTitle : null,
            routeDialogBodyText: this.editItem.data.routeScreenMessage ? this.editItem.data.routeScreenMessage.dialogSubtitle : null,
            routeDialogCTAText: this.editItem.data.routeScreenMessage ? this.editItem.data.routeScreenMessage.dialogCtaTitle : null,
            isHomeScreen: this.editItem.data.homeScreenMessage ? true : false,
            homeMessageFrom: this.editItem.data.homeScreenMessage && this.editItem.data.homeScreenMessage.availabilityStatus && this.editItem.data.homeScreenMessage.availabilityStatus == 'high' ? 1 : 2,
            home1Icon: this.editItem.data.homeScreenMessage && this.editItem.data.homeScreenMessage.availabilityStatus && this.editItem.data.homeScreenMessage.availabilityStatus == 'high' && this.editItem.data.homeScreenMessage.data && this.editItem.data.homeScreenMessage.data.imageUrl ? this.editItem.data.homeScreenMessage.data.imageUrl : null,
            home1Heading: this.editItem.data.homeScreenMessage && this.editItem.data.homeScreenMessage.availabilityStatus && this.editItem.data.homeScreenMessage.availabilityStatus == 'high' && this.editItem.data.homeScreenMessage.data && this.editItem.data.homeScreenMessage.data.titleText ? this.editItem.data.homeScreenMessage.data.titleText : null,
            home1BodyCopy: this.editItem.data.homeScreenMessage && this.editItem.data.homeScreenMessage.availabilityStatus && this.editItem.data.homeScreenMessage.availabilityStatus == 'high' && this.editItem.data.homeScreenMessage.data && this.editItem.data.homeScreenMessage.data.subtitleText ? this.editItem.data.homeScreenMessage.data.subtitleText : null,
            home1CTALable: this.editItem.data.homeScreenMessage && this.editItem.data.homeScreenMessage.availabilityStatus && this.editItem.data.homeScreenMessage.availabilityStatus == 'high' && this.editItem.data.homeScreenMessage.data && this.editItem.data.homeScreenMessage.data.buttonText ? this.editItem.data.homeScreenMessage.data.buttonText : null,
            home1CTALink: this.editItem.data.homeScreenMessage && this.editItem.data.homeScreenMessage.availabilityStatus && this.editItem.data.homeScreenMessage.availabilityStatus == 'high' && this.editItem.data.homeScreenMessage.data && this.editItem.data.homeScreenMessage.data.buttonCta ? this.editItem.data.homeScreenMessage.data.buttonCta : null,
            home2Icon: this.editItem.data.homeScreenMessage && this.editItem.data.homeScreenMessage.availabilityStatus && this.editItem.data.homeScreenMessage.availabilityStatus == 'medium' && this.editItem.data.homeScreenMessage.data && this.editItem.data.homeScreenMessage.data.imageUrl ? this.editItem.data.homeScreenMessage.data.imageUrl : null,
            home2Message: this.editItem.data.homeScreenMessage && this.editItem.data.homeScreenMessage.availabilityStatus && this.editItem.data.homeScreenMessage.availabilityStatus == 'medium' && this.editItem.data.homeScreenMessage.data && this.editItem.data.homeScreenMessage.data.titleText ? this.editItem.data.homeScreenMessage.data.titleText : null,
            home2CTALable: this.editItem.data.homeScreenMessage && this.editItem.data.homeScreenMessage.availabilityStatus && this.editItem.data.homeScreenMessage.availabilityStatus == 'medium' && this.editItem.data.homeScreenMessage.data && this.editItem.data.homeScreenMessage.data.buttonText ? this.editItem.data.homeScreenMessage.data.buttonText : null,
            home2CTALink: this.editItem.data.homeScreenMessage && this.editItem.data.homeScreenMessage.availabilityStatus && this.editItem.data.homeScreenMessage.availabilityStatus == 'medium' && this.editItem.data.homeScreenMessage.data && this.editItem.data.homeScreenMessage.data.buttonCta ? this.editItem.data.homeScreenMessage.data.buttonCta : null,
            timelineType: this.editItem.data.timelines && this.editItem.data.timelines.type == 'oneTime' ? 'oneTime' : 'recurring'
        })
        if (this.editItem.data.timelines && this.editItem.data.timelines.type == 'oneTime') {
            this.eventForm.controls.startDate.setValue(new Date(this.editItem.data.timelines.startTime));
            this.eventForm.controls.endDate.setValue(new Date(this.editItem.data.timelines.endTime));
            this.eventForm.controls.startTime.setValue(moment(this.editItem.data.timelines.startTime).format('h:mm a'));
            this.eventForm.controls.endTime.setValue(moment(this.editItem.data.timelines.endTime).format('h:mm a'));
        } else {
            this.eventForm.controls.startDate.setValue(new Date(this.editItem.data.timelines.startDate));
            this.eventForm.controls.endDate.setValue(new Date(this.editItem.data.timelines.endDate));
            this.eventForm.controls.startTime.setValue(this.editItem.data.timelines.startTime);
            this.eventForm.controls.endTime.setValue(this.editItem.data.timelines.endTime);
        }
    }
}

formChangesEvent() {
    this.eventForm.get('routeBannerVisiblity').valueChanges
        .subscribe(value => {
            if (value) {
                this.eventForm.get('routeBannerTitle').setValidators([Validators.required]);
                this.eventForm.get('routeBannerStyle').setValidators([Validators.required]);
                this.eventForm.get('routeBannerIcon').setValidators([Validators.required]);
            } else {
                this.eventForm.get('routeBannerTitle').setValidators([]);
                this.eventForm.get('routeBannerStyle').setValidators([]);
                this.eventForm.get('routeBannerIcon').setValidators([]);
            }
            this.eventForm.get('routeBannerTitle').updateValueAndValidity();
            this.eventForm.get('routeBannerStyle').updateValueAndValidity();
            this.eventForm.get('routeBannerIcon').updateValueAndValidity();
        });

    this.eventForm.get('routeBannerCTAAction').valueChanges
        .subscribe(value => {
            if (value == 'Dialog') {
                this.eventForm.controls.routeDialogVisiblity.setValue(true);
                this.eventForm.controls.routeBannerCTALink.setValue(null);
            } else {
                this.eventForm.controls.routeDialogVisiblity.setValue(false);
            }
        });

    this.eventForm.get('routeDialogVisiblity').valueChanges
        .subscribe(value => {
            if (value) {
                this.eventForm.get('routeDialogShowDialogFirst').setValidators([Validators.required]);
                this.eventForm.get('routeDialogIcon').setValidators([Validators.required]);
                this.eventForm.get('routeDialogHeadingText').setValidators([Validators.required]);
                this.eventForm.get('routeDialogBodyText').setValidators([Validators.required]);
                this.eventForm.get('routeDialogCTAText').setValidators([Validators.required]);
            } else {
                this.eventForm.get('routeDialogShowDialogFirst').setValidators([]);
                this.eventForm.get('routeDialogIcon').setValidators([]);
                this.eventForm.get('routeDialogHeadingText').setValidators([]);
                this.eventForm.get('routeDialogBodyText').setValidators([]);
                this.eventForm.get('routeDialogCTAText').setValidators([]);
            }
            this.eventForm.get('routeDialogShowDialogFirst').updateValueAndValidity();
            this.eventForm.get('routeDialogIcon').updateValueAndValidity();
            this.eventForm.get('routeDialogHeadingText').updateValueAndValidity();
            this.eventForm.get('routeDialogBodyText').updateValueAndValidity();
            this.eventForm.get('routeDialogCTAText').updateValueAndValidity();
        });

    this.eventForm.get('isHomeScreen').valueChanges
        .subscribe(value => {
            if (value) {
                this.eventForm.controls.homeMessageFrom.setValue(1);
            } else {
                this.eventForm.get('home1Icon').setValidators([]);
                this.eventForm.get('home1Heading').setValidators([]);
                this.eventForm.get('home1BodyCopy').setValidators([]);
                this.eventForm.get('home1CTALable').setValidators([]);
                this.eventForm.get('home2Icon').setValidators([]);
                this.eventForm.get('home2Message').setValidators([]);
            }
            this.eventForm.get('home1Icon').updateValueAndValidity();
            this.eventForm.get('home1Heading').updateValueAndValidity();
            this.eventForm.get('home1BodyCopy').updateValueAndValidity();
            this.eventForm.get('home1CTALable').updateValueAndValidity();
            this.eventForm.get('home2Icon').updateValueAndValidity();
            this.eventForm.get('home2Message').updateValueAndValidity();
        });

    this.eventForm.get('homeMessageFrom').valueChanges
        .subscribe(value => {
            if (value == 1) {
                this.eventForm.get('home1Icon').setValidators([Validators.required]);
                this.eventForm.get('home1Heading').setValidators([Validators.required]);
                this.eventForm.get('home1BodyCopy').setValidators([Validators.required]);
                this.eventForm.get('home1CTALable').setValidators([Validators.required]);
                this.eventForm.get('home1CTALink').setValidators([Validators.required, Validators.pattern('https?://.+')]);
                this.eventForm.get('home2Icon').setValidators([]);
                this.eventForm.get('home2Message').setValidators([]);
            } else {
                this.eventForm.get('home2Icon').setValidators([Validators.required]);
                this.eventForm.get('home2Message').setValidators([Validators.required]);
                this.eventForm.get('home1Icon').setValidators([]);
                this.eventForm.get('home1Heading').setValidators([]);
                this.eventForm.get('home1BodyCopy').setValidators([]);
                this.eventForm.get('home1CTALable').setValidators([]);
                this.eventForm.get('home1CTALink').setValidators([Validators.pattern('https?://.+')]);
            }
            this.eventForm.get('home1Icon').updateValueAndValidity();
            this.eventForm.get('home1Heading').updateValueAndValidity();
            this.eventForm.get('home1BodyCopy').updateValueAndValidity();
            this.eventForm.get('home1CTALable').updateValueAndValidity();
            this.eventForm.get('home1CTALink').updateValueAndValidity();
            this.eventForm.get('home2Icon').updateValueAndValidity();
            this.eventForm.get('home2Message').updateValueAndValidity();
        });
}

toggleAllSelection() {
    this.eventForm.controls.routeIds.setValue([...this.routesId]);
}

deselectAllSelection() {
    this.eventForm.controls.routeIds.setValue(null);
}

setImageUrl(url, formControl) {
    this.eventForm.controls[formControl].setValue(url);
}

checkValidation() {
    if (this.eventForm.controls.isRouteScreen.value && this.eventForm.controls.routeBannerVisiblity.value) {
        if ((this.eventForm.controls.routeBannerCTALabel.value && this.eventForm.controls.routeBannerCTALabel.value.trim()) ||
            (this.eventForm.controls.routeBannerCTALink.value && this.eventForm.controls.routeBannerCTALink.value.trim())
        ) {
            if (this.eventForm.controls.routeBannerCTALabel.value && this.eventForm.controls.routeBannerCTALabel.value.trim()) {
            } else {
                this.showToaster('Please enter Button label and link value');
                return;
            }
            if (this.eventForm.controls.routeBannerCTAAction.value == 'Open Link') {
                if (this.eventForm.controls.routeBannerCTALink.value && this.eventForm.controls.routeBannerCTALink.value.trim()) {
                } else {
                    this.showToaster('Please enter Button label and link value');
                    return;
                }
            }
        }
    }

    if (this.eventForm.controls.isHomeScreen.value && this.eventForm.controls.homeMessageFrom.value == 2) {
        if ((this.eventForm.controls.home2CTALable.value && this.eventForm.controls.home2CTALable.value.trim()) ||
            (this.eventForm.controls.home2CTALink.value && this.eventForm.controls.home2CTALink.value.trim())
        ) {
            if (this.eventForm.controls.home2CTALable.value && this.eventForm.controls.home2CTALable.value.trim()) {
            } else {
                this.showToaster('Please enter Button label and link value');
                return;
            }
            if (this.eventForm.controls.home2CTALink.value && this.eventForm.controls.home2CTALink.value.trim()) {
            } else {
                this.showToaster('Please enter Button label and link value');
                return;
            }
        }
    }
    this.save();
}

save() {
    this.showLoader();
    this.isSaveDisable = true;
    const dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
    const cityName = dispatchInfo.city.name.toLowerCase();
    const userInfo = this.helpers.getUserDetails();
    let dataToSend = {};
    dataToSend['eventDetails'] = {
        name: this.eventForm.controls.name.value.trim(),
        routeIds: this.eventForm.controls.routeIds.value,
        r: this.eventForm.controls.r.value == 'true' || this.eventForm.controls.r.value == true ? true : false,
        rD: this.eventForm.controls.rD.value == 'true' || this.eventForm.controls.rD.value == true ? true : false,
        createdBy: userInfo.email,
        city: cityName
    };
    if (this.eventForm.controls.isRouteScreen.value && (this.eventForm.controls.routeBannerVisiblity.value || this.eventForm.controls.routeDialogVisiblity.value)) {
        dataToSend['routeScreenMessage'] = {
            // isVisible: this.eventForm.controls.routeBannerVisiblity.value,
            title: this.eventForm.controls.routeBannerTitle.value.trim(),
            style: this.eventForm.controls.routeBannerStyle.value,
            imageUrl: this.eventForm.controls.routeBannerIcon.value,
            ctaVisibility: this.eventForm.controls.routeBannerCTALabel.value || this.eventForm.controls.routeBannerCTAAction.value ? true : false,
            cta: this.eventForm.controls.routeBannerCTALabel.value ? this.eventForm.controls.routeBannerCTALabel.value : '',
            ctaAction: this.eventForm.controls.routeBannerCTAAction.value == 'Dialog' ? this.eventForm.controls.routeBannerCTAAction.value : (this.eventForm.controls.routeBannerCTALink.value ? this.eventForm.controls.routeBannerCTALink.value : ''),
            // dialogVisibility: this.eventForm.controls.routeDialogVisiblity.value,
            dialogVisibility: this.eventForm.controls.routeDialogShowDialogFirst.value == 'true' || this.eventForm.controls.routeDialogShowDialogFirst.value == true ? true : false,
            dialogImage: this.eventForm.controls.routeDialogIcon.value ? this.eventForm.controls.routeDialogIcon.value : '',
            dialogTitle: this.eventForm.controls.routeDialogHeadingText.value ? this.eventForm.controls.routeDialogHeadingText.value : '',
            dialogSubtitle: this.eventForm.controls.routeDialogBodyText.value ? this.eventForm.controls.routeDialogBodyText.value : '',
            dialogCtaTitle: this.eventForm.controls.routeDialogCTAText.value ? this.eventForm.controls.routeDialogCTAText.value : '',
            dialogCta: ''
        }
    }
    if (this.eventForm.controls.isHomeScreen.value) {
        dataToSend['homeScreenMessage'] = {
            'type': this.eventForm.controls.homeMessageFrom.value == 1 ? 'inApp' : 'persistence',
            'data': {}
        };
        // dataToSend['homeScreenMessage'][cityName] = {
        //     'data': {}
        // };
        if (this.eventForm.controls.homeMessageFrom.value == 1) {
            dataToSend['homeScreenMessage']['data'].imageUrl = this.eventForm.controls.home1Icon.value;
            dataToSend['homeScreenMessage']['data'].titleText = this.eventForm.controls.home1Heading.value ? this.eventForm.controls.home1Heading.value : '';
            dataToSend['homeScreenMessage']['data'].subtitleText = this.eventForm.controls.home1BodyCopy.value ? this.eventForm.controls.home1BodyCopy.value : '';
            dataToSend['homeScreenMessage']['data'].buttonText = this.eventForm.controls.home1CTALable.value ? this.eventForm.controls.home1CTALable.value : '';
            dataToSend['homeScreenMessage']['data'].buttonCta = this.eventForm.controls.home1CTALink.value ? this.eventForm.controls.home1CTALink.value : '';
            dataToSend['homeScreenMessage']['data'].buttonVisibility = this.eventForm.controls.home1CTALable.value ? 1 : 0;
        }
        if (this.eventForm.controls.homeMessageFrom.value == 2 || this.eventForm.controls.homeMessageFrom.value == 3) {
            dataToSend['homeScreenMessage']['data'].imageUrl = this.eventForm.controls.home2Icon.value;
            dataToSend['homeScreenMessage']['data'].titleText = this.eventForm.controls.home2Message.value;
            dataToSend['homeScreenMessage']['data'].buttonText = this.eventForm.controls.home2CTALable.value ? this.eventForm.controls.home2CTALable.value : '';
            dataToSend['homeScreenMessage']['data'].buttonCta = this.eventForm.controls.home2CTALink.value ? this.eventForm.controls.home2CTALink.value : '';
            dataToSend['homeScreenMessage']['data'].buttonVisibility = this.eventForm.controls.home2CTALable.value ? 1 : 0;
        }
    }
    dataToSend['timelines'] = {
        type: this.eventForm.controls.timelineType.value
    };
    if (dataToSend['timelines'].type == 'recurring') {
        dataToSend['timelines']['days'] = [1, 1, 1, 1, 1, 1, 1];
        dataToSend['timelines']['startDate'] = moment(this.eventForm.controls.startDate.value).valueOf();
        dataToSend['timelines']['startTime'] = this.eventForm.controls.startTime.value;
        dataToSend['timelines']['endDate'] = moment(this.eventForm.controls.endDate.value).valueOf();
        dataToSend['timelines']['endTime'] = this.eventForm.controls.endTime.value;
    } else {
        dataToSend['timelines']['startTime'] = moment(this.eventForm.controls.startDate.value).hours(moment(this.eventForm.controls.startTime.value, 'h:mm a').hours()).minutes(moment(this.eventForm.controls.startTime.value, 'h:mm a').minutes()).valueOf();
        dataToSend['timelines']['endTime'] = moment(this.eventForm.controls.endDate.value).hours(moment(this.eventForm.controls.endTime.value, 'h:mm a').hours()).minutes(moment(this.eventForm.controls.endTime.value, 'h:mm a').minutes()).valueOf();
    }
    dataToSend['timelines']['expiryTime'] = moment(this.eventForm.controls.endDate.value).hours(moment(this.eventForm.controls.endTime.value, 'h:mm a').hours()).minutes(moment(this.eventForm.controls.endTime.value, 'h:mm a').minutes()).valueOf();
    if (this.editItem && this.editItem.eventId) {
        const obj = {
            eventId: this.editItem.eventId,
            data: dataToSend
        };
        if(this.mode==='edit'){
            obj['city'] = cityName
        }
        obj.data['eventDetails']['isDeployed'] = this.editItem.data.eventDetails.isDeployed;
        this.editEvent(obj);
    } else {
        this.eventControlDataService.saveEvent(dataToSend).then((res) => {
            this.isSaveDisable = false;
            this.showToaster('Event saved successfully');
            this.back();
        }, (err) => {
            this.isSaveDisable = false;
            this.showToaster('Something went wrong. Plaese try again');
        });
    }
}

editEvent(dataToSend) {
    this.showLoader();
    this.eventControlDataService.editEvent(dataToSend).then((res) => {
        this.isSaveDisable = false;
        this.showToaster('Event edited successfully');
        // this.back();
        this.router.navigateByUrl('/home/event-control/event-list/eventControlForm');  
    }, (err) => {
        this.isSaveDisable = false;
        this.showToaster('Something went wrong. Plaese try again');
    });
}

publishOnProd() {
    if (!this.editItem) {
        return;
    }
    const dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
    const cityName = dispatchInfo.city.name.toLowerCase();
    const dataToSend = {
        eventId: this.editItem.eventId,
        city:cityName
    }
    this.isSaveDisable = true;
    this.showLoader();
    this.eventControlDataService.deployToProduction(dataToSend).then((res) => {
        this.isSaveDisable = false;
        this.showToaster('Event deployed successfully on production');
        this.back();
    }, (err) => {
        this.isSaveDisable = false;
        this.showToaster('Something went wrong. Plaese try again');
    });
}

publishOnDev() {
    if (!this.editItem) {
        return;
    }
    const dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
    const cityName = dispatchInfo.city.name.toLowerCase();
    const dataToSend = {
        eventId: this.editItem.eventId,
        city:cityName
    }
    this.isSaveDisable = true;
    this.showLoader();
    this.eventControlDataService.deployToDev(dataToSend).then((res) => {
        this.isSaveDisable = false;
        this.showToaster('Event deployed successfully on development');
        this.back();
    }, (err) => {
        this.isSaveDisable = false;
        this.showToaster('Something went wrong. Plaese try again');
    });
}

back() {
    this.router.navigate(['home/event-control']);
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

getImage(image) {
    return this._sanitizer.bypassSecurityTrustStyle(`url("${image}")`);
}

selectFile() {
    event.preventDefault();
    document.getElementById('file-upload1').click();
}

fileSelected(e) {
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    // document.getElementById('input-text1').innerHTML = file.name;
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (fileLoadedEvent) => {
        const textFromFileLoaded = fileLoadedEvent.currentTarget ? fileLoadedEvent.currentTarget['result'] :
            fileLoadedEvent.target['result'];
        this.csvJSON = csv2json(textFromFileLoaded, { parseNumbers: true });
        // this.csvJSON = JSON.parse(jsonData);
        this.addRoutes();
    };
    reader.readAsText(e.target.files[0], 'UTF-8');
}

addRoutes() {
    let routesValue = this.eventForm.controls.routeIds.value;
    if (!routesValue) {
        routesValue = [];
    }
    for (let index = 0; index < this.csvJSON.length; index++) {
        if (this.routesId.indexOf(this.csvJSON[index].route_id) > -1 && routesValue.indexOf(this.csvJSON[index].route_id) < 0) {
            routesValue.push(this.csvJSON[index].route_id);
        }
    }
    this.eventForm.controls.routeIds.setValue(routesValue);
}

ngOnDestroy() {
    this.cityEmitter.unsubscribe();
}


} 

