import { Injectable } from '@angular/core';
import { HttpHandlerService } from '../../../providers/http-handler.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as _ from 'lodash';
import { Helpers } from 'src/providers/helper';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class EventControlDataService {

    events: any;
    homeEvents:any;
    dispatchInfo: any;
    routeImages: any;
    homeImages: any;
    editItem: any;
    homeScreenItem:any;
    routes;
    homeScreenImages:any;
    userInfo:any;
    constructor(private httpHandler: HttpHandlerService, private snackBar: MatSnackBar,private helper:Helpers,private http:HttpClient) {
    }

    getEventList(isRefresh): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
            if (isRefresh) {
                this.events = null;
            }
            if (this.events) {
                return resolve(this.events);
            } else {
                let url = `${environment.eventUrl}`;
                url += 'fetch/';
                // url += `${this.dispatchInfo.city.name.toLowerCase()}/`;
                url += 'event'
                this.httpHandler.get(url).then(response => {
                    this.events = response;
                    return resolve(this.events);
                }, (err) => {
                    this.snackBar.open('Something went wrong. Please try again.', '', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 3000
                    });
                });
            }
        });
    }

    getHomeScreenList(isRefresh):Promise <any> {
        return new Promise<any>((resolve, reject) => {
            this.dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
                let url = `${environment.homeScreenUrl}`;
                url += 'masterInfoCards';
                //  url += `${this.dispatchInfo.city.name.toLowerCase()}`;
                this.httpHandler.get(url).then(response => {
                    this.homeEvents = response;
                    return resolve(this.homeEvents);
                }, (err) => {
                    this.snackBar.open('Something went wrong. Please try again.', '', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 3000
                    });
                });
        });
        
    }

    saveEvent(data) {
        this.dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
        let url = `${environment.eventUrl}`;
        url += 'create/event';
        return this.httpHandler.post(url, JSON.stringify(data),{responseType:'text'});
    }

    editEvent(data) {
        this.dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
        let url = `${environment.eventUrl}`;
        url += 'event/edit';
        return this.httpHandler.post(url, JSON.stringify(data),{responseType:'text'});
    }

    getBannerImagesForDialogue(isRefresh): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
            if (isRefresh) {
                this.routeImages = null;
            }
            if (this.routeImages) {
                return resolve(this.routeImages);
            } else {
                let url = `${environment.eventUrl}`;
                url += '/event/fetch/icons/dialogue';
                this.httpHandler.get(url).then(response => {
                    this.routeImages = response;
                    return resolve(this.routeImages);
                }, (err) => {
                    this.snackBar.open('Something went wrong. Please try again.', '', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 3000
                    });
                });
            }
        });
    }

    getBannerImagesForBanner(isRefresh): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
            if (isRefresh) {
                this.homeImages = null;
            }
            if (this.homeImages) {
                return resolve(this.homeImages);
            } else {
                let url = `${environment.eventUrl}`;
                url += '/event/fetch/icons/banner';
                this.httpHandler.get(url).then(response => {
                    this.homeImages = response;
                    return resolve(this.homeImages);
                }, (err) => {
                    this.snackBar.open('Something went wrong. Please try again.', '', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 3000
                    });
                });
            }
        });
    }



    getImageUrlFromBucket(data?:Object){
       this.dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
       this.userInfo = JSON.parse(localStorage.getItem('userDetails'));
       if(typeof(data['file'])==="string") {
           let dataFile = {url:data['file']};
           return new Promise((resolve, reject) => { setTimeout(() =>{ resolve(dataFile);   }); });
       } 
       let userToken = JSON.parse(localStorage.getItem('user_token')).access_token;
       console.log(this.userInfo);
           const formData = new FormData();
           formData.append('file', data["file"]);
           formData.append('info',JSON.stringify(data["info"]));
           let header = new HttpHeaders();
        //  header =   header.set('Content-Type', 'multipart/form-data');
         header =   header.set('userId',`${this.userInfo.email}`);
         header =   header.set('authType','MPANEL');
         header =   header.set('Authorization',`Bearer ${userToken}`);
        //  let url = `${environment.apiUrl}files/v1/upload`;
         let url = `https://devdatatool.chalo.com/files/v1/upload`;
         console.log(header);
         const options = {headers:header};
         console.log(options);
           
           return this.http.post(url, formData ,options)
                .toPromise()
                .then((res: Response) => {
                    return res;
            },(err) =>{
                console.log(err);
                // if (err.status === 401) {
                    this.httpHandler.getRefreshToken().then((res) => {
                        if (res) {
                            this.getImageUrlFromBucket(data);
                        }
                    });
                // } else {
                //     this.helper.showSnackBar('error occured');
                //     console.log(err);
                // }

            }
            )
}

createHomeScreenUpdate(reqData,mode){
    console.log(mode);
    this.dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
    let url = `${environment.homeScreenUrl}`;
    if (mode === 'add') {
        url += 'masterInfoCards';
        return this.httpHandler.post(url, reqData, { responseType: 'text' });
    } else if (mode === 'edit') {
        url += 'masterInfoCards/' + reqData.id;
        return this.httpHandler.put(url, reqData, { responseType: 'text' });
    }
    
}

deploye(devDataToSend,eventId) {
let url = `${environment.homeScreenUrl}`;
    url += `masterInfoCards/${eventId}/deploy`;
    // url += `${eventId}`;
    return this.httpHandler.post(url, devDataToSend);
}

    deployToProduction(eventId) {
        let url = `${environment.eventUrl}`;
        url += 'event/deploy/production';
        return this.httpHandler.post(url, JSON.stringify(eventId),{responseType:'text'});
    }

    deployToDev(eventId) {
        let url = `${environment.eventUrl}`;
        url += 'event/deploy/development';
        return this.httpHandler.post(url, JSON.stringify(eventId),{responseType:'text'});
    }

    setEditData(event) {
        this.editItem = event;
    }

    getEditData() {
        return this.editItem;
    }

    getHomeEventDetails(id) {
        let url = `${environment.homeScreenUrl}`;
        url += `masterInfoCards/${id}`;
        return  this.httpHandler.get(url).then(res=>{
            console.log('res is===',res);
            this.homeScreenItem = res;
            return res;
        }).catch(err=>{

            this.snackBar.open('Something went wrong. Please try again.', '', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 3000
            });

        })

    }

    getHomeScreenDetails(){
        return this.homeScreenItem;
    }


    getRoutes(isRefresh): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
            if (isRefresh) {
                this.routes = null;
            }
            if (this.routes) {
                return resolve(this.routes);
            } else {
                let url = `${environment.dataToolUrl}scheduler/`;
                url += `${this.dispatchInfo.city.name.toLowerCase()}/autocompleteAgencyWise/route?`;
                url += `station_type=${this.dispatchInfo.mode.name.toLowerCase()}&str=&day=sunday&`;
                url += `agency=${this.dispatchInfo.agency.name.toLowerCase()}&operator=`;
                this.httpHandler.get(url).then(response => {
                    this.routes = response;
                    return resolve(this.routes);
                }, (err) => {
                    this.snackBar.open('Something went wrong. Please try again.', '', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 3000
                    });
                });
            }
        });
    }

    deleteEvent(eventId) {
        let url = `${environment.eventUrl}`;
        url += 'event/delete';
        return this.httpHandler.post(url, JSON.stringify(eventId),{responseType:'text', observe: 'response'});
    }

    deleteHomeEvent(homeEventId) {
        let url = `${environment.homeScreenUrl}`;
        url  += `masterInfoCards/${homeEventId.eventId}`;
        return this.httpHandler.delete(url,{responseType:'text', observe: 'response'});
    }

}