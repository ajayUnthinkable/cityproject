import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Helpers } from 'src/providers/helper';
import * as _ from 'lodash';
import { EventControlDataService } from '../../event-control.services';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-home-screen-form',
  templateUrl: './home-screen-form.component.html',
  styleUrls: ['./home-screen-form.component.scss']
})
export class HomeScreenFormComponent implements OnInit {
  bgImagesForRoute: any;
  homeScreenUpdateForm: FormGroup;
  url: any;
  cardList: FormArray;
  homeEditItem: any;
  mode: any;
  page: any;
  userInfo;
  allPossibleCities = [];
  isSaveDisabled: boolean = false;
  uniqId = null;
  isDeployed:boolean = false;
  compState = (optionVal: string, selectedVal: string) => {
    return optionVal == selectedVal;
  };
  constructor(private formBuilder: FormBuilder, private eventControlDataService: EventControlDataService, private _sanitizer: DomSanitizer, private helper: Helpers, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getBannerImagesForDialogue(false);
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'];
      this.page = params['page'];
    });
    this.createForm();
    this.userInfo = this.helper.getUserDetails();
    this.allPossibleCities = this.userInfo.city;
    this.homeScreenUpdateForm.valueChanges.subscribe(
      (selectedValue) => {
         if(this.isDeployed && (this.isSaveDisabled===true) && this.mode==='add') {
          this.isSaveDisabled = false;
         }
      }
  );
  this.homeScreenUpdateForm.get('isCTAScreen').valueChanges.subscribe(val => {
    if(val) {
      this.homeScreenUpdateForm.controls['name'].setValidators([Validators.required]);
    }else {
      this.homeScreenUpdateForm.controls['name'].setValidators([]);
    }
    this.homeScreenUpdateForm.controls['name'].updateValueAndValidity();
  });
  if(this.mode==='add') {
    this.formChangesEvent('text',0);
  }
  }

  getBannerImagesForDialogue(isRefresh) {
    this.eventControlDataService.getBannerImagesForDialogue(isRefresh).then((res) => {
      this.bgImagesForRoute = res;
    });
  }

  setImageUrl(url, formControl, index) {
    this.homeScreenUpdateForm.controls.cards['controls'][index].controls[formControl].setValue(url);
  }
  getImage(image) {
    return this._sanitizer.bypassSecurityTrustStyle(`url("${image}")`);
  }

  createForm() {
    const card = this.createNewCard();
    this.homeScreenUpdateForm = this.formBuilder.group({
      eventName: new FormControl(null, [<any>Validators.required]),
      name: new FormControl(null),
      position: new FormControl(null, [<any>Validators.required]),
      cities: this.formBuilder.array([this.createCityControls()]),
      source: new FormControl(null, [Validators.required]),
      isCTAScreen: new FormControl(false),
      rightSideCTAName: new FormControl(null),
      rightSideCTALink: new FormControl(null),
      startDate: new FormControl(null, [<any>Validators.required]),
      startTime: new FormControl(null, [<any>Validators.required]),
      endDate: new FormControl(null, [<any>Validators.required]),
      endTime: new FormControl(null, [<any>Validators.required]),
      cards: this.formBuilder.array([card])
    });

    this.cardList = this.homeScreenUpdateForm.get('cards') as FormArray;
    if (this.mode === 'edit') {
      this.setFormData();
    }
  }

  createNewCard(): FormGroup {
    return this.formBuilder.group({
      routeBannerIcon: new FormControl(null),
      cardType: new FormControl('text', [<any>Validators.required]),
      cardDetailTitle: new FormControl(null, [<any>Validators.required]),
      cardDetailText: new FormControl(null, [<any>Validators.required]),
      cardDetailCTAText: new FormControl(null),
      cardDetailImageCTA: new FormControl(null),
      cardImages: new FormControl(null),
      cardImages1: new FormControl(null),
      iconImages: new FormControl(null),
      iconImages1: new FormControl(null),
    });
  }

  createCityControls(): FormGroup {
    return this.formBuilder.group({
      cityName: new FormControl([], [<any>Validators.required])
    });
  }

  getCityControls() {
    return (this.homeScreenUpdateForm.get('cities') as FormArray).controls;
  }

  getArrayLength(array) {
    return array.length;
  }

  getControlCount() {
    return (this.homeScreenUpdateForm.get('cities') as FormArray).length;
  }

  getRemainingCities(controlValue: string, index) {
    let result = [...this.allPossibleCities];
    let result1 = result.map(item => item.name);
    const controls = (this.homeScreenUpdateForm.get('cities') as FormArray).controls;
    for (let control of controls) {
      if (control.value.cityName !== null) {
        let index1 = result1.indexOf(control.value.cityName);
        if (index1 > -1) {
          result1.splice(index1, 1);
        }
      }
    }
    if (controlValue['cityName'].length) {
      result1.unshift(controlValue['cityName']);
    }

    return result1;
  }

  addNewCity() {
    (this.homeScreenUpdateForm.get('cities') as FormArray).push(this.createCityControls());
  }

  removeCity(index, controlValue) {
    (this.homeScreenUpdateForm.get('cities') as FormArray).removeAt(index);
  }

  setFormData() {
    this.homeEditItem = this.eventControlDataService.getHomeScreenDetails();
    console.log(this.homeEditItem);
    if (this.homeEditItem) {

      if(this.mode=='edit') {
        this.homeScreenUpdateForm.controls['eventName'].disable();
      }

      if(this.homeEditItem.config.header && this.homeEditItem.config.header.text){
        this.homeScreenUpdateForm.get('isCTAScreen').setValue(true);
      }

      this.homeScreenUpdateForm.patchValue({
        eventName: this.homeEditItem.id,
        name: this.homeEditItem.config.header && this.homeEditItem.config.header.text,
        position: this.homeEditItem.config.pos,
        source: this.homeEditItem.source,
        rightSideCTALink: (this.homeEditItem.config.header && this.homeEditItem.config.header.hookCta) ? this.homeEditItem.config.header.hookCta : '',
        rightSideCTAName: (this.homeEditItem.config.header && this.homeEditItem.config.header.hook) ? this.homeEditItem.config.header.hook : '',
        startTime: moment(this.homeEditItem.timeLine.startTime).utc().format("h:mm A"),
        endTime: moment(this.homeEditItem.timeLine.endTime).utc().format("hh:mm A")
      })
      this.homeScreenUpdateForm.controls.startDate.setValue(new Date(this.homeEditItem.timeLine.startTime));
      this.homeScreenUpdateForm.controls.endDate.setValue(new Date(this.homeEditItem.timeLine.endTime));
      for (let i = 0; i < this.homeEditItem.cities.length; i++) {
        if (i > 0) {
          const city = this.createCityControls();
          (this.homeScreenUpdateForm.get('cities') as FormArray).push(city);
        }
        this.homeScreenUpdateForm.controls.cities['controls'][i].patchValue({
          cityName: this.homeEditItem.cities[i]
        })
      }
      for (let i = 0; i < this.homeEditItem.config.content.length; i++) {
        if (i > 0) {
          const card = this.createNewCard();
          this.cardList.push(card);
        }
        if (this.homeEditItem.config.content[i].defaultUser.title && this.homeEditItem.config.content[i].defaultUser.title.text) {
          this.homeScreenUpdateForm.controls.cards['controls'][i].patchValue({
            routeBannerIcon: this.homeEditItem.config.content[i].defaultUser.background.visible ? this.homeEditItem.config.content[i].defaultUser.background.url : '',
            cardType: 'text',
            cardDetailTitle: this.homeEditItem.config.content[i].defaultUser.title.text,
            cardDetailText: this.homeEditItem.config.content[i].defaultUser.body.text,
            cardDetailCTAText: this.homeEditItem.config.content[i].defaultUser.action ? this.homeEditItem.config.content[i].defaultUser.action : '',
            iconImages: this.homeEditItem.config.content[i].defaultUser.background.visible == false ? this.homeEditItem.config.content[i].defaultUser.background.url : '',
            iconImages1: this.homeEditItem.config.content[i].defaultUser.background.visible == false ? this.homeEditItem.config.content[i].defaultUser.background.url : '',
          })
          this.formChangesEvent('text', i);

        } else {
          this.homeScreenUpdateForm.controls.cards['controls'][i].patchValue({
            cardType: 'image',
            cardDetailImageCTA: this.homeEditItem.config.content[i].defaultUser.background.action,
            cardImages: this.homeEditItem.config.content[i].defaultUser.background.url,
            cardImages1: this.homeEditItem.config.content[i].defaultUser.background.url
          })
          this.formChangesEvent('image', i);
        }

      }
    }

  }

  formChangesEvent(data, index) {
    console.log(data, index);
    if (data == 'image') {
      this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardImages.setValidators([Validators.required]);
      // this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailImageCTA.setValidators([Validators.required]);
      this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailTitle.setValidators([]);
      this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailText.setValidators([]);
      // this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailCTAText.setValidators([]);
    } else {
      this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardImages.setValidators([]);
      // this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailImageCTA.setValidators([]);
      this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailTitle.setValidators([Validators.required]);
      this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailText.setValidators([Validators.required]);
      // this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailCTAText.setValidators([Validators.required]);
    }
    this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardImages.updateValueAndValidity();
    this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailImageCTA.updateValueAndValidity();
    this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailTitle.updateValueAndValidity();
    this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailText.updateValueAndValidity();
    this.homeScreenUpdateForm.controls.cards['controls'][index].controls.cardDetailCTAText.updateValueAndValidity();
  }

  onSelectFile(event, index, type) {
    let files = event.target.files;
    if (!this.validateFile(files[0].name)) {
      this.helper.showSnackBar("Please select image file");
      return;
    }

    if (event.target.files && event.target.files[0]) {
      this.url = event.target.files[0];
      let reader = new FileReader();
      reader.readAsDataURL(<File>event.target.files[0]);
      event.target.value = null; // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        const url1 = event.target.result;
        if (type === 'image') {
          this.homeScreenUpdateForm.controls.cards['controls'][index].controls['cardImages'].setValue(this.url);
          this.homeScreenUpdateForm.controls.cards['controls'][index].controls['cardImages1'].setValue(url1);
        } else if (type === 'icon') {
          this.homeScreenUpdateForm.controls.cards['controls'][index].controls['iconImages'].setValue(this.url);
          this.homeScreenUpdateForm.controls.cards['controls'][index].controls['iconImages1'].setValue(url1);
        }
      }
    }
  }

  validateFile(name: String) {
    var ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() == 'png' ||
      ext.toLowerCase() == 'jpg' ||
      ext.toLowerCase() == 'jpeg'||
      ext.toLowerCase() == 'bmp' ||
      ext.toLowerCase() == 'gif' ||
      ext.toLowerCase() == 'svg') {
      return true;
    }
    else {
      return false;
    }
  }

  getCategoryControls() {
    return (this.homeScreenUpdateForm.get('cards') as FormArray).controls;
  }

  addNewCard() {
    const index = this.cardList.length;
    if (!this.homeScreenUpdateForm.controls.cards['controls'][index - 1].valid) {
      this.helper.showSnackBar("Please select all fields");
      return;
    }
    const card = this.createNewCard();
    this.cardList.push(card);
  }

  removeCard(index: number) {
    console.log(this.homeScreenUpdateForm);
    if (this.cardList.length <= 1) {
      return;
    }
    (this.homeScreenUpdateForm.get('cards') as FormArray).removeAt(index);

  }

  get cardFormGroup() {
    return this.homeScreenUpdateForm.get('cards') as FormArray;
  }

  drop(event: CdkDragDrop<string[]>) {

    moveItemInArray(this.homeScreenUpdateForm.controls.cards['controls'], event.previousIndex, event.currentIndex);
    console.log(this.homeScreenUpdateForm);
  }

  saveAllImages() {
    let reqData = {};
    let city = [];
    // let city;
    let dataToSend = {};
    let imageUrls = [];

    const cardLength = this.homeScreenUpdateForm.controls.cards['controls'].length;

    console.log(cardLength);

    for (let i = 0; i < cardLength; i++) {
      let cardType = this.homeScreenUpdateForm.controls.cards['controls'][i].controls['cardType'].value;
      console.log(cardType);
      if (cardType === 'image') {
        dataToSend['info'] = { "fileType": "cardImage" };
        dataToSend['file'] = this.homeScreenUpdateForm.controls.cards['controls'][i].controls['cardImages'].value;
        const promise = this.eventControlDataService.getImageUrlFromBucket(dataToSend)
          .then(res => {
            console.log('imageUrls res : ---', res);
            return res;
          });
        imageUrls.push(promise);
      } else if (cardType === 'text') {
        dataToSend['info'] = { "fileType": "cardImage" };
        if (this.homeScreenUpdateForm.controls.cards['controls'][i].controls['iconImages'].value) {
          dataToSend['file'] = this.homeScreenUpdateForm.controls.cards['controls'][i].controls['iconImages'].value;
        }
        else if (this.homeScreenUpdateForm.controls.cards['controls'][i].controls['routeBannerIcon'].value) {
          dataToSend['file'] = this.homeScreenUpdateForm.controls.cards['controls'][i].controls['routeBannerIcon'].value;
        }
        const promise = this.eventControlDataService.getImageUrlFromBucket(dataToSend);
        imageUrls.push(promise);
      }
    }
    console.log(dataToSend);

    Promise.all(imageUrls).then(responses => {
      const userEmail = JSON.parse(localStorage.getItem('userDetails'));
      const dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
      if (this.mode === 'add') {
        reqData['id'] = this.homeScreenUpdateForm.controls.eventName.value + '_' + moment().valueOf();
        this.uniqId = reqData['id'];
      } else if (this.mode === 'edit') {
        reqData['id'] = this.homeScreenUpdateForm.controls.eventName.value;
      }
      reqData['source'] = this.homeScreenUpdateForm.controls.source.value;
      reqData['config'] = {
        pos: this.homeScreenUpdateForm.controls.position.value,
        type: responses.length > 1 ? "hScrollView" : "cardView",
        width: 350,
        height: 80,
        content: [],
        enabled: true,
        version: 1,
        dismissConditions: {
          defaultUser: {
            displayThreshold: 5
          }
        }
      };
        if(this.homeScreenUpdateForm.get('isCTAScreen').value) {
                reqData['config']['header'] = { 
                  text: this.homeScreenUpdateForm.controls.name.value,
                  hook: this.homeScreenUpdateForm.controls.rightSideCTAName.value ? this.homeScreenUpdateForm.controls.rightSideCTAName.value : '',
                  hookCta: this.homeScreenUpdateForm.controls.rightSideCTALink.value ? this.homeScreenUpdateForm.controls.rightSideCTALink.value : ''
                }
        }

      for (let i = 0; i < this.homeScreenUpdateForm.controls.cities['controls'].length; i++) {
        city.push(this.homeScreenUpdateForm.controls.cities['controls'][i].value.cityName.toLowerCase());
      }
      reqData['cities'] = [...city];
      console.log('cities-------', reqData['cities']);
      reqData['timeLine'] = {
        startTime: moment(this.homeScreenUpdateForm.controls.startDate.value).hours(moment(this.homeScreenUpdateForm.controls.startTime.value, 'h:mm a').hours()).minutes(moment(this.homeScreenUpdateForm.controls.startTime.value, 'h:mm a').minutes()).valueOf(),
        endTime: moment(this.homeScreenUpdateForm.controls.endDate.value).hours(moment(this.homeScreenUpdateForm.controls.endTime.value, 'h:mm a').hours()).minutes(moment(this.homeScreenUpdateForm.controls.endTime.value, 'h:mm a').minutes()).valueOf()
      }
      reqData['createdBy'] = userEmail.email;
      reqData['uby'] = userEmail.email;
      reqData['city'] = dispatchInfo.city.name;
      const cards = [];

      responses.forEach((item, index) => {
        if (item) {
          let cardType = this.homeScreenUpdateForm.controls.cards['controls'][index].controls['cardType'].value;
          if (cardType === 'image') {
            let cardData = {
              defaultUser: {
                enabled: true,
                version: 1,
                background: {
                  url: item.url,
                  action: this.homeScreenUpdateForm.controls.cards['controls'][index].controls['cardDetailImageCTA'].value,
                  visible: true
                }
              }
            }
            cards.push(cardData);
          } else {
            if (cardType === 'text') {
              let cardData = {
                defaultUser: {
                  enabled: true,
                  version: 1,
                  action: this.homeScreenUpdateForm.controls.cards['controls'][index].controls['cardDetailCTAText'].value,
                  background: {
                    visible: this.homeScreenUpdateForm.controls.cards['controls'][index].controls['routeBannerIcon'].value ? true : false,
                    url: item.url
                  },
                  title: {
                    text: this.homeScreenUpdateForm.controls.cards['controls'][index].controls['cardDetailTitle'].value

                  },
                  body: {
                    text: this.homeScreenUpdateForm.controls.cards['controls'][index].controls['cardDetailText'].value
                  },
                  positiveBtn: {
                    visible: true,
                    text: "Learn More",
                    cta: this.homeScreenUpdateForm.controls.cards['controls'][index].controls['cardDetailCTAText'].value
                  },
                  negativeBtn: {
                    visible: false,
                    text: "NO",
                    cta: this.homeScreenUpdateForm.controls.cards['controls'][index].controls['cardDetailCTAText'].value
                  }
                }
              }
              cards.push(cardData);
            }
          }
        } else {
          this.helper.showSnackBar('Something Went worng!!')
        }
      })
      reqData['config']['content'] = [...cards];
      if (cards && cards.length) {
        console.log('payloadData---', reqData, this.mode);
        this.eventControlDataService.createHomeScreenUpdate(reqData, this.mode)
          .then(res => {
            if (res === 'Added Successfully' || res == 'Updated Successfully') {
              if (this.mode === 'add') {
                this.helper.showSnackBar('Added Successfully');
                this.isSaveDisabled = true;
              } else if (this.mode === 'edit') {
                this.helper.showSnackBar('Edited Successfully');
                this.isSaveDisabled = true;
              }
              //  this.router.navigateByUrl('/home/event-control/event-list/HomeScreenUpdateForm');  
            }
          })
          .catch(err => {
            console.log(err);
            this.helper.showSnackBar(err);
          });
      }


    }).catch(err => {
      console.log('Error', err);
      this.helper.showSnackBar(err);
    })
    console.log(imageUrls);
  }

  cancel() {
    this.router.navigateByUrl('/home/event-control/event-list/HomeScreenUpdateForm');
  }


  submit() {

    this.saveAllImages();
    console.log(this.homeScreenUpdateForm);

  }

  deploy(env) {
    let email = this.userInfo.email;
    let devDataToSend = {
      env: `${env}`,
      deployedBy: `${email}`
    }
    let eventId = '';
    if (this.homeEditItem && this.homeEditItem.id) {
      eventId = this.homeEditItem.id;
    } else {
      eventId = this.uniqId;
    }
    this.eventControlDataService.deploye(devDataToSend, eventId)
      .then(res => {
        this.helper.showSnackBar('Deployed Successfully.');
        this.isDeployed =true;
      })
      .catch(err => {

        if (err && err.status && err.status == 200) {
          this.helper.showSnackBar('Deployed Successfully.');
          this.isDeployed =true;
        } else {
          this.helper.showSnackBar('Something Went wrong.');
        }


      })
  }
}
