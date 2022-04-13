import {
  Component,
  ViewEncapsulation,
  OnInit,
  ViewChild,
  ElementRef,
  NgZone,
  Inject,
  OnDestroy,
  HostListener,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../../../../environments/environment";
import * as _ from "lodash";
import * as moment from "moment";
declare var google: any;
declare var setMapOnAll: any;
import * as de from "polyline-encoded";
import * as circularJSON from "circular-json";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { DBSchema, openDB } from "idb";
import { HttpHandlerService } from "src/providers/http-handler.service";
declare var openDatabase;

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit, OnDestroy {
  route_id;
  route_name;
  city;
  agency;
  paths;
  map;
  finalPath = [];
  stopDetails;
  isSubmitRequest = false;
  routeDetails;
  conflictPaths = [];
  conflictPathIndex = 0;
  isPreview = true;
  customPoly;
  isCustomSelected = false;
  customPolyObj;
  db;
  isSaveInLocal = false;
  undoListener;
  customMarkerArray = [];
  polyDetailSubscription: Subscription;
  routeDetailSubscription: Subscription;
  routeSubmitSubscription: Subscription;
  resetRouteSubscription: Subscription;
  allPolyDetailSubscription: Subscription;
  @ViewChild("map") mapRef: ElementRef;
  totalSegments;
  currentSegment = 1;
  saveInterval;
  public fromDate: Date = moment(new Date()).subtract(7, "days").toDate();
  public toDate: Date = new Date();
  accuracy;
  allPoints;
  isAllChecked = false;
  allPolyArray = [];
  constructor(
    public router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private route: ActivatedRoute,
    private zone1: NgZone,
    private activatedRoute: ActivatedRoute,
    private httpHandler: HttpHandlerService
  ) {
    // this.route_id = data.routeId,
    //     this.route_name = data.routeName,
    //     this.city = data.city,
    //     this.agency = data.agency
  }

  async connectToDb() {
    this.db = await openDB("polydb", 1, {
      upgrade(db) {
        db.createObjectStore("poly", { keyPath: "id", autoIncrement: true });
      },
    });
  }

  async set(key, val) {
    return (await this.db).put("poly", val, key);
  }
  async del(key) {
    return (await this.db).delete("poly", key);
  }
  async keys() {
    return (await this.db).getAllKeys("poly");
  }
  async get(key) {
    return (await this.db).get("poly", key);
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      (this.route_id = params.routeId),
        (this.route_name = params.routeName),
        (this.city = params.city),
        (this.agency = params.agency);
    });

    // this.db = openDatabase('polydb', '1.0', 'This is for storing route data', 100 * 1024 * 1024);
    // this.db.transaction(function (tx) {
    //     tx.executeSql('CREATE TABLE IF NOT EXISTS poly (id text, data text)');
    // });
    this.connectToDb();
    this.map = null;
    this.stopDetails = null;
    setTimeout(() => {
      this.getRouteDetails();
      this.getAllRoutePolyDetails();
      // this.initMap();
    }, 1000);
  }

  @HostListener("window:keydown", ["$event"]) onKeyPress(
    $event: KeyboardEvent
  ) {
    if (($event.ctrlKey || $event.metaKey) && $event.keyCode == 90) {
      if (
        this.paths &&
        this.paths.status != "completed" &&
        this.isPreview &&
        this.isCustomSelected
      ) {
        this.removeLastCustomPoly(this.customPolyObj);
      }
    }
  }

  // getDataFromDb() {
  //     return new Promise((resolve, reject) => {
  //         const route_id = this.route_id;

  //         this.db.transaction(function (tx) {
  //             const q = `SELECT * FROM poly WHERE id = '${route_id}'`;
  //             tx.executeSql(q, [], function (sqlTransaction, sqlResultSet) {
  //                 const rows = sqlResultSet.rows;
  //                 if (rows.length === 0) {
  //                     const q1 = `INSERT INTO poly (id) VALUES ('${route_id}')`;
  //                     tx.executeSql(q1);
  //                     resolve(null);
  //                 } else {
  //                     resolve(rows[0].data);
  //                 }
  //             });
  //         });
  //     });
  // }

  setDataDB(db, route_id, data?) {
    return new Promise((resolve, reject) => {
      let obj = { id: route_id, data: data };
      const tx = db.transaction(["poly"], "readwrite");
      const objStore = tx.objectStore("poly", 1);
      let req;
      if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
        // Do Firefox-related activities
        req = objStore.put(obj);
      } else {
        // req  = objStore.put(obj,route_id);
        req = objStore.put(obj);
      }
      req.onerror = (err) => {
        console.log(err);
        reject(err);
      };
      req.onsuccess = (res) => {
        console.log("added");
        resolve(true);
      };
    });
  }
  getDataFromDb() {
    return new Promise((resolve, reject) => {
      const route_id = this.route_id;
      this.keys().then((e) => {
        console.log(e);
        const rows = e;
        if (rows.length === 0) {
          // const q1 = `INSERT INTO poly (id) VALUES ('${route_id}')`;
          // tx.executeSql(q1);
          // ==========================================
          let db;
          const req = indexedDB.open("polydb");
          req.onerror = (eve) => {
            console.log(eve);
          };
          req.onsuccess = (eve: any) => {
            db = eve.target.result;
            this.setDataDB(db, route_id, null)
              .then((res) => {
                if (res == true) {
                  resolve(null);
                }
              })
              .catch((err) => {
                console.log(err);
              });
          };
        } else {
          this.get(route_id).then((data) => {
            resolve((data && data.data) || null);
          });
        }
      });
      // ====================================================================
      // this.db.transaction(function (tx) {
      //     const q = `SELECT * FROM poly WHERE id = '${route_id}'`;
      //     tx.executeSql(q, [], function (sqlTransaction, sqlResultSet) {
      //         const rows = sqlResultSet.rows;
      //         if (rows.length === 0) {
      //             const q1 = `INSERT INTO poly (id) VALUES ('${route_id}')`;
      //             tx.executeSql(q1);
      //             resolve(null);
      //         } else {
      //             resolve(rows[0].data);
      //         }
      //     });
      // });
    });
  }

  getPolyDetails() {
    this.finalPath = [];
    this.conflictPaths = [];
    // tslint:disable-next-line:max-line-length
    const url = `${environment.poly_api_url}${this.city}/${this.agency}/bus/route/fetch/poly/alternatives?routeId=${this.route_id}`;
    this.polyDetailSubscription = this.http.get(url).subscribe(
      (res) => {
        if (res) {
          this.paths = res;
          this.paths.poly = JSON.parse(this.paths.poly);
          this.totalSegments = this.paths.poly.length;
          // if (this.paths.status === 'completed') {
          //     this.paths.poly = this.paths.poly;
          // }
          if (this.paths.selectedPoly) {
            const selectedPolyCopy = JSON.parse(this.paths.selectedPoly);
            if (selectedPolyCopy && selectedPolyCopy.length) {
              for (let index = 0; index < this.paths.poly.length; index++) {
                const polyIndex = _.findIndex(selectedPolyCopy, {
                  stop1: this.paths.poly[index].stop1,
                  stop2: this.paths.poly[index].stop2,
                });
                if (polyIndex > -1) {
                  const polyStr = selectedPolyCopy[polyIndex].paths[0];
                  const polyStrIndex =
                    this.paths.poly[index].paths.indexOf(polyStr);
                  if (polyStrIndex === -1) {
                    this.paths.poly[index].paths.push(polyStr);
                  }
                }
              }
            }
          }
          this.setMapPositions();
        } else {
          this.showMessage("Something went wrong. Please try agian.");
        }
      },
      (err) => {
        this.showMessage("Something went wrong. Please try agian.");
      }
    );
  }

  setMapPositions() {
    this.getDataFromDb().then((data) => {
      const conflictDataPoly = data;
      let conflictData = localStorage.getItem(this.route_id);
      const poly = circularJSON.parse(conflictDataPoly);
      if (poly && poly.length) {
        for (let index = 0; index < poly.length; index++) {
          const stop1Details = _.find(this.stopDetails, {
            stop_id: poly[index].stop1,
          });
          const stop2Details = _.find(this.stopDetails, {
            stop_id: poly[index].stop2,
          });
          if (stop1Details && stop2Details) {
          } else {
            const route_id = this.route_id;
            localStorage.removeItem(this.route_id);
            // this.db.transaction(function (tx) {
            //     const q = `DELETE FROM poly WHERE id = '${route_id}'`;
            //     tx.executeSql(q);
            // });
            this.del(route_id)
              .then((res) => {
                console.log(res);
              })
              .catch((err) => {
                console.log(err);
              });
            conflictData = null;
            break;
          }
        }
      }
      if (
        poly &&
        poly.length &&
        JSON.parse(conflictData) &&
        JSON.parse(conflictData).finalPath &&
        JSON.parse(conflictData).finalPath.length
      ) {
        // const poly = circularJSON.parse(conflictDataPoly);
        for (let index = 0; index < poly.length; index++) {
          if (typeof poly[index].paths === "string") {
            const obj = [poly[index].paths];
            poly[index].paths = obj;
          }
        }
        this.paths.poly = poly;
        this.finalPath = JSON.parse(conflictData).finalPath;
      } else {
        if (this.paths.selectedPoly && this.paths.selectedPoly.length > 1) {
          const selectedPolyPath = JSON.parse(this.paths.selectedPoly);
          this.finalPath = [];
          for (let index = 0; index < this.paths.poly.length; index++) {
            const selectedIndex = _.findIndex(selectedPolyPath, {
              stop1: this.paths.poly[index].stop1,
              stop2: this.paths.poly[index].stop2,
            });
            if (selectedIndex > -1) {
              this.finalPath.push(selectedPolyPath[selectedIndex]);
            } else {
              const obj = {
                stop1: this.paths.poly[index].stop1,
                stop2: this.paths.poly[index].stop2,
                paths: [],
              };
              if (
                this.paths.poly[index].paths &&
                this.paths.poly[index].paths.length === 1
              ) {
                obj.paths = this.paths.poly[index].paths;
              }
              this.finalPath.push(obj);
            }
          }
          // this.finalPath = JSON.parse(this.paths.selectedPoly);
        } else {
          for (let index = 0; index < this.paths.poly.length; index++) {
            const obj = {
              stop1: this.paths.poly[index].stop1,
              stop2: this.paths.poly[index].stop2,
              paths: [],
            };
            if (
              this.paths.poly[index].paths &&
              this.paths.poly[index].paths.length === 1
            ) {
              obj.paths = this.paths.poly[index].paths;
            }
            this.finalPath.push(obj);
          }
        }
      }
      if (this.paths.status === "completed") {
        this.setMarkers();
      } else {
        if (
          JSON.parse(conflictData) &&
          JSON.parse(conflictData).conflictPaths &&
          JSON.parse(conflictData).conflictPaths.length
        ) {
          this.conflictPaths = JSON.parse(conflictData).conflictPaths;
          for (let index = 0; index < this.conflictPaths.length; index++) {
            this.conflictPaths[index].position1 = new google.maps.LatLng(
              parseFloat(this.conflictPaths[index].position1.lat),
              parseFloat(this.conflictPaths[index].position1.lng)
            );
            this.conflictPaths[index].position2 = new google.maps.LatLng(
              parseFloat(this.conflictPaths[index].position2.lat),
              parseFloat(this.conflictPaths[index].position2.lng)
            );
          }
        } else {
          for (let index = 0; index < this.paths.poly.length; index++) {
            // if (this.paths.poly[index].paths && this.paths.poly[index].paths.length > 1) {
            this.paths.poly[index]["polyObject"] = [];
            const stop1Details = _.find(this.stopDetails, {
              stop_id: this.paths.poly[index].stop1,
            });
            const stop2Details = _.find(this.stopDetails, {
              stop_id: this.paths.poly[index].stop2,
            });
            if (stop1Details && stop2Details) {
              const obj = {
                index: index,
                stop1Details: stop1Details,
                stop2Details: stop2Details,
                position1: new google.maps.LatLng(
                  parseFloat(stop1Details.stop_lat),
                  parseFloat(stop1Details.stop_lon)
                ),
                position2: new google.maps.LatLng(
                  parseFloat(stop2Details.stop_lat),
                  parseFloat(stop2Details.stop_lon)
                ),
              };
              this.conflictPaths.push(obj);
            }
            // }
          }
        }
        this.isSaveInLocal = false;
        this.showConflicts();
      }
    });
  }

  getRouteDetails() {
    this.isSaveInLocal = true;
    // tslint:disable-next-line:max-line-length
    const url = `${environment.poly_api_url}${this.city}/${this.agency}/bus/route/fetch/details?routeId=${this.route_id}`;
    this.routeDetailSubscription = this.http.get(url).subscribe(
      (res) => {
        if (res) {
          // this.isSaveInLocal = false
          this.stopDetails = res["route"].stopSequenceWithDetails;
          this.routeDetails = res["route"];
          this.initMap();
          this.getPolyDetails();
        } else {
          this.isSaveInLocal = false;
          this.showMessage("Something went wrong. Please try agian.");
        }
      },
      (err) => {
        this.isSaveInLocal = false;
        if (err.status === 401) {
          this.httpHandler.getRefreshToken().then((res) => {
            if (res) {
              this.getRouteDetails();
            }
          });
        }
        this.showMessage("Something went wrong. Please try agian.");
      }
    );
  }

  getAllRoutePolyDetails() {
    let fromTimeStamp = moment(this.fromDate).valueOf();
    let toTimeStamp = moment(this.toDate).valueOf();
    let dispatchedInfo = JSON.parse(localStorage.getItem("dispatchInfo"));
    let agency = dispatchedInfo["agency"]["name"].trim().toLowerCase();
    // `https://production.zophop.com/dashboard/enterprise/mumbai/accuracy/polyline?agency=best&routeId=AQDKDVLD&from=1645116688493&to=1646844688493`
    const url = `${environment.poly_all_point_url}accuracy/${this.city}/${agency}/bus/${this.route_id}`;
    this.allPolyDetailSubscription = this.http.get(url).subscribe(
      (res) => {
        if (res) {
          this.accuracy = res["accuracy"];
          this.allPoints = res["allPoints"];
          // if(this.allPoints && this.allPoints.length) {
          //     this.createAllPolyline(this.allPoints);
          // }
        } else {
          this.isSaveInLocal = false;
          this.showMessage("Something went wrong. Please try agian.");
        }
      },
      (err) => {
        this.isSaveInLocal = false;
        if (err.status === 401) {
          this.httpHandler.getRefreshToken().then((res) => {
            if (res) {
              this.getAllRoutePolyDetails();
            }
          });
        }
        this.showMessage("Something went wrong. Please try agian.");
      }
    );
  }

  removeAllPolylines() {
    if (this.allPolyArray && this.allPolyArray.length) {
      for (let i = 0; i < this.allPolyArray.length; i++) {
        this.allPolyArray[i].setMap(null);
      }
      this.allPolyArray = [];
    }
  }

  createAllPolyline(data) {
    let busStopGpsCoordinates = [];
    for (let i = 0; i < data.length; i++) {
      let lat = parseFloat(data[i].split(",")[0]);
      let lon = parseFloat(data[i].split(",")[1]);
      let stopLine = {
        lat: lat,
        lng: lon,
      };
      busStopGpsCoordinates.push(stopLine);
    }

    for (const latLong of busStopGpsCoordinates) {
      // Add the circle for this city to the map.
      let marker;
      let position = new google.maps.LatLng(latLong["lat"], latLong["lng"]);
      marker = new google.maps.Marker({
        position: position,
        icon: "assets/images/dark-green1.png",
      });
      marker.setMap(this.map);
      this.allPolyArray.push(marker);
    }
    // const polyline = new google.maps.Polyline({
    //     path: busStopGpsCoordinates,
    //     map: this.map,
    //     strokeColor: "B8D06C",
    //     strokeWeight: 4,
    //     zIndex: 9
    // });
    // this.allPolyArray.push(polyline);
    let bounds = new google.maps.LatLngBounds();
    for (let i of busStopGpsCoordinates) {
      bounds.extend(i);
    }
    this.map.fitBounds(bounds);
  }

  getCheckedPolyline() {
    this.isAllChecked = !this.isAllChecked;
    this.removeAllPolylines();
    if (this.allPoints && this.allPoints.length && this.isAllChecked) {
      this.createAllPolyline(this.allPoints);
    }
  }

  edit(index?) {
    this.paths.status = "pending";
    this.paths.poly = JSON.parse(this.paths.conflicts);
    this.paths.selectedPoly = JSON.parse(this.paths.selectedPoly);
    this.conflictPathIndex = 0;
    this.totalSegments = this.paths.poly.length;
    if (index) {
      this.conflictPathIndex = index;
      this.currentSegment = this.conflictPathIndex + 1;
    }
    for (let index = 0; index < this.paths.poly.length; index++) {
      const polyIndex = _.findIndex(this.paths.selectedPoly, {
        stop1: this.paths.poly[index].stop1,
        stop2: this.paths.poly[index].stop2,
      });
      if (polyIndex > -1) {
        const polyStr = this.paths.selectedPoly[polyIndex].paths[0];
        const polyStrIndex = this.paths.poly[index].paths.indexOf(polyStr);
        if (polyStrIndex === -1) {
          this.paths.poly[index].paths.push(polyStr);
        }
      }
    }
    this.paths.selectedPoly = JSON.stringify(this.paths.selectedPoly);
    this.setMapPositions();
    this.initMap();
  }

  initMap() {
    console.log(this.mapRef);
    this.map = new google.maps.Map(this.mapRef.nativeElement, {
      center: {
        lat: this.stopDetails[0].stop_lat,
        lng: this.stopDetails[0].stop_lon,
      },
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      clickableIcons: true,
    });

    if (this.isAllChecked) {
      this.isAllChecked = !this.isAllChecked;
      this.getCheckedPolyline();
    }
  }

  getConflicts() {
    return _.filter(this.finalPath, function (o) {
      if (o.paths.length === 0) {
        return o;
      }
    }).length;
  }

  setMarkers() {
    let scope = this;
    const infowindow = new google.maps.InfoWindow();
    const bounds = new google.maps.LatLngBounds();
    const map = this.map;
    for (let index = 0; index < this.stopDetails.length; index++) {
      if (
        this.stopDetails[index].stop_lat &&
        this.stopDetails[index].stop_lon
      ) {
        const position = new google.maps.LatLng(
          parseFloat(this.stopDetails[index].stop_lat),
          parseFloat(this.stopDetails[index].stop_lon)
        );
        const title = this.stopDetails[index].stop_name;
        const stopIndex = _.findIndex(this.finalPath, (item) => {
          if (
            (item.stop1 === this.stopDetails[index].stop_id ||
              item.stop2 === this.stopDetails[index].stop_id) &&
            item.paths.length === 0
          ) {
            return true;
          }
        });
        let marker;
        if (stopIndex > -1) {
          marker = new google.maps.Marker({
            position: position,
            title: title,
          });
        } else {
          marker = new google.maps.Marker({
            position: position,
            icon: {
              url: "assets/images/circle.png",
              scaledSize: new google.maps.Size(11, 11),
            },
            // title: title
          });
        }

        if (
          (this.stopDetails[index].stop_lat ===
            this.routeDetails.first_stop.stop_lat &&
            this.stopDetails[index].stop_lon ===
              this.routeDetails.first_stop.stop_lon) ||
          (this.stopDetails[index].stop_lat ===
            this.routeDetails.last_stop.stop_lat &&
            this.stopDetails[index].stop_lon ===
              this.routeDetails.last_stop.stop_lon)
        ) {
          marker.setOptions({
            label: {
              text: this.stopDetails[index].stop_name,
              fontSize: "18px",
            },
          });
        }
        marker.tooltipContent = title;
        marker.setMap(map);

        bounds.extend(position);

        // tslint:disable-next-line:no-shadowed-variable
        google.maps.event.addListener(
          marker,
          "click",
          (function (marker, title, infowindow) {
            return function (res) {
              infowindow.setContent(title);
              infowindow.open(this.wpmap, marker);
              map.setCenter(res.latLng);
            };
          })(marker, title, infowindow)
        );

        google.maps.event.addListener(
          marker,
          "click",
          (function (marker, title, infowindow) {
            return function (res) {
              if (scope.paths) {
                let stoplat = res.latLng.lat();
                let stoplong = res.latLng.lng();
                let conflictPathIndex = 0;

                const filteredData = scope.stopDetails.filter((ele, i) => {
                  return ele.stop_lon === stoplong && ele.stop_lat === stoplat;
                });
                conflictPathIndex = _.findIndex(scope.stopDetails, (e) => {
                  return e.stop_id == filteredData[0].stop_id;
                });

                if (conflictPathIndex > -1) {
                  scope.edit(conflictPathIndex);
                  scope.previewAllPaths();
                }
              }
            };
          })(marker, title, infowindow)
        );
        google.maps.event.addListener(marker, "mouseover", function (res) {
          let scale = Math.pow(2, map.getZoom());
          let proj = map.getProjection();
          let bounds = map.getBounds();
          let nw = proj.fromLatLngToPoint(
            new google.maps.LatLng(
              bounds.getNorthEast().lat(),
              bounds.getSouthWest().lng()
            )
          );
          let point = proj.fromLatLngToPoint(res.latLng);
          let points = new google.maps.Point(
            Math.floor((point.x - nw.x) * scale),
            Math.floor((point.y - nw.y) * scale)
          );
          document.getElementById("marker-tooltip").innerHTML =
            marker.tooltipContent +
            "<br>Lat: " +
            res.latLng.lat().toFixed(4) +
            "<br>Lng: " +
            res.latLng.lng().toFixed(4);
          document.getElementById("marker-tooltip").style.left =
            points.x + "px";
          document.getElementById("marker-tooltip").style.top = points.y + "px";
          document.getElementById("marker-tooltip").style.display = "block";
        });
        google.maps.event.addListener(marker, "mouseout", function () {
          document.getElementById("marker-tooltip").style.display = "none";
        });
      }
    }
    this.map.fitBounds(bounds);
    this.isSaveInLocal = false;
    this.showPaths();
  }

  showPaths() {
    const finalpath = this.finalPath;
    if (this.paths.status === "completed") {
      const polyline = new google.maps.Polyline({
        path: google.maps.geometry.encoding.decodePath(this.paths.poly),
        map: this.map,
        strokeColor: "#FE7C00",
        strokeWeight: 4,
      });
    } else {
      for (let index = 0; index < this.paths.poly.length; index++) {
        let strokeColor = "#A9A9A9";
        let zIndex;
        if (this.paths.poly[index].paths) {
          for (
            let pathIndex = 0;
            pathIndex < this.paths.poly[index].paths.length;
            pathIndex++
          ) {
            const selectedSegmentIndex = _.findIndex(finalpath, {
              stop1: this.paths.poly[index].stop1,
              stop2: this.paths.poly[index].stop2,
            });
            if (
              finalpath[selectedSegmentIndex] &&
              finalpath[selectedSegmentIndex].paths &&
              finalpath[selectedSegmentIndex].paths.length
            ) {
              if (
                finalpath[selectedSegmentIndex].paths[0] ===
                this.paths.poly[index].paths[pathIndex]
              ) {
                strokeColor = "#FE7C00";
                zIndex = 9999;
              } else {
                strokeColor = "#A9A9A9";
                zIndex = 9;
              }
            }
            const polyline = new google.maps.Polyline({
              path: google.maps.geometry.encoding.decodePath(
                this.paths.poly[index].paths[pathIndex]
              ),
              map: this.map,
              strokeColor: strokeColor,
              strokeWeight: 4,
              zIndex: zIndex,
            });
          }
        }
      }
    }
  }

  nextConflict() {
    this.isCustomSelected = false;
    this.map = null;
    this.initMap();
    this.conflictPathIndex++;
    this.currentSegment++;
    setTimeout(() => {
      this.showConflicts();
    });
  }
  prevConflict() {
    this.isCustomSelected = false;
    this.map = null;
    this.initMap();
    this.conflictPathIndex--;
    this.currentSegment--;
    setTimeout(() => {
      this.showConflicts();
    });
  }

  showConflicts() {
    this.saveInterval = setInterval(() => {
      if (this.paths && this.paths.status != "completed") {
        this.saveInLocalStorage();
      }
    }, 30 * 1000);
    const selectPoly = this.selectPoly;
    const finalpath = this.finalPath;
    const route_id = this.route_id;
    const conflictPaths = this.conflictPaths;
    const map = this.map;
    let strokeColor = "#A9A9A9";
    let zIndex;
    const polyData = this.conflictPaths[this.conflictPathIndex];
    this.paths.poly[polyData.index]["polyObject"] = [];
    this.showConflictMarker();
    for (
      let pathIndex = 0;
      pathIndex < this.paths.poly[polyData.index].paths.length;
      pathIndex++
    ) {
      const selectedSegmentIndex = _.findIndex(finalpath, {
        stop1: this.paths.poly[polyData.index].stop1,
        stop2: this.paths.poly[polyData.index].stop2,
      });
      if (
        this.finalPath[selectedSegmentIndex].paths &&
        this.finalPath[selectedSegmentIndex].paths.length
      ) {
        if (
          this.finalPath[selectedSegmentIndex].paths[0] ===
          this.paths.poly[polyData.index].paths[pathIndex]
        ) {
          strokeColor = "#FE7C00";
          zIndex = 9999;
        } else {
          strokeColor = "#A9A9A9";
          zIndex = 9;
        }
      }
      const polyline = new google.maps.Polyline({
        path: google.maps.geometry.encoding.decodePath(
          this.paths.poly[polyData.index].paths[pathIndex]
        ),
        map: map,
        strokeColor: strokeColor,
        strokeWeight: 4,
        zIndex: zIndex,
      });
      if (
        this.paths.poly[polyData.index].paths &&
        this.paths.poly[polyData.index].paths.length > 1
      ) {
        this.paths.poly[polyData.index]["polyObject"].push({
          polyStr: this.paths.poly[polyData.index].paths[pathIndex],
          objData: polyline,
        });
        const stop1 = this.paths.poly[polyData.index].stop1;
        const stop2 = this.paths.poly[polyData.index].stop2;
        const polyStr = this.paths.poly[polyData.index].paths[pathIndex];
        const polyObj = this.paths.poly[polyData.index]["polyObject"];
        const db = this.db;
        const paths = this.paths;
        google.maps.event.addListener(
          polyline,
          "click",
          (function (_stop1, _stop2, _polyStr, _polyObj) {
            return function (res) {
              selectPoly(
                stop1,
                stop2,
                polyStr,
                polyObj,
                finalpath,
                route_id,
                conflictPaths,
                paths,
                db
              );
            };
          })(stop1, stop2, polyStr, polyObj)
        );
      }
    }
    const selectedSegmentIndex1 = _.findIndex(finalpath, {
      stop1: this.paths.poly[polyData.index].stop1,
      stop2: this.paths.poly[polyData.index].stop2,
    });
    if (
      this.finalPath[selectedSegmentIndex1 + 1] &&
      this.finalPath[selectedSegmentIndex1 + 1].paths &&
      this.finalPath[selectedSegmentIndex1 + 1].paths.length
    ) {
      const polyline = new google.maps.Polyline({
        path: google.maps.geometry.encoding.decodePath(
          this.finalPath[selectedSegmentIndex1 + 1].paths[0]
        ),
        map: map,
        strokeColor: "#fe7c0080",
        strokeWeight: 4,
        zIndex: zIndex,
      });
    }
    if (
      selectedSegmentIndex1 > 0 &&
      this.finalPath[selectedSegmentIndex1 - 1].paths &&
      this.finalPath[selectedSegmentIndex1 - 1].paths.length
    ) {
      const polyline = new google.maps.Polyline({
        path: google.maps.geometry.encoding.decodePath(
          this.finalPath[selectedSegmentIndex1 - 1].paths[0]
        ),
        map: map,
        strokeColor: "#fe7c0080",
        strokeWeight: 4,
        zIndex: zIndex,
      });
    }
  }

  showConflictMarker() {
    const bounds = new google.maps.LatLngBounds();
    const map = this.map;
    const polyData = this.conflictPaths[this.conflictPathIndex];
    const stop1Marker = new google.maps.Marker({
      position: polyData.position1,
      icon: {
        url: "assets/images/black-map-pin.png",
        scaledSize: new google.maps.Size(25, 35),
      },
      // title: polyData.stop1Details.stop_name,
      label: polyData.stop1Details.stop_name + " (Start)",
    });
    stop1Marker.tooltipContent = polyData.stop1Details.stop_name;
    stop1Marker.setMap(map);
    const stop2Marker = new google.maps.Marker({
      position: polyData.position2,
      icon: {
        url: "assets/images/black-map-pin.png",
        scaledSize: new google.maps.Size(25, 35),
      },
      // title: polyData.stop2Details.stop_name,
      label: polyData.stop2Details.stop_name,
    });
    stop2Marker.tooltipContent = polyData.stop2Details.stop_name;
    stop2Marker.setMap(map);
    bounds.extend(polyData.position1);
    bounds.extend(polyData.position2);
    this.map.fitBounds(bounds);
    google.maps.event.addListener(stop1Marker, "mouseover", function (res) {
      let scale = Math.pow(2, map.getZoom());
      let proj = map.getProjection();
      let bounds = map.getBounds();
      let nw = proj.fromLatLngToPoint(
        new google.maps.LatLng(
          bounds.getNorthEast().lat(),
          bounds.getSouthWest().lng()
        )
      );
      let point = proj.fromLatLngToPoint(res.latLng);
      let points = new google.maps.Point(
        Math.floor((point.x - nw.x) * scale),
        Math.floor((point.y - nw.y) * scale)
      );
      document.getElementById("marker-tooltip").innerHTML =
        stop1Marker.tooltipContent +
        "<br>Lat: " +
        res.latLng.lat().toFixed(4) +
        "<br>Lng: " +
        res.latLng.lng().toFixed(4);
      document.getElementById("marker-tooltip").style.left = points.x + "px";
      document.getElementById("marker-tooltip").style.top = points.y + "px";
      document.getElementById("marker-tooltip").style.display = "block";
    });
    google.maps.event.addListener(stop1Marker, "mouseout", function () {
      document.getElementById("marker-tooltip").style.display = "none";
    });
    google.maps.event.addListener(stop2Marker, "mouseover", function (res) {
      let scale = Math.pow(2, map.getZoom());
      let proj = map.getProjection();
      let bounds = map.getBounds();
      let nw = proj.fromLatLngToPoint(
        new google.maps.LatLng(
          bounds.getNorthEast().lat(),
          bounds.getSouthWest().lng()
        )
      );
      let point = proj.fromLatLngToPoint(res.latLng);
      let points = new google.maps.Point(
        Math.floor((point.x - nw.x) * scale),
        Math.floor((point.y - nw.y) * scale)
      );
      document.getElementById("marker-tooltip").innerHTML =
        stop2Marker.tooltipContent +
        "<br>Lat: " +
        res.latLng.lat().toFixed(4) +
        "<br>Lat: " +
        res.latLng.lng().toFixed(4);
      document.getElementById("marker-tooltip").style.left = points.x + "px";
      document.getElementById("marker-tooltip").style.top = points.y + "px";
      document.getElementById("marker-tooltip").style.display = "block";
    });
    google.maps.event.addListener(stop2Marker, "mouseout", function () {
      document.getElementById("marker-tooltip").style.display = "none";
    });
  }

  selectPoly(
    stop1,
    stop2,
    polyStr,
    polyObj,
    finalpath,
    route_id,
    conflictPaths,
    paths,
    db
  ) {
    const selectedSegmentIndex = _.findIndex(finalpath, {
      stop1: stop1,
      stop2: stop2,
    });
    let selectedPoly;
    if (
      finalpath[selectedSegmentIndex].paths.length &&
      finalpath[selectedSegmentIndex].paths[0] === polyStr
    ) {
      finalpath[selectedSegmentIndex].paths = [];
    } else {
      finalpath[selectedSegmentIndex].paths = [polyStr];
      selectedPoly = _.remove(polyObj, { polyStr: polyStr });
      if (selectedPoly[0].objData) {
        selectedPoly[0].objData.setOptions({
          strokeColor: "#FE7C00",
          zIndex: 99999,
        });
      }
    }
    for (let index = 0; index < polyObj.length; index++) {
      if (polyObj[index].objData) {
        polyObj[index].objData.setOptions({
          strokeColor: "#A9A9A9",
          zIndex: 9,
        });
      }
    }
    if (selectedPoly && selectedPoly[0]) {
      polyObj.push(selectedPoly[0]);
    }
    const data = {
      finalPath: finalpath,
      conflictPaths: conflictPaths,
    };
    // setTimeout(() => {
    //     db.transaction(function (tx) {
    //         const q = `UPDATE poly SET data = '${circularJSON.stringify(paths.poly)}' WHERE id = '${route_id}'`;
    //         tx.executeSql(q);
    //     });
    //     localStorage.setItem(route_id, JSON.stringify(data));
    // }, 1500);
  }

  drawCustom() {
    this.isCustomSelected = !this.isCustomSelected;
    this.map = null;
    this.customMarkerArray = [];
    this.initMap();
    setTimeout(() => {
      this.showConflictMarker();
      const customPoly = new google.maps.Polyline({
        strokeColor: "#FE7C00",
        strokeWeight: 4,
      });
      customPoly.setMap(this.map);
      const path = customPoly.getPath();
      const polyData1 = this.conflictPaths[this.conflictPathIndex];
      path.push(polyData1.position1);
      this.map.addListener("click", (event) => {
        this.addCustomPoly(event, customPoly);
      });
      this.customPolyObj = customPoly;
    });
    const polyData = this.conflictPaths[this.conflictPathIndex];
    const selectedSegmentIndex1 = _.findIndex(this.finalPath, {
      stop1: this.paths.poly[polyData.index].stop1,
      stop2: this.paths.poly[polyData.index].stop2,
    });
    if (
      this.finalPath[selectedSegmentIndex1 + 1] &&
      this.finalPath[selectedSegmentIndex1 + 1].paths &&
      this.finalPath[selectedSegmentIndex1 + 1].paths.length
    ) {
      const polyline = new google.maps.Polyline({
        path: google.maps.geometry.encoding.decodePath(
          this.finalPath[selectedSegmentIndex1 + 1].paths[0]
        ),
        map: this.map,
        strokeColor: "#fe7c0080",
        strokeWeight: 4,
        zIndex: 999,
      });
    }
    if (
      selectedSegmentIndex1 > 0 &&
      this.finalPath[selectedSegmentIndex1 - 1].paths &&
      this.finalPath[selectedSegmentIndex1 - 1].paths.length
    ) {
      const polyline = new google.maps.Polyline({
        path: google.maps.geometry.encoding.decodePath(
          this.finalPath[selectedSegmentIndex1 - 1].paths[0]
        ),
        map: this.map,
        strokeColor: "#fe7c0080",
        strokeWeight: 4,
        zIndex: 999,
      });
    }
  }

  addCustomPoly(event, customPoly) {
    const _this = this;
    if (this.undoListener) {
      google.maps.event.removeListener(this.undoListener);
    }
    const path = customPoly.getPath();
    path.push(event.latLng);
    this.customPoly = google.maps.geometry.encoding.encodePath(path);
    const marker = new google.maps.Marker({
      position: event.latLng,
      map: this.map,
    });
    this.customMarkerArray.push(marker);
    this.undoListener = marker.addListener("click", function () {
      _this.removeLastCustomPoly(customPoly);
    });
  }

  removeLastCustomPoly(customPoly) {
    const _this = this;
    const path = customPoly.getPath();
    path.pop();
    this.customPoly = google.maps.geometry.encoding.encodePath(path);
    this.customMarkerArray[this.customMarkerArray.length - 1].setMap(null);
    this.customMarkerArray.pop();
    if (this.customMarkerArray && this.customMarkerArray.length) {
      this.undoListener = this.customMarkerArray[
        this.customMarkerArray.length - 1
      ].addListener("click", function () {
        _this.removeLastCustomPoly(customPoly);
      });
    }
  }

  saveCustomPoly() {
    this.isCustomSelected = !this.isCustomSelected;
    if (this.customPoly) {
      const path = google.maps.geometry.encoding.decodePath(this.customPoly);
      path.shift();
      this.customPoly = google.maps.geometry.encoding.encodePath(path);
      const polyData = this.conflictPaths[this.conflictPathIndex];
      this.paths.poly[polyData.index].paths.push(this.customPoly);
      this.paths.poly[polyData.index]["polyObject"].push({
        polyStr: this.customPoly,
        objData: this.customPolyObj,
      });
      const stop1 = this.paths.poly[polyData.index].stop1;
      const stop2 = this.paths.poly[polyData.index].stop2;
      const polyStr = this.customPoly;
      const polyObj = this.paths.poly[polyData.index]["polyObject"];
      this.selectPoly(
        stop1,
        stop2,
        polyStr,
        polyObj,
        this.finalPath,
        this.route_id,
        this.conflictPaths,
        this.paths,
        this.db
      );
    }
    this.map = null;
    this.customMarkerArray = [];
    this.initMap();
    setTimeout(() => {
      this.showConflicts();
    });
    // this.saveInLocalStorage();
  }

  previewAllPaths() {
    this.isCustomSelected = false;
    this.map = null;
    this.initMap();
    setTimeout(() => {
      if (this.isPreview) {
        this.setMarkers();
      } else {
        this.showConflicts();
      }
      this.isPreview = !this.isPreview;
    });
  }

  submit() {
    if (this.getConflicts() === 0) {
      this.isSubmitRequest = true;
      const finalPathCopy = this.finalPath;
      for (let index = 1; index < this.finalPath.length; index++) {
        const nextPoints = de.decode(this.finalPath[index].paths[0]);
        const prevPoints = de.decode(this.finalPath[index - 1].paths[0]);
        if (!_.isEqual(nextPoints[0], prevPoints[prevPoints.length - 1])) {
          nextPoints.unshift(prevPoints[prevPoints.length - 1]);
          const polyStr = de.encode(nextPoints);
          this.finalPath[index].paths[0] = polyStr;
        }
      }
      setTimeout(() => {
        this.submitRoute(finalPathCopy);
      }, 500);
    } else {
      this.showMessage("Some conflicts still pending");
    }
  }

  submitRoute(finalPathCopy) {
    const url = `${environment.poly_api_url}${this.city}/${this.agency}/bus/route/create/poly`;
    let polyLoc = de.decode(this.finalPath[0].paths[0]);
    for (let index = 1; index < this.finalPath.length; index++) {
      polyLoc = polyLoc.concat(
        de.decode(this.finalPath[index].paths[0]).splice(1)
      );
    }
    const polyStrEncode = de.encode(polyLoc);
    const body = new URLSearchParams();
    body.append("routeId", this.route_id);
    body.append("poly", polyStrEncode);
    body.append("selectedPoly", JSON.stringify(finalPathCopy));
    this.routeSubmitSubscription = this.http
      .post(url, body.toString(), {
        headers: new HttpHeaders({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      })
      .subscribe(
        (res) => {
          if (this.saveInterval) {
            clearInterval(this.saveInterval);
          }
          localStorage.removeItem(this.route_id);
          const route_id = this.route_id;
          // this.db.transaction(function (tx) {
          //     const q = `DELETE FROM poly WHERE id = '${route_id}'`;
          //     tx.executeSql(q);
          // });
          this.del(route_id)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              console.log(err);
            });
          this.showMessage("Conflicts resolved successfully.");
          setTimeout(() => {
            this.isSubmitRequest = false;
            this.ngOnInit();
          }, 2000);
        },
        (err) => {
          this.isSubmitRequest = false;
          this.showMessage("Something went wrong. Please try agian.");
        }
      );
  }

  reset() {
    this.isSubmitRequest = true;
    this.isAllChecked = false;
    // this.removeAllPolylines();
    const url = `${environment.poly_api_url}${this.city}/${this.agency}/bus/route/reset/poly`;
    const body = new URLSearchParams();
    body.append("routeId", this.route_id);
    this.resetRouteSubscription = this.http
      .post(url, body.toString(), {
        headers: new HttpHeaders({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      })
      .subscribe(
        (res) => {
          this.showMessage("Route reset successfully.");
          localStorage.removeItem(this.route_id);
          const route_id = this.route_id;
          // this.db.transaction(function (tx) {
          //     const q = `DELETE FROM poly WHERE id = '${route_id}'`;
          //     tx.executeSql(q);
          // });
          this.del(route_id)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              console.log(err);
            });
          setTimeout(() => {
            this.isSubmitRequest = false;
            this.ngOnInit();
          }, 2000);
        },
        (err) => {
          this.isSubmitRequest = false;
          this.ngOnInit();
          // this.showMessage('Something went wrong. Please try agian.');
        }
      );
  }

  clear() {
    this.isCustomSelected = false;
    this.drawCustom();
  }

  showMessage(msg) {
    this.snackBar.open(msg, "", {
      horizontalPosition: "right",
      verticalPosition: "top",
      duration: 3000,
    });
  }

  saveInLocalStorage() {
    // this.isSaveInLocal = true;
    const data = {
      finalPath: this.finalPath,
      conflictPaths: this.conflictPaths,
    };
    const poly = this.paths.poly;
    const route_id = this.route_id;
    try {
      console.log("saved");
      localStorage.setItem(this.route_id, JSON.stringify(data));
    } catch (error) {
      console.log(error);
    }
    this.saveInLocalDB(poly, route_id).then(() => {
      // this.isSaveInLocal = false;
      console.log("saved1");
    });
  }

  saveInLocalDB(poly, route_id) {
    return new Promise((resolve, reject) => {
      let db;
      const req = indexedDB.open("polydb");
      req.onerror = (eve) => {
        console.log(eve);
      };
      req.onsuccess = (eve: any) => {
        db = eve.target.result;
        this.setDataDB(db, route_id, circularJSON.stringify(poly))
          .then((res) => {
            if (res == true) {
              resolve(null);
            }
          })
          .catch((err) => {
            console.log("UPDATE error: " + err);
          });
      };
      // ==========================================================================
      // this.db.transaction(function (tx) {
      //     const q = `UPDATE poly SET data = '${circularJSON.stringify(poly)}' WHERE id = '${route_id}'`;
      //     tx.executeSql(q, [], function () {
      //         resolve(null);
      //     }, function(tx, error) {
      //         console.log('UPDATE error: ' + error.message);
      //       });
      // }, function(error) {
      //     console.log('Transaction ERROR: ' + error.message);
      //   });
    });
  }

  clearStorage() {
    this.isSubmitRequest = true;
    const route_id = this.route_id;
    localStorage.removeItem(this.route_id);
    // this.db.transaction(function (tx) {
    //     const q = `DELETE FROM poly WHERE id = '${route_id}'`;
    //     tx.executeSql(q);
    // });
    this.del(route_id)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    setTimeout(() => {
      this.isSubmitRequest = false;
      this.ngOnInit();
    }, 2000);
  }

  cancel() {
    // this.dialogeRef.close();
  }

  ngOnDestroy() {
    if (this.polyDetailSubscription) {
      this.polyDetailSubscription.unsubscribe();
    }
    if (this.routeDetailSubscription) {
      this.routeDetailSubscription.unsubscribe();
    }
    if (this.routeSubmitSubscription) {
      this.routeSubmitSubscription.unsubscribe();
    }
    if (this.resetRouteSubscription) {
      this.resetRouteSubscription.unsubscribe();
    }
    if (this.allPolyDetailSubscription) {
      this.allPolyDetailSubscription.unsubscribe();
    }
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
  }
}
