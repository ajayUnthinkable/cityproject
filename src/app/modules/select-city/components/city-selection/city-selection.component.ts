import { Component, OnInit, Inject } from "@angular/core";
import * as _ from "lodash";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";

import { Helpers } from "../../../../../providers/helper";
import { HttpHandlerService } from "../../../../../providers/http-handler.service";
import { CityService } from "../../select-city.service";

@Component({
  selector: "app-city-selection",
  templateUrl: "./city-selection.component.html",
  styleUrls: ["./city-selection.component.scss"],
})
export class CitySelectionComponent implements OnInit {
  agencyResourceId: any;
  modeResourceId: any;
  currentRoute: any;
  isEdit: boolean = false;
  dataLoaded: boolean = false;
  ngOnInit() {
    this.currentRoute = this.router.url;
  }

  dispatchInfo = {
    city: null,
    agency: null,
    mode: null,
  };
  cityId;
  cityName;
  cityResourceId;
  agencyId;
  modeId;

  userInfo;

  constructor(
    public dialogRef: MatDialogRef<CitySelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private cityService: CityService,
    private httpHandler: HttpHandlerService,
    private helper: Helpers
  ) {
    const dispatchInfoSaved = localStorage.getItem("dispatchInfo");
    if (dispatchInfoSaved) {
      this.dispatchInfo = JSON.parse(dispatchInfoSaved);
      this.cityName = this.dispatchInfo.city.name;
      this.agencyId = JSON.stringify(this.dispatchInfo.agency.id);
      this.modeId = JSON.stringify(this.dispatchInfo.mode.id);
      this.isEdit = true;
    }
    this.getApplicationId();
    this.userInfo = this.helper.getUserDetails();
  }

  /**
   * Get App Ids
   */
  getApplicationId() {
    this.cityService.getApplicationId().then(
      (res) => {
        let appId = _.filter(res, (item) => {
          if (item.name.toLowerCase() === "city data tool") {
            return item.id;
          }
        });
        appId = _.map(appId, "id");
        this.getResources(appId[0]);
      },
      (err) => {
        if (err.status === 401) {
          this.httpHandler.getRefreshToken().then((res) => {
            if (res) {
              this.getApplicationId();
            }
          });
        }
      }
    );
  }

  /**
   * Get App resources
   * @param appId
   */
  getResources(appId) {
    this.cityService.getResources(appId).then(
      (res) => {
        localStorage.setItem("resources", JSON.stringify(res));
        let cityId = _.filter(res, (item) => {
          return item.name.toLowerCase() === "city";
        });
        this.cityResourceId = cityId[0].id;
        let agencyId = _.filter(res, (item) => {
          return item.name.toLowerCase() === "agency";
        });
        if (agencyId.length) {
          this.agencyResourceId = agencyId[0].id;
        }
        let modeId = _.filter(res, (item) => {
          return item.name.toLowerCase() === "mode";
        });
        if (modeId.length) this.modeResourceId = modeId[0].id;
        this.getCities();
      },
      (err) => {
        if (err.status === 401) {
          this.httpHandler.getRefreshToken().then((res) => {
            if (res) {
              this.getResources(appId);
            }
          });
        }
      }
    );
  }

  getCities() {
    this.userInfo = this.helper.getUserDetails();
    if (
      this.userInfo.role.toLowerCase() === "admin" ||
      this.userInfo.role.toLowerCase() === "owner"
    )
      this.getAllResources(this.cityResourceId, null);
  }

  getAllResources(resourceType, parentId?) {
    this.dataLoaded = true;
    this.cityService.getAllResources(resourceType, parentId).then(
      (res) => {
        if (!res) {
          return;
        }
        this.dataLoaded = false;
        res = _.map(res, (item) => {
          item["name"] = item["value"];
          delete item["value"];
          return item;
        });
        if (resourceType === this.cityResourceId) {
          this.userInfo["city"] = _.orderBy(res, ["name"]);
          this.helper.setUserDetails(this.userInfo);
        } else if (resourceType === this.agencyResourceId) {
          // this.userInfo['agency'] = _.orderBy(res.metas, ['name']);
          this.userInfo["agency"] = _.orderBy(res, ["name"]);
          if (this.userInfo["agency"] && this.userInfo["agency"].length === 1) {
            this.agencyId = JSON.stringify(this.userInfo["agency"][0].id);
            this.agencySelected();
          }
          if (this.userInfo["agency"] && this.userInfo["agency"].length === 0) {
            this.showMessage("No agency available regarding selected city.");
          }
          // } else if (resourceType === 6) {
        } else if (resourceType === this.modeResourceId) {
          // this.userInfo['mode'] = _.orderBy(res.metas, ['name']);
          this.userInfo["mode"] = _.orderBy(res, ["name"]);
          if (this.userInfo["mode"] && this.userInfo["mode"].length === 1) {
            this.modeId = JSON.stringify(this.userInfo["mode"][0].id);
            this.modeSelected();
          }
          if (this.userInfo["mode"] && this.userInfo["mode"].length === 0) {
            this.showMessage("No mode available regarding selected agency.");
          }
        }
      },
      (err) => {
        if (err.status === 401) {
          this.httpHandler.getRefreshToken().then((res) => {
            if (res) {
              this.getAllResources(resourceType, parentId);
            }
          });
        }
      }
    );
  }

  citySelected() {
    this.userInfo["agency"] = null;
    this.dispatchInfo["agency"] = null;
    // this.userInfo['mode'] = null;
    this.modeId = null;
    this.agencyId = null;

    this.dispatchInfo.city = _.find(this.userInfo["city"], {
      name: this.cityName,
    });
    console.log("user info=============", this.dispatchInfo);
    //    this.cityId = this.dispatchInfo.city.id;
    this.getAllResources(this.agencyResourceId, this.dispatchInfo.city.id);
  }

  saveData() {
    if (
      this.dispatchInfo.city &&
      this.dispatchInfo.agency &&
      this.dispatchInfo.mode
    ) {
      localStorage.setItem("dispatchInfo", JSON.stringify(this.dispatchInfo));
      this.dialogRef.close(this.dispatchInfo);
      if (this.isEdit) {
        this.router.navigateByUrl(this.currentRoute);
      } else {
        this.router.navigateByUrl("/home");
      }
    } else {
      this.showMessage("Please select all fields.");
    }
  }

  showMessage(msg) {
    this.helper.showSnackBar(msg);
  }

  agencySelected() {
    console.log("user info in agency selected=============", this.userInfo);
    this.modeId = null;
    this.userInfo["modeId"] = null;
    this.dispatchInfo.agency = _.find(this.userInfo["agency"], {
      id: parseInt(this.agencyId),
    });
    if (this.userInfo["mode"] && this.userInfo["mode"].length === 1) {
      this.modeId = JSON.stringify(this.userInfo["mode"][0].id);
      this.modeSelected();
    }
    if (this.userInfo["mode"] && this.userInfo["mode"].length === 0) {
      this.showMessage("No mode available regarding selected agency.");
    }

    // this.getAllResources(this.modeResourceId, this.dispatchInfo.agency.id);
  }

  modeSelected() {
    this.dispatchInfo.mode = _.find(this.userInfo["mode"], {
      id: parseInt(this.modeId),
    });
  }
}
