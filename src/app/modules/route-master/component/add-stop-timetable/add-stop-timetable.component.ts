import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  ViewContainerRef,
} from "@angular/core";
import { RouteService } from "../../route-master.service";
import { faArrowsAlt } from "@fortawesome/free-solid-svg-icons";
import * as _ from "lodash";
import { Helpers } from "src/providers/helper";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationDialogueComponent } from "../../../../components/confirmation-dialogue/confirmation-dialogue.component";
import { ActivatedRoute, Router } from "@angular/router";
import { AddRouteDetailsComponent } from "../add-route-details/add-route-details.component";
import { CdkDragDrop, DropListRef } from "@angular/cdk/drag-drop";
import { FormGroup, FormBuilder, FormControl, FormArray } from "@angular/forms";
import { ReviewChangesComponent } from "../review-changes/review-changes.component";
import { retry, pairwise, startWith } from "rxjs/operators";
import { ViewFareComponent } from "../view-fare/view-fare.component";
import { langCodes } from "src/app/utils/config/constants";
import { HttpClient } from "@angular/common/http";

import { environment } from "src/environments/environment";

declare var google: any;
@Component({
  selector: "app-add-stop-timetable",
  templateUrl: "./add-stop-timetable.component.html",
  styleUrls: ["./add-stop-timetable.component.scss"],
})
export class AddStopTimetableComponent implements OnInit, OnDestroy {
  temp_url;
  show_accuracy;
  new_data;
  temp_data;
  faArrowsAlt = faArrowsAlt;
  timeTable;
  distanceFile;
  distanceArray = [];
  fareFile;
  selectedTabIndex = 0;
  newRouteDetails;
  stopList;
  stops;
  range;
  selectedStop: number;
  isStopSelected = false;
  map;
  markersArray = [];
  circleArray = [];
  isEdit;
  totalStopList;
  infoWindow;
  isCollapsed = false;
  isRadiusClicked: boolean = false;
  radius = 50;
  isShowLoader = false;
  searchStopForm: FormGroup;

  allPossibleCategories = [];
  multiCategoryFareForm: FormGroup;
  categoryUploaded;
  categoryFareObject = {};
  categories: string[] = [];
  fareFiles: File[] = [];
  backParam: any;
  deleteStopArray = [];
  stopPath;
  showSearchBox: boolean = false;
  allStopsMarker = [];
  timeTableFileData: any;
  fareMatrixData: any;
  keys = [];
  prefilledTranslatedList = {};
  compState = (optionVal: string, selectedVal: string) => {
    return optionVal == selectedVal;
  };
  formControlSubscriptions = [];
  languagesList = [];
  clickedStop;
  finalTranslationValues;

  @ViewChild("file", { static: false }) file: ElementRef;
  @ViewChild("file1", { static: false }) file1: ElementRef;
  @ViewChild("file2", { static: false }) file2: ElementRef;
  @ViewChild("fileUpload1", { static: false }) fileUpload1: ElementRef;
  @ViewChild("fileUpload2", { static: false }) fileUpload2: ElementRef;
  @ViewChild("fileUpload", { static: false }) fileUpload: ElementRef;
  @ViewChild("map") mapRef: ElementRef;
  @ViewChild("myInput") myInput: ElementRef;
  @ViewChild("myInputLat") myInputLat: ElementRef;
  @ViewChild("myInputLng") myInputLng: ElementRef;
  constructor(
    private viewContainerRef: ViewContainerRef,
    private routeService: RouteService,
    private helpers: Helpers,
    private dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.backParam = params.back;
      console.log("backlink is---", this.backParam);
    });

    // this.range = new FormGroup({
    //   start: new FormControl(),
    //   end: new FormControl(),
    // });

    this.searchStopForm = this.formBuilder.group({
      searchStop: "",
    });
    this.newRouteDetails = this.routeService.getNewRouteDetails();

    this.routeService
      .getRouteOutPoly(this.newRouteDetails["routeId"])
      .then((res) => {
        this.new_data = res;
        console.log("ajay service respose data", res);
        // localStorage.setItem();
      })
      .catch((err) => {
        this.new_data = {};
        // this.isShowLoader = false;
      })
      .finally(() => {
        if (this.new_data != {}) {
          this.show_accuracy = this.new_data["accuracy"];
          this.temp_data = this.new_data["outOfPolyPoints"];
        }
        // console.log("ajay temp datad", this.temp_data);
      });

    this.stopList = [...this.newRouteDetails.stopList];
    this.stops = [...this.stopList];

    console.log("Stops1", this.stops);
    // console.log("StopList", this.stopList);

    // console.log(this.stopList[0].lat, this.stopList[0].long);

    this.map = null;
    this.languagesList = this.newRouteDetails.languageList;
    console.log("Language List", this.languagesList);

    this.multiCategoryFareForm = new FormGroup({
      categories: new FormArray([]),
    });
    this.routeService
      .getFareCategories()
      .then((categories: [string]) => {
        this.allPossibleCategories = categories;
        this.addNewCategory();
      })
      .catch((err) => {
        console.log(err);
      });
    setTimeout(() => {
      this.initMap();
      this.getCityStopList(this);
    }, 1200);
  }

  /**
   * @returns AbstractControl[] - returns all the present controls in the formArray
   */
  getCategoryControls() {
    return (this.multiCategoryFareForm.get("categories") as FormArray).controls;
  }

  /**
   *
   * @param controlValue current selected option of the formControl
   * @returns string[] (current option + remaining options)
   */
  getRemainingCategories(controlValue: string) {
    let result = [...this.allPossibleCategories];
    const controls = (this.multiCategoryFareForm.get("categories") as FormArray)
      .controls;
    for (let control of controls) {
      if (control.value !== null) {
        let index = result.indexOf(control.value);
        if (index > -1) {
          result.splice(index, 1);
        }
      }
    }
    if (controlValue !== null) {
      result.unshift(controlValue);
    }
    return result;
  }
  /**
   * Append the file in categoryFareObject
   * @param files files inputed by #fileUploader
   *
   */
  uploadFile(e) {
    const fileItem = e.target.files[0];
    if (fileItem != null)
      this.categoryFareObject[this.categoryUploaded] = fileItem;
  }
  setCategoryUploaded(category) {
    this.categoryUploaded = category;
  }
  /**
   * Create a FormControl, subscribing the value changes,
   * Pushing to the FormArray
   * Also Maintaining subscription array to unsubscribe them later
   */
  addNewCategory() {
    if (
      this.getControlCount() >= this.getArrayLength(this.allPossibleCategories)
    )
      return;

    const control = new FormControl();
    const controlSubscription = control.valueChanges
      .pipe(pairwise())
      .subscribe(([oldVal, newVal]) => {
        console.log([oldVal, newVal]);
        if (this.categoryFareObject[oldVal]) {
          this.categoryFareObject[newVal] = this.categoryFareObject[oldVal];
          delete this.categoryFareObject[oldVal];
        }
      });

    (this.multiCategoryFareForm.get("categories") as FormArray).push(control);
    this.formControlSubscriptions.push(controlSubscription);
  }
  unsubscribeAllControls() {
    for (let subscription of this.formControlSubscriptions) {
      subscription.unsubscribe();
    }
  }

  /**
   * Unsubscribe and removes the control from the FormArray.
   * Also updates the categoryFareObject
   * @param index
   * @param category
   */
  removeCategory(index: number, category: string) {
    if (this.getControlCount() <= 1) {
      if (this.getObjectLength(this.categoryFareObject) === 0) {
        return;
      } else {
        if (this.categoryFareObject[category]) {
          delete this.categoryFareObject[category];
        }
        (
          (this.multiCategoryFareForm.get("categories") as FormArray).at(
            index
          ) as FormControl
        ).reset();
        return;
      }
    }

    this.formControlSubscriptions[index].unsubscribe();
    this.formControlSubscriptions.splice(index, 1);
    (this.multiCategoryFareForm.get("categories") as FormArray).removeAt(index);
    if (this.categoryFareObject[category]) {
      delete this.categoryFareObject[category];
    }
  }
  removeFileFromCategory(category: string) {
    delete this.categoryFareObject[category];
  }
  getControlCount() {
    return (this.multiCategoryFareForm.get("categories") as FormArray).length;
  }
  getObjectLength(obj) {
    return Object.keys(obj).length;
  }
  getArrayLength(array) {
    return array.length;
  }
  createCategoryFareArray() {
    this.categories = [];
    this.fareFiles = [];
    for (let category in this.categoryFareObject) {
      this.categories.push(category);
      this.fareFiles.push(this.categoryFareObject[category]);
    }
  }

  fileSelected(event) {
    if (this.selectedTabIndex === 1) {
      if (event.target.files && event.target.files.length) {
        this.timeTableFileData = null;
        this.timeTable = event.target.files[0];
        console.log("time table file", this.timeTable.name);
        this.file.nativeElement.innerHTML = this.timeTable.name;

        let reader: FileReader = new FileReader();
        let csvData: string;
        reader.readAsText(this.timeTable);
        reader.onload = (e) => {
          csvData = reader.result as string;
          const valid = this.isValid(csvData);
          if (valid) {
            this.setTtdata(csvData);
          } else {
            this.helpers.showSnackBar("Invalid Headers.");
          }
        };
      }
    } else if (this.selectedTabIndex === 2) {
      if (event.target.files && event.target.files.length) {
        this.fareFile = event.target.files[0];
        this.file1.nativeElement.innerHTML = this.fareFile.name;
      }
    } else if (this.selectedTabIndex === 3) {
      if (event.target.files && event.target.files.length) {
        this.distanceFile = event.target.files[0];
        this.file2.nativeElement.innerHTML = this.distanceFile.name;
        let reader: FileReader = new FileReader();
        let csvData: string;
        reader.readAsText(this.distanceFile);
        reader.onload = (e) => {
          csvData = reader.result as string;
          if (csvData) {
            let distanceArray = csvData.split("\n");
            distanceArray = distanceArray.filter(function (e) {
              return e.replace(/(\r\n|\n|\r)/gm, "");
            });
            this.distanceArray = distanceArray.map(Number);
          }
        };
      }
    }
  }
  setTtdata(data) {
    this.timeTableFileData = data;
  }
  isValid(csvData) {
    let allTextLines = csvData.split(/\r?\n|\r/);
    let headers = allTextLines[0].split(",");
    if (
      headers.includes("jour") &&
      headers.includes("day") &&
      headers.includes("st") &&
      headers.includes("et") &&
      headers.includes("freq")
    ) {
      return true;
    } else {
      return false;
    }
  }

  removeFile() {
    if (this.selectedTabIndex === 1) {
      this.timeTable = null;
      this.file.nativeElement.innerHTML = "Upload File";
      this.fileUpload.nativeElement.value = null;
      this.timeTableFileData = null;
    } else if (this.selectedTabIndex === 2) {
      this.fareFile = null;
      this.fileUpload1.nativeElement.value = null;
      this.file1.nativeElement.innerHTML = "Upload File";
    } else if (this.selectedTabIndex === 3) {
      this.distanceFile = null;
      this.distanceArray = [];
      this.file2.nativeElement.innerHTML = "Upload File";
      this.fileUpload2.nativeElement.value = null;
    }
  }
  submit() {
    this.createCategoryFareArray();
    const dialogRef = this.dialog.open(ReviewChangesComponent, {
      data: {
        isFareFileUploaded: this.fareFiles.length > 0 ? true : false,
        isTimeTableUploaded: this.timeTable ? true : false,
        isDistanceUploaded: this.distanceArray.length > 0 ? true : false,
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res === "yes") {
        this.submitRoute();
      }
    });
  }

  stopClicked(sequenceNo) {
    let option;
    if (this.isEdit) {
      this.cancelEditing();
    }
    if (this.selectedStop && this.selectedStop !== sequenceNo) {
      option = {
        label: this.selectedStop.toString(),
        icon: "assets/images/black-map-pin.png",
      };
      this.setMarkerOption(this.selectedStop - 1, option);
    }
    this.isStopSelected = true;
    this.selectedStop = sequenceNo;
    option = {
      label: this.selectedStop.toString(),
      icon: "assets/images/yellow-map-pin.png",
    };
    this.setMarkerOption(sequenceNo - 1, option);
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    this.setNearByStopsLabels(sequenceNo - 1);
  }

  initMap() {
    this.map = new google.maps.Map(this.mapRef.nativeElement, {
      center: { lat: this.stopList[0].lat, lng: this.stopList[0].long },
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      clickableIcons: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
    });
    if (this.temp_data != undefined) {
      this.setMarkersNew();
    }
    this.setMarkers();
    // this.setMarkersNew();

    this.setCircle();
    this.setMapBottomMenu();
    this.setPolyLine();
    this.createSearchOption();
    this.map.addListener("click", () => {
      if (this.infoWindow) {
        this.infoWindow.close();
      }
    });

    this.map.addListener("rightclick", (e) => {
      let lat = e.latLng.lat();
      let long = e.latLng.lng();
      let position = { lat: lat, lng: long };
      this.infoWindow = this.openOptions(position);
      this.infoWindow.open(this.map);
    });
    setTimeout(() => {
      this.showSearchBox = true;
    }, 900);
  }

  createSearchOption() {
    const input = document.getElementById("pac-input") as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
      if (places.length == 0) {
        return;
      }
      const bounds = new google.maps.LatLngBounds();
      let location;
      places.forEach((place) => {
        if (!place.geometry) {
          this.helpers.showSnackBar("Returned place contains no geometry");
          return;
        }
        location = {
          latLng: place.geometry.location,
          name: place.name,
        };
        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      this.map.fitBounds(bounds);
      this.addNewStop(this, location);
    });
  }

  setPolyLine() {
    const busStopCoordinates = [];
    for (const stop of this.stopList) {
      let stopLine = {
        lat: stop.lat,
        lng: stop.long,
      };
      busStopCoordinates.push(stopLine);
    }
    if (this.stopPath) {
      this.stopPath.setMap(null);
    }
    this.stopPath = new google.maps.Polyline({
      path: busStopCoordinates,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    this.stopPath.setMap(this.map);
  }

  openOptions(position) {
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    let infoWindow;
    const content = document.createElement("div");
    content.className = "info-window-wrapper";
    const stopNameContainer1 = document.createElement("div");
    const index1 = document.createElement("h3");
    index1.className = "firstHeading";
    index1.innerHTML = "Add New Stop";
    stopNameContainer1.appendChild(index1);
    index1.addEventListener("click", () => {
      this.addNewStop(this);
      infoWindow.close();
    });
    const input = document.createElement("input");
    input.className = "hide";
    input.placeholder = "Move Stop Index";
    input.setAttribute("id", "name-input");

    const editButtonContainer = document.createElement("div");
    editButtonContainer.className = "hide edit-button-container";
    const cancelButton = document.createElement("span");
    const cancelIcon = document.createElement("img");
    cancelIcon.src = "../../../../../assets/images/close.png";
    cancelIcon.className = "delete-icon-1";
    cancelButton.appendChild(cancelIcon);
    cancelButton.onclick = () => {
      this.infoWindow.close();
    };
    const saveButton = document.createElement("span");
    const saveIcon = document.createElement("img");
    saveIcon.src = "../../../../../assets/images/check-solid.png";
    saveIcon.className = "save-icon";
    saveButton.appendChild(saveIcon);
    saveButton.onclick = () => {
      const stopEvent = {
        index: +input.value - 1,
        position: position,
      };
      this.moveStop(stopEvent);
      if (this.infoWindow) {
        this.infoWindow.close();
      }
      this.setPolyLine();
    };

    editButtonContainer.appendChild(cancelButton);
    editButtonContainer.appendChild(saveButton);

    const stopNameContainer2 = document.createElement("div");
    stopNameContainer2.className = "max-width";
    const index2 = document.createElement("h3");
    index2.className = "firstHeading";
    index2.innerHTML = "Move Stop";
    index2.addEventListener("click", () => {
      index1.className = "hide";
      index2.className = "hide";
      input.className = "input-box";
      editButtonContainer.className = "show edit-button-container";
    });
    stopNameContainer2.appendChild(index2);
    stopNameContainer2.appendChild(input);
    stopNameContainer2.appendChild(editButtonContainer);
    stopNameContainer1.appendChild(stopNameContainer2);
    infoWindow = new google.maps.InfoWindow({
      content: stopNameContainer1,
      position: { lat: position.lat, lng: position.lng },
    });
    return infoWindow;
  }

  moveStop(stopData) {
    const index = stopData.index;
    const opt = {
      position: stopData.position,
    };
    this.setMarkerOption(index, opt);
    this.stops[index].lat = stopData.position.lat;
    this.stops[index].long = stopData.position.lng;
    this.circleArray[index].setCenter({
      lat: stopData.position.lat,
      lng: stopData.position.lng,
    });
    this.stops = this.helpers.calculateDistanceBetweenStops(
      this.totalStopList,
      this.stops,
      this.radius
    );
    console.log("Stops2", this.stops);

    this.stopList = [...this.stops];
  }

  setMarkers() {
    this.stopList.forEach((item, i) => {
      let marker;
      let position = new google.maps.LatLng(item.lat, item.long);

      marker = new google.maps.Marker({
        position: position,
        label: {
          text: (i + 1).toString(),
          color: "#ffffff",
          fontSize: "16px",
        },
        draggable: true,
        icon: {
          url: "assets/images/black-map-pin.png",
          labelOrigin: { x: 15, y: 18 },
        },
        title: item["stopName"],
      });

      this.markersArray.push(marker);
      marker.setMap(this.map);
      let title;
      let index;
      marker.addListener("dragend", (event) => {
        title = marker.getTitle();
        index = _.findIndex(this.stops, { stopName: title });
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        let isPresent = this.checkDistanceOfMarkers(lat, lng);
        if (isPresent && isPresent != "No") {
          this.removeMarkers();
          return;
        }
        this.stops[index].lat = lat;
        this.stops[index].long = lng;
        // if (this.stops[index].id) {
        //   this.stops[index].id = null;
        // }
        this.circleArray[index].setCenter({ lat: lat, lng: lng });
        this.stops = this.helpers.calculateDistanceBetweenStops(
          this.totalStopList,
          this.stops,
          this.radius
        );
        console.log("Stops", this.stops);

        if (this.searchStopForm.controls.searchStop.value.length) {
          this.searchStopForm.controls.searchStop.setValue("");
        }
        this.stopList = [...this.stops];
        this.setPolyLine();
        title = marker.getTitle();
        index = _.findIndex(this.stops, { stopName: title });
        this.stopClicked(index + 1);
        if (this.selectedStop === index + 1) {
          this.infoWindow = this.setInfoWindow(this.stops[index], index, true);
          this.infoWindow.open(this.map, marker);
        } else {
          if (this.infoWindow) {
            this.infoWindow.close();
          }
        }
      });

      marker.addListener("click", () => {
        this.searchStopForm.controls.searchStop.setValue("");
        this.stopList = [...this.stops];
        title = marker.getTitle();
        index = _.findIndex(this.stops, { stopName: title });
        this.stopClicked(index + 1);
        if (this.selectedStop === index + 1) {
          this.infoWindow = this.setInfoWindow(this.stops[index], index, true);
          this.infoWindow.open(this.map, marker);
        } else {
          if (this.infoWindow) {
            this.infoWindow.close();
          }
        }
      });
    });
  }

  setMarkersNew() {
    {
      this.temp_data.forEach((item, i) => {
        let marker;
        let position = new google.maps.LatLng(item["lat"], item["lon"]);

        marker = new google.maps.Marker({
          position: position,
          // label: {
          //   text: (i + 1).toString(),
          //   color: "#ffffff",
          //   fontSize: "16px",
          // },
          icon: new google.maps.MarkerImage(
            "assets/images/yellow-marker.png",
            null /* size is determined at runtime */,
            null /* origin is 0,0 */,
            null /* anchor is bottom center of the scaled image */,
            // new google.maps.Size(30, 30),
            new google.maps.Size(42, 68)
          ),
          // icon: "assets/images/dark-green1.png",

          title: item["name"],
        });
        // const allMarker = {
        //   lat: item["lat"],
        //   long: item["lon"],
        //   name: item.stopName,
        //   markerObj: marker,
        // };
        // this.allStopsMarker.push(allMarker);
        marker.setMap(this.map);
        marker.addListener("click", () => {
          const position = marker.getPosition();
          const lat = position.lat();
          const long = position.lng();
          const index = _.findIndex(this.totalStopList, {
            lat: lat,
            long: long,
          });
          this.infoWindow = this.setInfoWindow(
            this.totalStopList[index],
            index,
            false
          );
          this.infoWindow.open(this.map, marker);
        });
      });
    }
  }

  checkDistanceOfMarkers(lat, lng) {
    return this.helpers.checkDistanceAmongMarkers(lat, lng, this.totalStopList);
  }

  editStop(stop?) {
    this.isEdit = !this.isEdit;
    this.prefilledTranslatedList["data"] = stop?.ls;
    this.prefilledTranslatedList["from"] = "routes";
  }

  removeStop(seqNo) {
    this.searchStopForm.controls.searchStop.setValue("");
    const index = _.findIndex(this.stops, (item) => {
      return item.seqNo === seqNo;
    });
    this.stops.splice(index, 1);
    this.markersArray[index].setMap(null);
    this.circleArray[index].setMap(null);
    this.markersArray.splice(index, 1);
    this.circleArray.splice(index, 1);
    for (let i = index; i < this.stops.length; i++) {
      this.stops[i]["seqNo"] = this.stops[i]["seqNo"] - 1;
    }

    this.setLabelOfMarkers();
    this.stopList = [...this.stops];
    this.selectedStop = null;
    this.newRouteDetails.stopList = [...this.stopList];
    this.routeService.setNewRouteDetails(this.newRouteDetails);
    this.setPolyLine();
  }

  removeStopsMulti(seqNo) {
    this.searchStopForm.controls.searchStop.setValue("");
    const index = _.findIndex(this.stops, (item) => {
      return item.seqNo === seqNo;
    });
    this.stops.splice(index, 1);
    this.markersArray[index].setMap(null);
    this.circleArray[index].setMap(null);
    this.markersArray.splice(index, 1);
    this.circleArray.splice(index, 1);
    this.setLabelOfMarkers();
    this.stopList = [...this.stops];
  }

  onChange(stop) {
    if (stop.checked) {
      this.deleteStopArray.push(stop.source.value);
    } else {
      const i = this.deleteStopArray.indexOf(stop.source.value);
      this.deleteStopArray.splice(i, 1);
    }
  }
  isChecked(seqNo) {
    const i = this.deleteStopArray.indexOf(seqNo);
    return i === -1 ? false : true;
  }

  deleteSelectedStops() {
    if (this.deleteStopArray.length) {
      for (let i = 0; i < this.deleteStopArray.length; i++) {
        this.removeStopsMulti(this.deleteStopArray[i]);
      }
      let index = Math.min(...this.deleteStopArray);
      for (let i = index - 1; i < this.stops.length; i++) {
        this.stops[i]["seqNo"] = i + 1;
      }
      this.selectedStop = null;
      this.newRouteDetails.stopList = [...this.stopList];
      this.routeService.setNewRouteDetails(this.newRouteDetails);
      this.setPolyLine();
    }
    this.deleteStopArray = [];
  }

  editStopName(seqNo, value, lat: any, long: any) {
    this.finalTranslationValues = this.helpers.getTranslationData();
    console.log("form data==>", this.finalTranslationValues);
    let updatedTranslationObj = {};
    // fromGroupArray[dataIndex].controls['id'].value
    if (this.finalTranslationValues && this.finalTranslationValues.length) {
      for (let i = 0; i < this.finalTranslationValues.length; i++) {
        let dataObj = {};
        let key = this.finalTranslationValues[i].controls["languageId"].value;
        dataObj["name"] =
          this.finalTranslationValues[i].controls["translatedText"].value;
        updatedTranslationObj[key] = dataObj;
      }
    }
    console.log(updatedTranslationObj, this.languagesList);
    this.searchStopForm.controls.searchStop.setValue("");
    const index = this.stops.findIndex((item) => {
      return item["seqNo"] === seqNo;
    });
    let tempStopList = [...this.stops];
    tempStopList[index]["stopName"] = value;
    tempStopList[index]["lat"] = +lat;
    tempStopList[index]["long"] = +long;
    tempStopList[index]["ls"] = updatedTranslationObj;
    this.stops = [...tempStopList];
    console.log("Stops-final", this.stops);

    this.isEdit = false;
    if (document.getElementById("stopName")) {
      document.getElementById("stopName").innerHTML = value;
    }
    const option = {
      title: value,
    };
    this.setMarkerOption(index, option);
    this.newRouteDetails.stopList = [...this.stops];
    this.stopList = [...this.stops];
    this.routeService.setNewRouteDetails(this.newRouteDetails);
  }

  cancelEditing() {
    this.isEdit = false;
  }

  setCircle() {
    for (const stop of this.stopList) {
      let map = this.map;
      const cityCircle = new google.maps.Circle({
        strokeColor: "darkgrey",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "darkgrey",
        fillOpacity: 0.35,
        map,
        center: { lat: stop.lat, lng: stop.long },
        radius: this.radius,
      });
      this.circleArray.push(cityCircle);
      cityCircle.setMap(this.map);
    }
  }
  setInfoWindow(stopDetail, index, showDeleteIcon) {
    let infoWindow;
    const content = document.createElement("div");
    content.className = "info-window-wrapper width-180";

    const stopNameContainer = document.createElement("div");
    stopNameContainer.className = "position";
    const stopName = document.createElement("span");
    stopName.innerHTML = stopDetail["stopName"];
    stopName.setAttribute("id", "stopName");
    stopName.className = "stop-name";
    const input = document.createElement("input");
    input.value = stopDetail["stopName"];
    input.className = "hide";
    input.setAttribute("id", "name-input");

    const latLongContainerWrapper = document.createElement("div");
    latLongContainerWrapper.className = "position font-adj";

    const latLongContainer = document.createElement("span");
    latLongContainer.innerHTML = `Lat: ${this.getUptofourDigit(
      stopDetail["lat"]
    )}`;
    latLongContainer.setAttribute("id", "lat");
    latLongContainer.className = "stop-name";
    const input1 = document.createElement("input");
    input1.value = this.getUptofourDigit(stopDetail["lat"]);
    input1.className = "hide";
    input1.setAttribute("id", "lat");

    const latLongContainer2 = document.createElement("span");
    latLongContainer2.innerHTML = `Lng: ${this.getUptofourDigit(
      stopDetail["long"]
    )}`;
    latLongContainer2.setAttribute("id", "Lng");
    latLongContainer2.className = "stop-name";
    const input2 = document.createElement("input");
    input2.value = this.getUptofourDigit(stopDetail["long"]);
    input2.className = "hide";
    input2.setAttribute("id", "Lng");

    latLongContainerWrapper.appendChild(latLongContainer);
    latLongContainerWrapper.appendChild(latLongContainer2);
    latLongContainerWrapper.appendChild(input1);
    latLongContainerWrapper.appendChild(input2);

    const closeIcon = document.createElement("img");
    closeIcon.src = "../../../../../assets/images/close.png";
    closeIcon.className = "cancel-icon";
    closeIcon.addEventListener("click", (event) => {
      this.infoWindow.close();
    });
    stopNameContainer.appendChild(stopName);
    stopNameContainer.appendChild(input);
    stopNameContainer.appendChild(latLongContainerWrapper);
    stopNameContainer.appendChild(closeIcon);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "pd-13";
    const actionButtonContainer = document.createElement("div");
    actionButtonContainer.className = "position";
    const deleteButton = document.createElement("span");
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "../../../../../assets/images/trash-solid.png";
    deleteIcon.className = "delete-icon";
    deleteButton.appendChild(deleteIcon);
    deleteButton.onclick = () => {
      this.removeStop(stopDetail.seqNo);
      this.setPolyLine();
    };

    actionButtonContainer.appendChild(deleteButton);

    const mergeButton = document.createElement("span");
    const mergeIcon = document.createElement("img");
    mergeIcon.src = "assets/images/merge2.png";
    mergeIcon.className = "merge-icon";
    mergeButton.appendChild(mergeIcon);
    mergeButton.style.display = "none";
    mergeButton.onclick = () => {
      this.mergeStop(stopDetail);
    };

    actionButtonContainer.appendChild(mergeButton);

    const editButton = document.createElement("span");
    const editIcon = document.createElement("img");
    editIcon.src = "../../../../../assets/images/pencil-alt-solid.png";
    editIcon.className = "edit-icon";
    editButton.appendChild(editIcon);
    editButton.onclick = () => {
      input.className = "input-box";
      input1.className = "input-box";
      input2.className = "input-box";
      stopName.className = "hide";
      latLongContainer.className = "hide";
      latLongContainer2.className = "hide";
      editButtonContainer.className = "edit-button-container";
      actionButtonContainer.className = "hide";
      closeIcon.className = "hide";
    };

    actionButtonContainer.appendChild(editButton);

    const editButtonContainer = document.createElement("div");
    editButtonContainer.className = "hide edit-button-container";

    const cancelButton = document.createElement("span");
    const cancelIcon = document.createElement("img");
    cancelIcon.src = "../../../../../assets/images/close.png";
    cancelIcon.className = "delete-icon";
    cancelButton.appendChild(cancelIcon);
    cancelButton.onclick = () => {
      input.className = "hide";
      input1.className = "hide";
      input2.className = "hide";
      stopName.className = "show-block stop-name";
      latLongContainer.className = "show-block stop-name";
      latLongContainer2.className = "show-block stop-name";
      actionButtonContainer.className = "show";
      editButtonContainer.className = "hide edit-button-container";
      closeIcon.className = "show cancel-icon";
    };

    const saveButton = document.createElement("span");
    const saveIcon = document.createElement("img");
    saveIcon.src = "../../../../../assets/images/check-solid.png";
    saveIcon.className = "save-icon";
    saveButton.appendChild(saveIcon);
    saveButton.onclick = () => {
      let position = {
        lat: +input1.value,
        lng: +input2.value,
      };
      input.className = "hide";
      input1.className = "hide";
      input2.className = "hide";
      stopName.className = "show";
      latLongContainer.className = "show-block stop-name";
      latLongContainer2.className = "show-block stop-name";
      const stopEvent = {
        index: stopDetail.seqNo - 1,
        position: position,
      };
      stopName.innerHTML = input.value;
      latLongContainer.innerHTML = `Lat: ${input1.value}`;
      latLongContainer2.innerHTML = `Lng: ${input2.value}`;
      actionButtonContainer.className = "show";
      editButtonContainer.className = "hide edit-button-container";
      this.moveStop(stopEvent);
      this.editStopName(
        stopDetail.seqNo,
        input.value,
        input1.value,
        input2.value
      );
      this.setPolyLine();
    };

    editButtonContainer.appendChild(cancelButton);
    editButtonContainer.appendChild(saveButton);

    buttonContainer.appendChild(actionButtonContainer);
    buttonContainer.appendChild(editButtonContainer);

    content.appendChild(stopNameContainer);
    content.appendChild(buttonContainer);

    if (!showDeleteIcon) {
      deleteButton.style.display = "none";
      mergeButton.style.display = "inline";
      editIcon.style.display = "none";
    }
    infoWindow = new google.maps.InfoWindow({
      content: content,
      position: { lat: stopDetail.lat, lng: stopDetail.long },
    });

    if (this.infoWindow) {
      this.infoWindow.close();
    }
    return infoWindow;
  }

  setAllStopMarkers() {
    this.totalStopList.forEach((item) => {
      let marker;
      let position = new google.maps.LatLng(item["lat"], item["long"]);
      marker = new google.maps.Marker({
        position: position,
        icon: "assets/images/circlurar-marker.png",
        title: item["stopName"],
      });
      const allMarker = {
        lat: item["lat"],
        long: item["long"],
        name: item.stopName,
        markerObj: marker,
      };
      this.allStopsMarker.push(allMarker);
      marker.setMap(this.map);
      marker.addListener("click", () => {
        const position = marker.getPosition();
        const lat = position.lat();
        const long = position.lng();
        const index = _.findIndex(this.totalStopList, { lat: lat, long: long });
        this.infoWindow = this.setInfoWindow(
          this.totalStopList[index],
          index,
          false
        );
        this.infoWindow.open(this.map, marker);
      });
    });
  }

  setNearByStopsLabels(indexOfStop) {
    for (let i = 0; i < this.allStopsMarker.length; i++) {
      if (this.allStopsMarker[i].markerObj) {
        this.allStopsMarker[i].markerObj.setLabel(null);
      }
    }
    const nearbyStops = this.stopList[indexOfStop].nearbyStops;
    if (nearbyStops) {
      nearbyStops.forEach((item) => {
        const index = _.findIndex(this.allStopsMarker, {
          lat: item.lat,
          long: item.long,
        });
        if (index > -1 && this.allStopsMarker[index].markerObj) {
          this.allStopsMarker[index].markerObj.setLabel(item.stopName);
        }
      });
    }
  }

  setLabelOfMarkers() {
    this.markersArray.forEach((marker, index) => {
      marker.setLabel({
        text: (index + 1).toString(),
        color: "#ffffff",
        fontSize: "16px",
      });
    });
  }

  searchStop(searchText) {
    if (searchText) {
      this.stopList = _.filter(this.stops, (item) => {
        return item.stopName.toLowerCase().includes(searchText);
      });
    } else {
      this.stopList = [...this.stops];
    }
  }

  mergeStop(stop) {
    console.log("stop detail======", stop);
    this.searchStopForm.controls.searchStop.setValue("");
    this.stopList = [...this.stops];
    if (this.isStopSelected) {
      var stopDetail = this.stopList[this.selectedStop - 1];
      this.infoWindow.close();
      const dialogRef = this.dialog.open(ConfirmationDialogueComponent, {
        data: {
          message: `Are you sure you want to merge ${stopDetail.stopName} with ${stop.stopName}?`,
          successButton: "Yes",
          cancelButton: "No",
        },
        panelClass: "custom-dialog-container",
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log("result after closed========", result);
        if (result === "yes") {
          var routeDetails = this.routeService.getNewRouteDetails();
          stopDetail.lat = stop.lat;
          stopDetail.long = stop.long;
          stopDetail.stopName = stop.stopName;
          stopDetail.id = stop.id;
          this.stops[this.selectedStop - 1] = { ...stopDetail };
          this.stopList = [...this.stops];
          routeDetails["stopList"] = [...this.stopList];
          var option = {
            label: this.selectedStop.toString(),
            icon: "assets/images/yellow-map-pin.png",
            position: { lat: stop.lat, lng: stop.long },
            title: stop.stopName,
          };
          if (this.infoWindow) this.infoWindow.close();
          this.setMarkerOption(this.selectedStop - 1, option);
          this.setCircleOption(this.selectedStop - 1, option.position);
          this.routeService.setNewRouteDetails(routeDetails);
          this.stopList = this.helpers.calculateDistanceBetweenStops(
            this.totalStopList,
            this.stopList,
            this.radius
          );
        }
      });
    } else {
      this.helpers.showSnackBar(
        "No stop is selected. Please select any stop before merge"
      );
    }
  }

  setMarkerOption(index, option) {
    const opt = {};
    if (option.label) {
      opt["label"] = {
        text: option.label,
        color: "#ffffff",
        fontSize: "16px",
      };
    }

    if (option.icon) {
      opt["icon"] = {
        url: option.icon,
        labelOrigin: { x: 15, y: 18 },
      };
    }
    if (option.title) {
      opt["title"] = option.title;
    }
    if (option.position) {
      opt["position"] = option.position;
    }
    let stop = this.stopList[index];
    let positionCenter = {
      lat: stop.lat,
      lng: stop.long,
    };
    if (this.map) {
      this.map.setCenter(positionCenter);
      this.markersArray[index].setOptions(opt);
    }
  }

  setCircleOption(index, position) {
    this.circleArray[index].setOptions({
      center: position,
    });
  }

  setMapBottomMenu() {
    let scope = this;
    const menuItems = [
      {
        icon: "assets/images/addElement.png",
        title: "Add Stop",
        clicked: this.addNewStop,
      },
      {
        icon: "assets/images/radius.png",
        title: "Radius",
        clicked: this.radiusButtonClicked,
      },
      {
        icon: "assets/images/refresh.png",
        title: "Get Stops",
        clicked: this.getCityStopList,
      },
    ];
    const bottomMenu = document.createElement("div");
    const menuElement = document.createElement("div");
    menuElement.className = "bottom-menu-item";
    bottomMenu.appendChild(menuElement);
    bottomMenu.style.display = "flex";
    menuItems.forEach((item) => {
      const menuItem = document.createElement("div");
      menuItem.className = "menu-item";
      const menuIcon = document.createElement("div");
      menuIcon.className = "menu-icon";
      menuIcon.innerHTML = `<img class='iconStyle' src= ${item.icon} />`;

      const menuTitle = document.createElement("div");
      menuTitle.innerText = item.title;
      menuTitle.className = "menu-item-title";
      menuItem.appendChild(menuIcon);
      menuItem.appendChild(menuTitle);
      menuElement.appendChild(menuItem);
      if (item.clicked) {
        menuItem.addEventListener("click", (value) => {
          item.clicked(scope);
        });
      }
    });
    const navigator = document.createElement("div");
    navigator.className = "navigator-button";
    const navigatorIcon = document.createElement("img");
    navigatorIcon.src = "assets/images/angle-double-right-solid.png";
    navigatorIcon.className = "iconStyle navigator-icon";
    navigator.appendChild(navigatorIcon);
    navigator.addEventListener("click", () => {
      this.isCollapsed = !this.isCollapsed;
      if (this.isCollapsed) {
        menuElement.style.display = "none";
        navigatorIcon.src = "assets/images/angle-double-left-solid.png";
        this.isRadiusClicked = false;
      } else {
        menuElement.style.display = "flex";
        navigatorIcon.src = "assets/images/angle-double-right-solid.png";
      }
    });
    bottomMenu.appendChild(navigator);
    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
      bottomMenu
    );
    this.map.setOptions({
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    });
  }

  formatLabel(value: number) {
    return value + "m";
  }

  radiusButtonClicked(scope) {
    scope.isRadiusClicked = !scope.isRadiusClicked;
  }
  radiusChanged(event) {
    this.radius = event.value;
    this.setCircleRadius();
    this.stopList = this.helpers.calculateDistanceBetweenStops(
      this.totalStopList,
      this.stops,
      event.value
    );
    this.searchStopForm.controls.searchStop.setValue("");
  }

  setCircleRadius() {
    this.circleArray.forEach((circle) => {
      circle.setRadius(this.radius);
    });
  }

  addNewStop(scope, location?) {
    let marker;
    let SearchstopName;
    const latLng = scope.map.getCenter();
    let lat = latLng.lat();
    let long = latLng.lng();
    let isPresent = scope.checkDistanceOfMarkers(lat, long);
    if (isPresent && isPresent != "No") {
      scope.removeMarkers();
      return;
    }
    if (location) {
      lat = location.latLng.lat();
      long = location.latLng.lng();
      SearchstopName = location.name;
    }
    let position = new google.maps.LatLng(lat, long);
    let map = scope.map;
    marker = new google.maps.Marker({
      position: position,
      draggable: true,
      icon: {
        url: "assets/images/yellow-map-pin.png",
        labelOrigin: { x: 15, y: 18 },
      },
    });
    marker.setMap(scope.map);
    const circle = new google.maps.Circle({
      strokeColor: "darkgrey",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "darkgrey",
      fillOpacity: 0.35,
      map,
      center: { lat: lat, lng: long },
      radius: scope.radius,
    });
    circle.setMap(scope.map);
    marker.addListener("dragend", (event) => {
      circle.setCenter({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      const lat2 = event.latLng.lat();
      const lon2 = event.latLng.lng();
      let isPresent = scope.checkDistanceOfMarkers(lat2, lon2);
      if (isPresent && isPresent != "No") {
        scope.removeMarkers();
        return;
      }
    });
    const infoWindow = scope.setNewRouteInfoWindow(
      lat,
      long,
      marker,
      circle,
      SearchstopName
    );
    infoWindow.open(scope.map, marker);
  }

  setNewRouteInfoWindow(lat, long, marker, circle, searchStopName?) {
    let infoWindow;
    const content = document.createElement("div");
    content.className = "info-window-wrapper";

    const stopNameContainer = document.createElement("div");
    stopNameContainer.className = "width-180";
    const index = document.createElement("input");
    index.setAttribute("id", "index");
    index.setAttribute("autoComplete", "off");
    index.className = "input-box";
    index.placeholder = "Index";
    stopNameContainer.appendChild(index);

    const stopName = document.createElement("input");
    stopName.setAttribute("id", "stopName");
    stopName.setAttribute("autoComplete", "off");
    stopName.className = "input-box";
    stopName.placeholder = "Stop Name";
    if (searchStopName) {
      stopName.value = searchStopName;
    }
    stopNameContainer.appendChild(stopName);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "pd-11";
    const editButtonContainer = document.createElement("div");
    editButtonContainer.className = "edit-button-container";

    const cancelButton = document.createElement("span");
    const cancelIcon = document.createElement("img");
    cancelIcon.src = "../../../../../assets/images/close.png";
    cancelIcon.className = "delete-icon";
    cancelButton.appendChild(cancelIcon);
    cancelButton.addEventListener("click", () => {
      infoWindow.close();
      marker.setMap(null);
      circle.setMap(null);
    });

    const saveButton = document.createElement("span");
    const saveIcon = document.createElement("img");
    saveIcon.src = "../../../../../assets/images/check-solid.png";
    saveButton.appendChild(saveIcon);
    saveButton.addEventListener("click", () => {
      let stopIndex = parseInt(index.value);
      console.log("save button method called");

      if (stopName.value && parseInt(index.value)) {
        const latLng = marker.getPosition();
        const stopDetail = {
          lat: latLng.lat(),
          long: latLng.lng(),
          stopName: stopName.value,
          seqNo: stopIndex,
        };
        let isPresent = this.checkDistanceOfMarkers(
          stopDetail.lat,
          stopDetail.long
        );
        if (isPresent && isPresent != "No") {
          this.removeMarkers();
          return;
        }
        marker.setOptions({
          title: stopName.value,
        });
        marker.addListener("click", () => {
          const title = marker.getTitle();
          const index = _.findIndex(this.stops, { stopName: title });
          // this.selectedStop = index + 1;
          this.stopClicked(index + 1);
          this.infoWindow = this.setInfoWindow(this.stops[index], index, true);
          this.infoWindow.open(this.map, marker);
        });

        marker.addListener("dragend", (event) => {
          this.searchStopForm.controls.searchStop.setValue("");
          const title = marker.getTitle();
          const index = _.findIndex(this.stops, { stopName: title });
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          let isPresent = this.checkDistanceOfMarkers(
            event.latLng.lat(),
            event.latLng.lng()
          );
          if (isPresent && isPresent != "No") {
            this.removeMarkers();
            return;
          }
          this.stops[index].lat = lat;
          this.stops[index].long = lng;
          circle.setCenter({ lat: lat, lng: lng });
          this.stops = this.helpers.calculateDistanceBetweenStops(
            this.totalStopList,
            this.stops,
            this.radius
          );
          console.log("Stops3", this.stops);
          if (this.searchStopForm.controls.searchStop.value.length) {
            this.searchStopForm.controls.searchStop.setValue("");
          }
          this.stopList = [...this.stops];
        });
        if (this.searchStopForm.controls.searchStop.value.length) {
          this.searchStopForm.controls.searchStop.setValue("");
        }
        this.stops.splice(stopIndex - 1, 0, stopDetail);
        this.stopList = [...this.stops];
        this.markersArray.splice(stopIndex - 1, 0, marker);
        this.circleArray.splice(stopIndex - 1, 0, circle);
        if (this.stopList.length < stopIndex) {
          stopIndex = this.stopList.length - 1;
        }
        this.stopClicked(stopIndex);
        this.infoWindow = this.setInfoWindow(
          this.stops[stopIndex - 1],
          stopIndex - 1,
          true
        );
        this.infoWindow.open(this.map, this.markersArray[stopIndex - 1]);
        this.setLabelOfMarkers();
        for (let i = stopIndex; i < this.stops.length; i++) {
          this.stops[i]["seqNo"] = i + 1;
        }
        this.newRouteDetails.stopList = [...this.stops];
        this.routeService.setNewRouteDetails(this.newRouteDetails);
        this.stops = this.helpers.calculateDistanceBetweenStops(
          this.totalStopList,
          this.stops,
          this.radius
        );
        console.log("Stops4", this.stops);
        this.stopList = [...this.stops];
        infoWindow.close(this.map, marker);
      }
      this.setPolyLine();
    });

    editButtonContainer.appendChild(cancelButton);
    editButtonContainer.appendChild(saveButton);

    buttonContainer.appendChild(editButtonContainer);
    content.appendChild(stopNameContainer);
    content.appendChild(buttonContainer);
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    if (searchStopName) {
      // content.getElementById('stopName').innerHTML = searchStopName;
    }
    infoWindow = new google.maps.InfoWindow({
      content: content,
      position: { lat: lat, lng: long },
    });

    return infoWindow;
  }
  submitRoute() {
    this.isShowLoader = true;
    this.routeService
      .addNewRoute(
        this.timeTable,
        this.categories,
        this.fareFiles,
        this.newRouteDetails.routeId,
        this.distanceArray
      )
      .then((res) => {
        this.isShowLoader = false;
        if (res.trim().toLowerCase() === "success.") {
          if (this.newRouteDetails.routeId) {
            this.helpers.showSnackBar("Route edited Successfully");
          } else {
            this.helpers.showSnackBar("Route created Successfully");
            // const dialogRef = this.dialog.open(ConfirmationDialogueComponent,
            //   {
            //     data: {
            //       message: 'Are You Want To Create a Reverse Route?',
            //       successButton:'Yes',
            //       cancelButton:'No'
            //     },
            //     panelClass:'custom-dialog-container'
            //   })
            //   dialogRef.afterClosed().subscribe(res => {
            //     if (res === "yes") {
            //       this.stopList.reverse();
            //       this.stops.reverse();
            //       for(let i=0; i< this.stopList.length; i++){
            //         this.stopList[i]['seqNo'] = i+1;
            //       }
            //       for(let i=0; i< this.stops.length; i++){
            //         this.stops[i]['seqNo'] = i+1;
            //       }
            //     this.removeMarkers();
            //     this.setMarkers();
            //     this.newRouteDetails['stopList'] = [...this.stopList];
            //     // localStorage.setItem('routeDetail',JSON.stringify(this.newRouteDetails));
            //     this.routeService.setNewRouteDetails(this.newRouteDetails);
            //   } else {
            //     localStorage.removeItem('routeDetail');
            //     this.router.navigateByUrl(`/home/routeMaster/routes/${this.backParam}`);
            //   }
            // })
          }
          localStorage.removeItem("routeDetail");
          this.router.navigateByUrl(
            `/home/routeMaster/routes/${this.backParam}`
          );
        }
      })
      .catch((err) => {
        this.isShowLoader = false;
        if (err.error) {
          this.helpers.showSnackBar("Error: " + err.error);
        } else {
          this.helpers.showSnackBar("Error: " + err.message);
        }
      });
  }

  removeMarkers() {
    if (this.markersArray) {
      for (let i = 0; i < this.markersArray.length; i++) {
        this.markersArray[i].setMap(null);
      }
      this.markersArray.length = 0;
    }
    this.setMarkers();
    // ajay add this.setMarker(this.newData);
  }

  goBack() {
    const dialogRef = this.dialog.open(ConfirmationDialogueComponent, {
      data: {
        message:
          "All the changes will be discarded. So are you sure you want to go back?",
        successButton: "Yes",
        cancelButton: "No",
      },
      panelClass: "custom-dialog-container",
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res === "yes") {
        localStorage.removeItem("routeDetail");
        localStorage.removeItem("matrixDetails");
        this.router.navigateByUrl(`/home/routeMaster/routes/${this.backParam}`);
      }
    });
  }

  editDetails() {
    this.newRouteDetails = this.routeService.getNewRouteDetails();
    let mode = "details";
    if (!this.newRouteDetails.fileName) {
      mode = "edit";
    }
    const dialogRef = this.dialog.open(AddRouteDetailsComponent, {
      maxHeight: "90vh",
      data: {
        mode: mode,
        details: this.newRouteDetails,
        back: this.backParam,
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.ngOnInit();
      } else {
        this.newRouteDetails = this.routeService.getNewRouteDetails();
      }
    });
  }

  getCityStopList(scope) {
    scope.isShowLoader = true;
    scope.routeService.getTotalStopList().then(
      (res) => {
        scope.isShowLoader = false;
        const totalStopIds = Object.keys(res);
        console.log("Stops", res);
        scope.totalStopList = totalStopIds.map((item, index) => {
          return {
            stopName: res[item].name,
            lat: res[item].lat,
            long: res[item].lon,
            ls: res[item].ls,
            id: item,
          };
        });

        console.log(scope.totalStopList);
        // console.log("ajay res", res);

        const hasAlreadySuggestedStops = scope.stopList.some((item) => {
          return item.hasOwnProperty("nearbyStops");
        });
        if (!hasAlreadySuggestedStops) {
          scope.stopList = scope.helpers.calculateDistanceBetweenStops(
            scope.totalStopList,
            scope.stopList,
            scope.radius
          );
          console.log("route details========", scope.stopList);
        }
        console.log("route details2========", scope.stopList);
        this.newRouteDetails = this.routeService.getNewRouteDetails();
        this.stopList = [...this.newRouteDetails.stopList];
        this.stops = [...this.stopList];
        scope.setAllStopMarkers();
      },
      (err) => {
        this.isShowLoader = false;
      }
    );
  }

  getDesiredLanguage(key, stop) {
    if (
      key &&
      stop &&
      stop["ls"] &&
      stop["ls"][key] &&
      stop["ls"][key]["name"]
    ) {
      return stop["ls"][key]["name"];
    }
  }

  isAvailableTranslation(key, stop) {
    if (
      key &&
      stop &&
      stop["ls"] &&
      stop["ls"][key] &&
      stop["ls"][key]["name"]
    ) {
      return true;
    } else {
      return false;
    }
  }

  isAvailableTranslationLs(stop) {
    if (stop && stop["ls"]) {
      return true;
    } else {
      return false;
    }
  }

  getStopTranslatedName(stop) {
    return stop["ls"][Object.keys(stop["ls"])[0]]["name"];
  }

  getKeyForTranslation(stop, key) {
    let translatedValuesObj = Object.keys(langCodes);
    let keys = Object.keys(stop["ls"]);
    if (keys.includes(key)) {
      if (translatedValuesObj.includes(key)) {
        return langCodes[key];
      } else {
        return key;
      }
    }
  }

  swapStops(event) {
    let oldtarget = this.stopList[event.previousIndex];
    this.stopList[event.previousIndex] = this.stopList[event.currentIndex];
    this.stopList[event.currentIndex] = oldtarget;
    this.stopList[event.previousIndex]["seqNo"] = event.previousIndex + 1;
    this.stopList[event.currentIndex]["seqNo"] = event.currentIndex + 1;
    const previousIndex = _.findIndex(this.stopList, (item) => {
      return this.stopList[event.previousIndex]["seqNo"] === item.seqNo;
    });

    const currentIndex = _.findIndex(this.stopList, (item) => {
      return this.stopList[event.currentIndex]["seqNo"] === item.seqNo;
    });

    this.stops[previousIndex] = this.stopList[event.previousIndex];
    this.stops[currentIndex] = this.stopList[event.currentIndex];

    oldtarget = this.markersArray[event.previousIndex];
    this.markersArray[event.previousIndex] =
      this.markersArray[event.currentIndex];
    this.markersArray[event.currentIndex] = oldtarget;

    oldtarget = this.circleArray[event.previousIndex];
    this.circleArray[event.previousIndex] =
      this.circleArray[event.currentIndex];
    this.circleArray[event.currentIndex] = oldtarget;
    this.stopClicked(this.stopList[event.currentIndex]["seqNo"]);
    let option = {
      title: this.stopList[event.previousIndex].stopName,
      label: (event.previousIndex + 1).toString(),
    };
    this.setMarkerOption(event.previousIndex, option);
    option = {
      title: this.stopList[event.currentIndex].stopName,
      label: (event.currentIndex + 1).toString(),
    };
    this.setMarkerOption(event.currentIndex, option);
    this.newRouteDetails["stopList"] = [...this.stops];
    this.routeService.setNewRouteDetails(this.newRouteDetails);
    this.setPolyLine();
  }

  drop(event: CdkDragDrop<string[]>) {
    const stopEvent = {
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    };
    this.swapStops(stopEvent);
  }

  getUptofourDigit(value) {
    return value.toFixed(4);
  }

  close() {
    this.searchStopForm.controls.searchStop.setValue("");
    this.stopList = [...this.stops];
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
    this.unsubscribeAllControls();
  }
}
