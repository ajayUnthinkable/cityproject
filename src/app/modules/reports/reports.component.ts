import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ReportService } from './reports.service';
import { Helpers } from 'src/providers/helper';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['reports.component.scss']
})
export class ReportsComponent implements OnInit {
    isShowLoader = false;
    constructor(private reportsService: ReportService, private helpers: Helpers) {

    }
    ngOnInit() {

    }

    download(value) {
        this.isShowLoader = true;
        let dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
        const city = dispatchedInfo["city"]["name"].toLowerCase();
        let url;
        url = `${environment.apiUrl}scheduler_v4/${city}/download/${value}`;
        // if(value == 'routesSummary') {
        //     url = `${environment.apiUrl}scheduler_v4/${city}/download/${value}`;
        // }else {
        //     url = `${environment.dataToolUrl}scheduler/${city}/download/${value}`;
        // }
        this.reportsService.downloadFareandRouteList(url).then(result => {
            this.isShowLoader = false;
            if (result.length) {
                if (value !== 'stops'){
                    window.open(url);
                }
            } else {
                this.helpers.showSnackBar('No Data Found');
            }
        }).catch(err => {
            this.isShowLoader = false;
            if (err.status === 500) {
                this.helpers.showSnackBar('Error: ' + err.error);
            } else {
                this.helpers.showSnackBar('Error: ' + err.message);
            }
        })
    }
    downloadCityStops() {
        this.reportsService.getCityStopList().then(res=>{
            if(res.length) {
                const cityStopList = res;
                this.downloadCSV(cityStopList)
            } else {
                this.helpers.showSnackBar('No data available');
            }
        }).catch(err=>{
            this.helpers.showSnackBar('Something went wrong '+err);
        })
    }

    downloadCSV(stopList) {
        const dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
        const city = dispatchedInfo.city["name"];
        const data = [];
        for (let index = 0; index < stopList.length; index++) {
            var obj = {
                'Stop Name': stopList[index].stopName,
                'Lat': stopList[index].lat,
                'Long': stopList[index].long,
                'Stop ID': stopList[index].id,
                'code': stopList[index].code ? stopList[index].code : '',
            };
            data.push(obj);
        }
        const csv = this.helpers.downloadCSV(data, `${city} stop list`);
        console.log(csv);
    }
}