import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouteService } from 'src/app/modules/route-master/route-master.service';
import { Helpers } from 'src/providers/helper';
import * as _ from 'lodash';
import { langCodes } from 'src/app/utils/config/constants';

@Component({
  selector: 'app-translation-component',
  templateUrl: './translation-component.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./translation-component.component.scss']
})
export class TranslationComponentComponent implements OnInit {

  @Input() translatedList;

  stopTranslationForm:FormGroup;
  languageIds;
  newRouteDetails;
  cardList: FormArray;
  languageList=[];
  prevSelectedLang;
  selectedLanguageIds = [];
  prevId;

  constructor(private formBuilder: FormBuilder,private routeService: RouteService, private helpers: Helpers) { }

  ngOnInit(): void {
    if(this.translatedList.from == 'routes') {
      this.newRouteDetails = this.routeService.getNewRouteDetails();
      this.languageIds = this.newRouteDetails.languageList;
    } 

    if(this.translatedList.from == 'stops') {
      let stopData = JSON.parse(localStorage.getItem('stopData'));
      this.languageIds = stopData?.languageList;
    }
    if(this.languageIds && this.languageIds.length) {
      this.languageIds.forEach(element => {
        this.languageList.push({name:element,isDisabled:false});
      });
    }

    console.log(this.languageList);
    this.createForm();
  }

  ngOnChanges(): void {
  }

  createForm() {
    const card = this.createNewCard();
    this.stopTranslationForm = this.formBuilder.group({
      cards: this.formBuilder.array([card])
    });
    this.cardList = this.stopTranslationForm.get('cards') as FormArray;
    this.setFormData();
  }

  setFormData(){
    let totalLangCodesArr = [];
    this.languageList.forEach(element => {
      totalLangCodesArr.push(element.name);
    });

    if (this.translatedList && this.translatedList.data) {
      let listKeys = Object.keys(this.translatedList.data);
      for (let i=0; i<listKeys.length;i++) {
        if(!totalLangCodesArr.includes(listKeys[i])) {
            continue;
        }
        if((i+1) > this.languageList.length) {
             break;
        }
        if (i > 0) {
              const card = this.createNewCard();
              this.cardList.push(card);
            }
        this.stopTranslationForm.controls.cards['controls'][i].patchValue({
                languageId: listKeys[i],
                translatedText: this.translatedList.data[listKeys[i]]['name']
              });
        let selectedLangIndex = _.findIndex(this.languageList,{'name':listKeys[i]}); 
        if(selectedLangIndex > -1) {
          this.languageList[selectedLangIndex]['isDisabled'] = true;
          this.selectedLanguageIds.push(listKeys[i]);
        }
      }
      this.updateData();
    }
  }

  myMethod(index) {
    this.prevId = this.stopTranslationForm.controls.cards['controls'][index].get('languageId').value;
  }

  createNewCard(): FormGroup {
    return this.formBuilder.group({
      languageId : new FormControl(null, [<any>Validators.required]),
      translatedText : new FormControl(null, [<any>Validators.required])
    });
  }

  addNewCard() {
    const index = this.cardList.length;
    if (!this.stopTranslationForm.controls.cards['controls'][index - 1].valid) {
      this.helpers.showSnackBar("Please select all fields");
      return;
    }
    if(this.languageList.length == this.cardList.length) {
      this.helpers.showSnackBar("No Language available");
      return;
    }
    const card = this.createNewCard();
    this.cardList.push(card);
  }

  get cardFormGroup() {
    return this.stopTranslationForm.get('cards') as FormArray;
  }

  languageChange(index) { 
    let selectedItemAlreadyIndex = _.findIndex(this.languageList,{'name':this.prevId});
    if(selectedItemAlreadyIndex>-1) {
      this.languageList[selectedItemAlreadyIndex]['isDisabled'] = false;
    }
    let key = this.stopTranslationForm.controls.cards['controls'][index].get('languageId').value;
    let selectedLangIndex = _.findIndex(this.languageList,{'name':key}); 
    if(selectedLangIndex > -1) {
      this.languageList[selectedLangIndex]['isDisabled'] = true;
    }
    this.updateData();
  }

  updateData(){
    this.helpers.setTranslationData(this.stopTranslationForm.controls.cards['controls']);
  }

  getTranslatedLang(code){
    let translatedValuesObj = Object.keys(langCodes);
      if(translatedValuesObj.includes(code)) {
        return langCodes[code];
      } else {
        return code;
      }
  }

}
