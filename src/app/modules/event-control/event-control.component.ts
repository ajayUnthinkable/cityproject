import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import * as  _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { EventControlDataService } from './event-control.services';
import { DeleteDialogComponent } from './component/delete-confiramtion/delete.component';
import { MatDialog } from '@angular/material/dialog';
import { Helpers } from '../../../providers/helper';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-event-control',
    templateUrl: './event-control.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./event-control.component.scss']
})
export class EventControlComponent implements OnInit {

    events: any;
    homeEvents:any;
    eventFiltered: any;
    homeEventFiltered:any;
    cityEmitter: any;
    search: any;
    isCitySortClick = false;
    isCityAsc = false;
    deleteEventSubscription: Subscription;
    subscription: Subscription;
    currentlyChecked;
    isLoading:boolean;
    pageNo;
    userInfo;
    eventsCopy;
    cityList = [];
    cityFilter;
    statusFilter;
    filterList = {
        city : [],
        status : ['Active','Inactive', 'N/A']
       };

    paramList = { };   
    constructor(public router: Router, private eventControlDataService: EventControlDataService, private dialog: MatDialog, private helpers: Helpers, private activatedRoute:ActivatedRoute) { }

    ngOnInit() {

        this.userInfo = this.helpers.getUserDetails();
        this.userInfo?.city.forEach(element => {
            this.cityList.push(element.name);
        });
        if(this.cityList.length) {
            this.filterList.city = this.cityList;
        }

        this.activatedRoute.params.subscribe(params => {
            this.currentlyChecked = params['events'];
            if(this.currentlyChecked==='eventControlForm') {
                    this.pageNo = 1;
                    this.getEvents(true);

            }else if(this.currentlyChecked==='HomeScreenUpdateForm') {
                this.pageNo = 1;
                this.getHomeScreen(true);
            }
          });
        }

    sortCity() {
        this.isCitySortClick = true;
        if (this.isCityAsc) {
            this.events = _.orderBy(this.events, ['data.eventDetails.city'], ['asc']);
        } else {
            this.events = _.orderBy(this.events, ['data.eventDetails.city'], ['desc']);
        }
        this.isCityAsc = !this.isCityAsc;
    }

    getEvents(isRefresh) {
        this.search = '';
        this.isLoading=true;
        this.eventControlDataService.getEventList(isRefresh).then((res) => {
                this.pageNo = 1;
                this.isLoading=false;
            
            const response = [];
            _.forEach(res, function (value, key) {
                _.forEach(value, function (innervalue, innerkey) {
                    const obj = {
                        eventId: innerkey,
                        data: innervalue
                    };
                    response.push(obj);
                })
            });
            this.events = response;
            this.eventsCopy = JSON.parse(JSON.stringify( this.events));
            this.eventFiltered = response;

        }).catch(err=>{
            this.isLoading=false;
        });
    }

    getHomeScreen(isRefresh) {
        this.search='';
        this.isLoading=true;
        this.eventControlDataService.getHomeScreenList(isRefresh).then((res)=>{
            this.pageNo = 1;
            this.isLoading=false;
            console.log('res',res);
            
            // const response = JSON.parse(res.cardsInfo);
            const response = res;
            this.homeEvents = response;
            console.log(this.homeEvents);
            this.homeEventFiltered = response;
        }).catch(err=>{
            this.isLoading=false;
        });
    }

    onSearchChange(value) {
        if(this.currentlyChecked==='eventControlForm') {
            // this.events = this.eventFiltered.filter((item) => {
            //     return (item['data']['eventDetails']['name'].toLowerCase().indexOf(value.toLowerCase()) > -1) ||
            //         (item['data']['eventDetails']['name'].replace(/ /g, '').toLowerCase().indexOf(value.toLowerCase()) > -1);
            // });
            let filterApplied = {
                statusFilter:this.statusFilter,
                cityFilter:this.cityFilter
            }
            this.filterAndSearch(value, filterApplied);
        } else if(this.currentlyChecked==='HomeScreenUpdateForm') {
            this.homeEvents = this.homeEventFiltered.filter((item) => {
                return (item['id'].toLowerCase().indexOf(value.toLowerCase()) > -1) ||
                    (item['id'].replace(/ /g, '').toLowerCase().indexOf(value.toLowerCase()) > -1);
            });
        }
    }

    filterAndSearch(key, filter) {
        let scope = this;
        this.events = JSON.parse(JSON.stringify(this.eventFiltered));
        this.search = key;
        this.statusFilter = filter.statusFilter;
        this.cityFilter = filter.cityFilter;
        if(this.search) {
          this.events = _.filter( this.events , function (item) {
            return (item['data']['eventDetails']['name'].toLowerCase().indexOf(scope.search.toLowerCase()) > -1) ||
            (item['data']['eventDetails']['name'].replace(/ /g, '').toLowerCase().indexOf(scope.search.toLowerCase()) > -1);
          });
        }

        if(this.statusFilter) {
            this.events = _.filter(this.events, (item) => {
              if(this.statusFilter === 'N/A'){
                if(!(item.data.eventDetails.isDeployed == true) && !(item.data.eventDetails.isDeployed == false)){
                  return true;
                }
              } else if ((item.data.eventDetails.isDeployed == true) && (this.statusFilter == 'Active')) {
                    return true;
                } else if ((item.data.eventDetails.isDeployed == false) && (this.statusFilter == 'Inactive')) {
                    return true;
                }
            });
        }

        if (this.cityFilter) {
            this.events = _.filter(this.events, (item) => {
                 if (item.data.eventDetails.city?.toLowerCase() == this.cityFilter?.toLowerCase()) {
                    return true;
                }
            });
          }
    }

    

    getEventDetails(item) {
        this.eventControlDataService.setEditData(item);
        if(item) {
            this.router.navigate(['home/event-control/add-event'],{ queryParams: { mode: 'edit',page:'disruptionUpdate' } });
        }else {
            this.router.navigate(['home/event-control/add-event'],{ queryParams: { mode: 'add',page:this.currentlyChecked } });
        }
    }

    getHomeEventDetails(id) {
        this.isLoading=true;
       this.eventControlDataService.getHomeEventDetails(id).then(res=>{
        this.isLoading=false;
           if(res) {

               this.router.navigate(['home/event-control/add-event'],{ queryParams: { mode: 'edit',page:'HomeScreenUpdate' } });
           }
       }).catch(err=>{
        this.isLoading=false;
       });
    }

    deleteEvent(item) {
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: { type: 'Event', eventData: item }
        });

        this.deleteEventSubscription = dialogRef.afterClosed().subscribe(result => {
            if (result === 'Deleted') {
                this.pageNo = 1;
                this.getEvents(true);
            }
        });
    }
    
    deleteHomeEvent(id){
        const dialogRef = this.dialog.open(DeleteDialogComponent, {
            data: { type: 'HomeScreenEvent', eventData: id }
        });
        this.deleteEventSubscription = dialogRef.afterClosed().subscribe(result => {
            if (result === 'Deleted') {
                this.getHomeScreen(true);
            }
        });
    }

    selectCheckBox(targetType: any,event:Event) {
        this.currentlyChecked = targetType;
        if(targetType==='eventControlForm') {
            this.router.navigateByUrl('/home/event-control/event-list/eventControlForm');  
        }else if(targetType==='HomeScreenUpdateForm') {
            this.router.navigateByUrl('/home/event-control/event-list/HomeScreenUpdateForm');  
        }
      }

      async filterChange(key?) {
        this.cityFilter = key.appliedFilterValues.city;
        this.statusFilter = key.appliedFilterValues.status;
        let filerApplied = {
            statusFilter:this.statusFilter,
            cityFilter:this.cityFilter
        }

        this.filterAndSearch(this.search, filerApplied);
      }    
      
      getItemName(item) {
          let itemArr = item.id.split('_');
              itemArr.pop();
              return itemArr.join('_');
      }  

    ngOnDestroy() {
        // this.cityEmitter.unsubscribe();
        this.dialog.closeAll();
        if (this.deleteEventSubscription)
            this.deleteEventSubscription.unsubscribe();
    }
}