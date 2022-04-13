import { Injectable, OnDestroy } from '@angular/core';
import { environment, googleConfig } from '../environments/environment';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Subscription } from 'rxjs';
import { GoogleLoginService, GoogleLoginResponse } from 'chalo-google-hybrid-login';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class Helpers implements OnDestroy {
    isCityChange = new Subject<boolean>();
    changeCityEmitter = this.isCityChange.asObservable();
    userDetails;
    subscription: Subscription;
    distanceWithinMarkers = 1;
    translationData;
    constructor(private router: Router, private snackBar: MatSnackBar, private googleLoginService: GoogleLoginService<GoogleLoginResponse>, private http: HttpClient) {
        const userDetails = localStorage.getItem('userDetails');
        this.userDetails = JSON.parse(userDetails);
    }
    parseToken(token?) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }

    checkUserAllowed(userRole) {
        let allowedUsers = environment.allowUsers;
        if (userRole && userRole.roles && userRole.roles.length) {
            const role = userRole.roles[0].role
            let index = _.indexOf(allowedUsers, role);
            return index > -1 ? true : false;
        }
        else {
            localStorage.clear();
            //redirect to login.
            window.location.href = '/login';
        }
    }


    setUserDetails(data) {
        this.userDetails = data;
        localStorage.setItem('userDetails', JSON.stringify(this.userDetails));
    }

    getUserDetails() {
        if (this.userDetails) {
            return this.userDetails;
        } else {
            const token = localStorage.getItem('user_token');
            if (token) {
                return this.getUserDetailsCentralLogin(token);
            }
        }
    }

    getUserDetailsCentralLogin(token) {
        const userInfo = this.parseToken(JSON.parse(token).access_token);
        const userDetails = {
            name: userInfo.name ? userInfo.name : null,
            email: userInfo.user_name,
            role: userInfo.authorities[0].roles[0].role,
            roleId: userInfo.authorities[0].roles[0].roleInfo[0][0].id,
            userId: userInfo.userId,
            city: null,
            mode: null
        };

        if (userDetails.role.toLowerCase() === 'manager' || userDetails.role.toLowerCase() === 'data executive' || userDetails.role.toLowerCase() === 'polyline executive') {
            userDetails.city = [];
            userInfo.authorities[0].roles[0].roleInfo.map((item) => {
                const cityObj = _.find(item, function (o) { return o.name.toLowerCase() === 'city'; });
                if (cityObj) {
                    userDetails.city.push(
                        {
                            'id': cityObj.metaId,
                            'name': cityObj.value
                        });
                }
            });
        }
        userDetails['mode'] = [];
        userInfo.authorities[0].roles[0].roleInfo.map((item) => {
            const modeObj = _.find(item, function (o) { return o.name.toLowerCase() === 'mode'; });
            if (modeObj) {
                userDetails.mode.push(
                    {
                        'id': modeObj.metaId,
                        'name': modeObj.value
                    });
            }
        });

        this.setUserDetails(userDetails);
        return userDetails;
    }


    showSnackBar(message: string) {
        this.snackBar.open(message, '', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
        });
    }

    logOut() {
        const userId = JSON.parse(localStorage.getItem('userDetails')).email;
        const params = `username=${userId}`;
        this.subscription = this.http.post(`${googleConfig.logout.logoutUrl}?${params}`, {}, { responseType: 'text' }).subscribe(res => {
            this.googleLoginService.updateUserState();
            localStorage.clear();
            this.router.navigateByUrl('/login');
        }, err => {
            this.showSnackBar('Error occured:' + err);
        });
    }

    checkUserValidate(){
        const userDetails = JSON.parse(localStorage.getItem('userDetails'));
        let userId

        if(userDetails) {
            // userId = userDetails.email;
            userId = userDetails.userId;
            const cookie = this.googleLoginService.getUserCookie();
            console.log('cookie',cookie,userId);
            if(!cookie || cookie == userId){
                return true;
            }
            else {
                return false;
            }
        }else {
                return true
        }
    }


    calculateDistanceBetweenStops(stopList, routeStopList, radius) {
        let cityStopList = [...stopList];
        routeStopList = routeStopList.map((stop) => {
            return {
                lat: stop.lat,
                long: stop.long,
                stopName: stop.stopName,
                id: stop.id,
                seqNo: stop.seqNo
            }
        });

        cityStopList.forEach((cityStop, index) => {
            routeStopList.forEach((routeStop, i) => {
                const nearestStops = [];
                const lat1 = cityStop['lat'];
                const lon1 = cityStop['long'];
                const lat2 = routeStop.lat;
                const lon2 = routeStop.long;
                const distance = this.getDistanceFromLatLng(lat1,lon1,lat2,lon2);
                if (distance <= radius) {
                    nearestStops.push(cityStop);
                    if (routeStop.nearbyStops && routeStop.nearbyStops.length) {
                        const nearbyStops = [...routeStop.nearbyStops];
                        nearbyStops.push(...nearestStops);
                        routeStop['nearbyStops'] = [...nearbyStops];
                    }
                    else {
                        routeStop['nearbyStops'] = nearestStops;
                    }
                    if(routeStop.id == cityStop.id) {
                        routeStop['ls'] = cityStop.ls;
                    }
                }
            })
        })
        const routeDetail = JSON.parse(localStorage.getItem('routeDetail'));
        routeDetail['stopList'] = [...routeStopList];
        localStorage.setItem('routeDetail', JSON.stringify(routeDetail));
        return routeStopList;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    downloadCSV(objArray: any, filename) {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = '';
        let row = '';

        for (const index1 in objArray[0]) {
            if (objArray[0].hasOwnProperty(index1)) {
                row += index1 + ',';
            }
        }
        row = row.slice(0, -1);
        str += row + '\r\n';

        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (const index2 in array[i]) {
                if (array[i].hasOwnProperty(index2)) {
                    if (line !== '') {
                        line += ',';
                    }

                    line += '' + array[i][index2] + '';
                }
            }

            str += line + '\r\n';
        }

        const csvData = str;

        const a: any = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        a.href = url;

        const isIE = /*@cc_on!@*/false || !!(<any>document).documentMode;

        if (isIE) {
            // const retVal = navigator.msSaveBlob(blob, filename + '.csv');
        } else {
            a.download = filename + '.csv';
        }
        a.click();
    }

    checkDistanceAmongMarkers(lat,lng,totalStopList) {
        let isPresent = 'No';
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        for(let item of totalStopList){
          const lat1 = item.lat;
          const lon1 = item.long;
          const lat2 = lat;
          const lon2 = lng;
          item.lat = parseFloat(item.lat);
          item.long = parseFloat(item.long);
          console.log(item, lat, lng);
          if(item.lat && lat && item.lat.toFixed(5) == lat.toFixed(5) && item.long && lng && item.long.toFixed(5) == lng.toFixed(5)) {
            isPresent = 'Yes';
            break;
          } else {
            const distance = this.getDistanceFromLatLng(lat1,lon1,lat2,lon2);
              if(distance <= this.distanceWithinMarkers) {
                isPresent = `Yeswithin${this.distanceWithinMarkers}`;
                break;
              }
          }
        }
        if(isPresent == 'Yes') {
          this.showSnackBar('Stop Already Exists.');
          return isPresent;
        }
    
        if(isPresent == `Yeswithin${this.distanceWithinMarkers}`) {
          this.showSnackBar(`A Stop Already Exists within ${this.distanceWithinMarkers} meters.`);
          return isPresent;
        }
        return isPresent;
    }

    getDistanceFromLatLng(lat1,lon1,lat2,lon2){
        const Radius = 6371; // Radius of the earth in km
            const dLat = (lat2 - lat1) * Math.PI / 180; // deg2rad below
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
                0.5 - Math.cos(dLat) / 2 +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                (1 - Math.cos(dLon)) / 2;
            const distance = Radius * 2 * Math.asin(Math.sqrt(a)) * 1000;
            return distance;
    }

    setTranslationData(data) {
        this.translationData = data;
    }

    getTranslationData() {
        return this.translationData;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
