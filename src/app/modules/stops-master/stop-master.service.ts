import { Injectable } from '@angular/core';
import { HttpHandlerService } from '../../../providers/http-handler.service';
import { environment } from '../../../environments/environment'
import { Helpers } from 'src/providers/helper';
import * as _ from 'lodash';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable()
export class StopService {

    city;
    agency;
    constructor(private helpers: Helpers,private httpHandler: HttpHandlerService, private http: HttpClient) {
        let dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
        this.city = dispatchedInfo["city"]["name"].trim().toLowerCase();
        this.agency = dispatchedInfo["agency"]["name"].trim();
    }

    getCityStopList() {
        let dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
        const city = dispatchedInfo["city"]["name"].trim().toLowerCase();
        const url = `${environment.dataToolUrl}${city}/BUS/stops`;
        return this.httpHandler.get(url).then(res => {
            const totalStopIds = Object.keys(res);
            const totalStopList = totalStopIds.map((item, index) => {
                return {
                    stopName: res[item].name,
                    lat: res[item].lat,
                    long: res[item].lon,
                    id: item,
                    code: res[item].code,
                    alias: res[item].aliasName,
                    ls:res[item].ls,
                    seqNo: index
                }
            })
            return totalStopList;
        }).catch(err => {
            return err;
        });
    }

    editStop(stopDetails) {
        let dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
        const city = dispatchedInfo["city"]["name"].trim().toLowerCase();
        const agency = dispatchedInfo["agency"]["name"].trim();
        const userDetails = JSON.parse(localStorage.getItem('userDetails'));
        const payloadData = {
            [stopDetails.id]: {
                name: stopDetails.stopName,
                lat: stopDetails.lat,
                lon: stopDetails.long,
                code: stopDetails.code,
                aliasName: stopDetails.alias,
                ls:stopDetails.ls,
                ag: agency,
                uby: userDetails.email
            }
        }

        const url = `${environment.dataToolUrl}${city}/BUS/stops/update`;
        return this.http.post(url, payloadData, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=UTF-8' }), 'responseType': 'text' 
        })
            .toPromise();
        // return this.httpHandler.post(url, payloadData).then(res => {
        //     return res;
        // }).catch(err => {
        //     return err;
        // })
    }

    getRoutes(stopId) {
        let dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
        const city = dispatchedInfo["city"]["name"].trim().toLowerCase();
        const url = `${environment.dataToolUrl}scheduler/${city}/routesfromstop?stopId=${stopId}`;
        return this.httpHandler.get(url)
        .then(res => {
            return res;
        }).catch(err => {
            return err;
        });
    }

    getAgency(prod) {
        let url = `${environment.dataToolUrl}metadata`;
        // if (prod) {
        //     url = `${environment.proddataToolUrl}metadata`;
        // }
        let dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
        this.city = dispatchedInfo["city"]["name"].trim().toLowerCase();
        return this.httpHandler.get(url).then(res => {
            let finalCityInfo = {};
            let cityData = _.find(res, (item) => {
                return item.city === this.city.toUpperCase();
            });

            if(cityData  && cityData.localeIds) {
                finalCityInfo['localeIds'] = cityData.localeIds;
            }

            return finalCityInfo;
        }).catch(err => {
            this.helpers.showSnackBar("error occured: " + err.message)
        })
    }
}