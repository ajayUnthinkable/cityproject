import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  faSearch,
  faPlus,
  faAngleDown,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import { RouteService } from "./route-master.service";
import { Helpers } from "src/providers/helper";
import { MatDialog } from "@angular/material/dialog";
import { UploadFareComponent } from "./component/upload-fare/upload-fare.component";
import { ConfirmUploadComponent } from "./component/confirm-upload/confirm-upload.component";
import * as _ from "lodash";
import { ViewStopsComponent } from "./component/view-stops/view-stops.component";
import { ViewFareComponent } from "./component/view-fare/view-fare.component";
import { MapComponent } from "./component/map/map.component";
import { TimeTableComponent } from "./component/time-table/time-table.component";
import { AddRouteDetailsComponent } from "./component/add-route-details/add-route-details.component";
import { Subscription } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormBuilder } from "@angular/forms";

import { environment } from "../../../environments/environment";
import { ReportService } from "../reports/reports.service";

@Component({
  selector: "app-route-master",
  templateUrl: "./route-master.component.html",
  styleUrls: ["./route-master.component.scss"],
})
export class RouteMasterComponent implements OnInit, OnDestroy {
  search = "";
  faSearch = faSearch;
  faPlus = faPlus;
  faSort = faAngleDown;
  faSortAsc = faSortUp;
  faSortDsc = faSortDown;
  isShowLoader: boolean = false;
  pageNo;
  routeList: Array<Object> = [];
  routes: Array<Object> = [];
  userRole;
  isIdSortAsc = true;
  isNameSortAsc = true;
  isIdSortClick = false;
  isNameSortClick = false;
  subscription: Subscription;
  routeDetailSubscription: Subscription;
  currentRoute;
  searchRouteForm: FormGroup;
  direction = { UP: "UP", DN: "DOWN", DOWN: "DOWN" };
  searchKey;

  filterList = {
    status: ["Polyline Completed", "Route Unactive", "Update Polyline", "N/A"],
  };
  paramList = {};
  statusFilter;
  addRoute;
  constructor(
    private routeService: RouteService,
    private helpers: Helpers,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private reportsService: ReportService
  ) {}
  ngOnInit() {
    this.searchRouteForm = this.formBuilder.group({
      searchInput: "",
    });
    this.activatedRoute.params.subscribe((params) => {
      this.currentRoute = params["route"];
      this.userRole = JSON.parse(
        localStorage.getItem("userDetails")
      ).role.toLowerCase();
      this.searchRouteForm.controls.searchInput.setValue("");
      this.getRouteList();
    });
    this.subscription = this.helpers.changeCityEmitter.subscribe((data) => {
      this.pageNo = 1;
      this.getRouteList();
    });
  }

  getRouteList() {
    this.isShowLoader = true;
    this.routeList = [];
    this.routeService
      .getRouteList(this.currentRoute)
      .then((res) => {
        this.pageNo = 1;
        this.isShowLoader = false;
        res.forEach((item) => {
          const serviceTag = [];
          if (item["special_features"] && item["special_features"].length) {
            serviceTag.push([...item["special_features"]]);
          }
          if (item["spf"] && item["spf"].length) {
            serviceTag.push([...item["spf"]]);
          }
          item["serviceTag"] = [...serviceTag];
        });
        if (this.currentRoute === "reviewRoutes") {
          this.routeList = res.map((item) => {
            return {
              route_name: item.route_name,
              direction: this.direction[item.direction],
              //unActive:item.unActive,
              last_stop_name: item.last_stop_name,
              first_stop_name: item.first_stop_name,
              sync_status: item.sync_status,
              serviceTag: item.serviceTag,
              changes: item.changes,
              route_id: item.route_id,
            };
          });
        } else {
          this.routeList = res;
        }

        this.routes = this.routeList;
        console.log("routes list=======", this.routeList);
        if (this.routeList) {
          this.routeService.setNewRoutes(this.routeList);
        }
      })
      .catch((err) => {
        this.routeList = [];
        this.isShowLoader = false;
      });
  }

  filterAndSearch(key, filter) {
    let scope = this;
    this.routeList = this.routes;
    this.searchKey = this.searchRouteForm.controls.searchInput.value;
    this.searchKey = key;
    this.statusFilter = filter;
    if (this.searchKey) {
      this.routeList = _.filter(this.routeList, function (item) {
        if (
          item.route_id.toLowerCase().includes(scope.searchKey.toLowerCase()) ||
          item.route_name.toLowerCase().includes(scope.searchKey.toLowerCase())
        ) {
          return item;
        }
      });
    }

    if (this.statusFilter) {
      this.routeList = _.filter(this.routeList, (item) => {
        if (scope.statusFilter === "N/A") {
          if (!item.sync_status) {
            return true;
          }
        } else if (
          item.sync_status?.toLowerCase() == scope.statusFilter?.toLowerCase()
        ) {
          return true;
        }
      });
    }
  }

  async filterChange(key?) {
    this.routeList = JSON.parse(JSON.stringify(this.routes));
    this.statusFilter = key.appliedFilterValues.status;
    this.searchKey = this.searchRouteForm.controls.searchInput.value;
    this.filterAndSearch(this.searchKey, this.statusFilter);
  }

  onSearch(searchText) {
    this.searchKey = searchText;
    this.pageNo = 1;
    this.filterAndSearch(this.searchKey, this.statusFilter);
  }

  confirmUpload() {
    const dialogRef = this.dialog.open(ConfirmUploadComponent, {
      width: "424px",
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  uploadMultipleFiles() {
    const dialogRef = this.dialog.open(UploadFareComponent, {
      maxHeight: "95vh",
      data: {
        multipleAllow: true,
        heading: "Bulk upload fares",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  // viewRouteDetails(routeId) {
  //   const dialogRef = this.dialog.open(ViewRouteComponent, {
  //     data: {
  //       routeId: routeId
  //     }
  //   });
  //   this.routeDetailSubscription = dialogRef.afterClosed().subscribe(result => {
  //     this.getRouteList();
  //   })
  // }

  sortId() {
    this.isIdSortClick = true;
    this.isNameSortClick = false;
    if (this.isIdSortAsc) {
      // this.routeList = _.orderBy(this.routeList, ['route_id'], ['asc']);

      this.routeList = this.routeList.sort((a, b) => {
        if (a["route_id"].toLowerCase() > b["route_id"].toLowerCase()) return 1;
        if (b["route_id"].toLowerCase() > a["route_id"].toLowerCase())
          return -1;
        return 0;
      });
    } else {
      // this.routeList = _.orderBy(this.routeList, ['route_id'], ['desc']);
      this.routeList.reverse();
    }
    this.isIdSortAsc = !this.isIdSortAsc;
    this.pageNo = 1;
  }

  sortName() {
    this.isIdSortClick = false;
    this.isNameSortClick = true;
    if (this.isNameSortAsc) {
      this.routeList = _.orderBy(this.routeList, ["route_name"], ["asc"]);
    } else {
      this.routeList = _.orderBy(this.routeList, ["route_name"], ["desc"]);
    }
    this.isNameSortAsc = !this.isNameSortAsc;
    this.pageNo = 1;
  }
  viewStops(routeId, routeName) {
    const index = this.routeList.findIndex((item) => {
      return item["route_id"] === routeId;
    });
    const routeDetails = this.routeList[index];
    const details = {
      routeId: routeDetails["route_id"],
      name: routeName,
      di: routeDetails["direction"],
      ag: routeDetails["agency_name"],
    };
    if (routeDetails["spf"] && routeDetails["spf"].length) {
      details["spf"] = routeDetails["spf"];
    }

    if (
      routeDetails["special_features"] &&
      routeDetails["special_features"].length
    ) {
      details["sf"] = routeDetails["special_features"];
    }

    if (routeDetails["o"] && routeDetails["o"].length) {
      details["o"] = routeDetails["o"];
    }

    if (routeDetails["rr"]) {
      details["rr"] = routeDetails["rr"];
    }

    if (Object.keys(routeDetails).includes("unActive")) {
      details["unActive"] = routeDetails["unActive"];
    }

    if (Object.keys(routeDetails).includes("isComplete")) {
      details["isComplete"] = routeDetails["isComplete"];
    }

    const dialogRef = this.dialog.open(ViewStopsComponent, {
      data: {
        routeId: routeId,
        routeName: routeName,
        details: details,
        back: this.currentRoute,
      },
    });
  }

  viewFare(routeId, transportType) {
    const dialogRef = this.dialog.open(ViewFareComponent, {
      width: "950px",
      height: "635px",
      data: {
        routeId: routeId,
        transportType: transportType,
      },
    });
  }

  navigateToMap(routeId, routeName, agency) {
    let dispatchedInfo = JSON.parse(localStorage.getItem("dispatchInfo"));
    const city = dispatchedInfo["city"]["name"].toLowerCase();
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/home/routeMaster/poly"], {
        queryParams: {
          routeId: routeId,
          routeName: routeName,
          city: city,
          agency: agency,
        },
      })
    );

    window.open(url, "_blank");
    // this.router.navigate(['/home/routeMaster/poly'],{ queryParams: {
    //       routeId: routeId,
    //       routeName: routeName,
    //       city: city,
    //       agency: agency
    //     }});
    // const dialogRef = this.dialog.open(MapComponent, {
    //   data: {
    //     routeId: routeId,
    //     routeName: routeName,
    //     city: city,
    //     agency: agency
    //   }
    // })
  }

  viewTimeTable(routeId) {
    this.dialog.open(TimeTableComponent, {
      data: {
        routeId: routeId,
      },
    });
  }

  addRouteDetail() {
    console.log("add route detail method called");
    this.dialog.open(AddRouteDetailsComponent, {
      maxHeight: "95vh",
      data: {
        mode: "add",
        back: this.currentRoute,
      },
    });
  }

  editRoute(routeDetails) {
    this.getStopDetails(routeDetails);
  }

  getStopDetails(routeDetail) {
    this.isShowLoader = true;
    let stopList = [];
    this.routeService
      .getStopDetail(0, routeDetail.route_id)
      .then((res) => {
        stopList = [...res.stopSequenceWithDetails];
        stopList = stopList.map((item, index) => {
          return {
            stopName: item.stop_name,
            lat: item.stop_lat,
            long: item.stop_lon,
            id: item.stop_id,
            seqNo: index + 1,
          };
        });
        const rrData = this.getReverseStopDetails(res.reverse_routeId);
        const routeDetails = {
          name: routeDetail.route_name,
          internalName: routeDetail.internal_name,
          di: this.direction[routeDetail.direction],
          unActive: routeDetail.unActive,
          rr: res.reverse_routeId,
          o: routeDetail.o,
          stopList: stopList,
          routeId: routeDetail.route_id,
          ag: routeDetail.agency_name,
          poly: res.poly,
        };
        if (routeDetail.spf && routeDetail.spf.length) {
          routeDetails["spf"] = routeDetail.spf;
        }
        if (routeDetail.sf && routeDetail.sf.length) {
          routeDetails["sf"] = routeDetail.sf;
        }
        if (
          routeDetail.special_features &&
          routeDetail.special_features.length
        ) {
          routeDetails["sf"] = routeDetail.special_features;
        }

        if (routeDetail.isComplete) {
          routeDetails["isComplete"] = routeDetail.isComplete;
        }

        this.dialog.open(AddRouteDetailsComponent, {
          maxHeight: "95vh",
          data: {
            mode: "edit",
            details: routeDetails,
            back: this.currentRoute,
            rrDetails: rrData,
          },
        });
        this.isShowLoader = false;
      })
      .catch((err) => {
        this.isShowLoader = false;
        this.helpers.showSnackBar("Error occured:" + err.message);
      });
  }

  getReverseStopDetails(reverseId) {
    const index = this.routeList.findIndex((item) => {
      return item["route_id"] === reverseId;
    });
    const routeDetails = this.routeList[index];
    return routeDetails;
  }

  close() {
    this.searchRouteForm.controls.searchInput.setValue("");
    this.routeList = [...this.routes];
  }

  download(value) {
    this.isShowLoader = true;
    let dispatchedInfo = JSON.parse(localStorage.getItem("dispatchInfo"));
    const city = dispatchedInfo["city"]["name"].toLowerCase();
    const url = `${environment.apiUrl}scheduler_v4/${city}/download/${value}`;
    this.reportsService
      .downloadFareandRouteList(url)
      .then((result) => {
        this.isShowLoader = false;
        if (result.length) {
          if (value !== "stops") {
            window.open(url);
          }
        } else {
          this.helpers.showSnackBar("No Data Found");
        }
      })
      .catch((err) => {
        this.isShowLoader = false;
        if (err.status === 500) {
          this.helpers.showSnackBar("Error: " + err.error);
        } else {
          this.helpers.showSnackBar("Error: " + err.message);
        }
      });
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.routeDetailSubscription) {
      this.routeDetailSubscription.unsubscribe();
    }
  }
}
