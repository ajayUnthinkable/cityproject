import { Injectable } from '@angular/core';
import { HttpHandlerService } from '../../../providers/http-handler.service';
import { environment } from '../../../environments/environment'

@Injectable()
export class ReportService {
    constructor(private httpHandler: HttpHandlerService) {

    }

    downloadFareandRouteList(url) {
        const options = {
            responseType: 'text'
        }
        return this.httpHandler.get(url, options);
    }
    getCityStopList() {
        let dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
        const city = dispatchedInfo["city"]["name"].trim().toLowerCase();
        const url = `${environment.dataToolUrl}${city}/BUS/stops`;
        return this.httpHandler.get(url).then(res => {
            const totalStopIds = Object.keys(res);
            const totalStopList = totalStopIds.map((item) => {
                return {
                    stopName: res[item].name,
                    lat: res[item].lat,
                    long: res[item].lon,
                    id: item,
                    code: res[item].code,
                }
            })
            return totalStopList;
        }).catch(err => {
            return err;
        });
    }
}