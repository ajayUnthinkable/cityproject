import { Component, OnInit, Inject } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { RouteService } from "../../route-master.service";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";

import * as _ from "lodash";
import { ActivatedRoute, Router } from "@angular/router";
import { csv2json } from "csvjson-csv2json";
import { Helpers } from "src/providers/helper";
import { ConfirmationDialogueComponent } from "src/app/components/confirmation-dialogue/confirmation-dialogue.component";
import { ElementAst } from "@angular/compiler";

@Component({
  selector: "app-add-route-details",
  templateUrl: "./add-route-details.component.html",
  styleUrls: ["./add-route-details.component.scss"],
})
export class AddRouteDetailsComponent implements OnInit {
  url_accuracy;
  addRouteForm: FormGroup;
  cityInfo;
  fileName = "";
  file;
  application = [];
  serviceTag = { spf: [], special_features: [] };
  isShowLoader = false;
  mode;
  details;
  email;
  backLink;
  currentRoute;
  reverseRouteDetails;
  routeList = [];
  disableProceed = true;
  direction = { DOWN: "DN", UP: "UP", DN: "DN" };
  vehicleIdForm = new FormControl();
  tags;
  selectedTags;
  languageList;
  constructor(
    private formBuilder: FormBuilder,
    private routeService: RouteService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddRouteDetailsComponent>,
    private router: Router,
    private heplers: Helpers,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.mode = data.mode;
    this.details = data.details;
    this.backLink = data.back;
    this.reverseRouteDetails = data.rrDetails;
  }

  ngOnInit(): void {
    let str = this.router.url;
    this.currentRoute = str.slice(str.lastIndexOf("/") + 1);
    //  console.log( '=======',this.currentRoute,this.details);

    // let url = `${environment.preProd_url}scheduler_v4/${this.city}/download/fare?routeId=${this.routeId}`;

    this.isShowLoader = true;
    this.routeService
      .getAgency(false)
      .then((res) => {
        this.cityInfo = res;
        this.isShowLoader = false;
        if (
          this.cityInfo &&
          this.cityInfo.applications &&
          this.cityInfo.applications.length
        ) {
          this.cityInfo.applications = this.cityInfo.applications.map(
            (item) => {
              return {
                name: item,
                isChecked: false,
              };
            }
          );
        }
        if (this.cityInfo && this.cityInfo.special_features) {
          this.cityInfo["serviceTags"] = [];
          this.cityInfo.special_features.forEach((item) => {
            let specialFeature = {
              name: item,
              isChecked: false,
            };
            this.cityInfo["serviceTags"].push(specialFeature);
          });
        }
        if (this.cityInfo && this.cityInfo.spf) {
          if (!this.cityInfo["serviceTags"]) {
            this.cityInfo["serviceTags"] = [];
          }
          this.cityInfo.spf.forEach((item) => {
            let spf = {
              name: item,
              isChecked: false,
            };
            this.cityInfo["serviceTags"].push(spf);
          });
        }
        if (this.cityInfo && this.cityInfo.tags) {
          // this.cityInfo['tags'] = {
          //   gid:["intercity","IIT"]
          // }; //[{"gid":["intercity","IIT"],"oid":[1234123]}]; demo tags structure in api
          this.cityInfo["tags"] = this.cityInfo.tags;
          this.tags = this.cityInfo.tags;
        }
        if (
          this.cityInfo &&
          this.cityInfo.localeIds &&
          this.cityInfo.localeIds.length
        ) {
          this.languageList = this.cityInfo.localeIds;
        }
        this.vehicleIdForm = new FormControl();
        this.createForm();
      })
      .catch((err) => {
        this.isShowLoader = false;
        this.heplers.showSnackBar("Error occured: " + err.message);
      });
    const userDetails = JSON.parse(localStorage.getItem("userDetails"));
    this.email = userDetails.email.toLowerCase();
  }

  createForm() {
    this.addRouteForm = this.formBuilder.group({
      routeNumber: ["", Validators.required],
      internalName: [""],
      direction: ["UP", Validators.required],
      unActive: [false, Validators.required],
      serviceTag: [""],
      reverseId: [""],
      file: [""],
    });

    console.log("add route form=====", this.addRouteForm.controls);

    if (this.mode !== "add") {
      this.disableProceed = false;
      this.addRouteForm.controls.routeNumber.setValue(this.details.name);
      this.addRouteForm.controls.internalName.setValue(
        this.details.internalName
      );
      this.addRouteForm.controls.direction.setValue(
        this.direction[this.details.di]
      );
      this.details.unActive &&
        this.addRouteForm.controls.unActive.setValue(this.details.unActive);
      this.details.fileName &&
        this.addRouteForm.controls.file.setValue(this.details.fileName);
      this.fileName = this.details.fileName;
      this.details.rr &&
        this.addRouteForm.controls.reverseId.setValue(this.details.rr);
      if (this.details.o && this.details.o.length) {
        this.cityInfo.applications.forEach((item) => {
          const index = this.details.o.findIndex((app) => {
            return app === item.name;
          });
          if (index !== -1) {
            item.isChecked = true;
            this.application.push(item.name);
          } else item.isChecked = false;
        });
      } else {
        this.cityInfo.applications.forEach((item) => {
          item.isChecked = true;
          this.application.push(item.name);
        });
      }

      if (this.details.tags && this.details.tags.gid.length) {
        this.selectedTags = this.details.tags.gid;
        this.vehicleIdForm.setValue(this.details.tags.gid);
      }

      if (this.details.spf || this.details.sf) {
        if (this.details.spf) {
          this.cityInfo.serviceTags.forEach((item) => {
            const index = this.details.spf.findIndex((sf) => {
              return sf === item.name;
            });
            if (index !== -1) {
              this.serviceTag.spf.push(item.name);
              item.isChecked = true;
            } else {
              item.isChecked = false;
            }
          });
        }
        if (this.details.sf) {
          this.cityInfo.serviceTags.forEach((item) => {
            const index = this.details.sf.findIndex((sf) => {
              return sf === item.name;
            });
            if (index !== -1) {
              this.serviceTag.special_features.push(item.name);
              item.isChecked = true;
            } else {
              item.isChecked = false;
            }
          });
        }
      }
      if (this.details && !this.details.fileName && this.mode != "edit") {
        this.disableProceed = true;
      }
    }
  }

  selectTags(event) {
    this.selectedTags = this.vehicleIdForm.value;
  }

  deselectAllSelection() {
    this.vehicleIdForm.setValue(null);
  }

  selectApplication(app) {
    this.application = [...this.selectItemFromCheckbox(this.application, app)];
  }

  fileSelected(e) {
    this.file = e.target.files[0];
    this.fileName = this.file.name;
    if (
      this.file.type.includes("csv") ||
      this.file.type.includes("vnd.ms-excel") ||
      this.file.type.includes("text")
    ) {
      this.disableProceed = false;
    } else {
      this.disableProceed = true;
      this.heplers.showSnackBar(
        "File format is not valid. Please Select csv file."
      );
    }
  }

  removeFile() {
    this.fileName = "";
    this.file = null;
    console.log("remove file method called", this.fileName);
    this.disableProceed = true;
  }

  cancel() {
    this.dialogRef.close();
  }

  loadReverseIdData(reverseId) {
    this.isShowLoader = true;
    let stopList = [];
    this.routeService
      .getStopDetail(0, reverseId)
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
        if (this.reverseRouteDetails.direction === "UP") {
          this.reverseRouteDetails.direction = "DN";
        }
        if (this.reverseRouteDetails.direction === "DOWN") {
          this.reverseRouteDetails.direction = "UP";
        }
        const routeDetails = {
          name: this.reverseRouteDetails.route_name,
          di: this.direction[this.reverseRouteDetails.direction],
          unActive: this.reverseRouteDetails.unActive,
          rr: res.reverse_routeId,
          o: this.reverseRouteDetails.o,
          stopList: stopList,
          routeId: this.reverseRouteDetails.route_id,
          ag: this.reverseRouteDetails.agency_name,
        };
        if (
          this.reverseRouteDetails.spf &&
          this.reverseRouteDetails.spf.length
        ) {
          routeDetails["spf"] = this.reverseRouteDetails.spf;
        }
        if (this.reverseRouteDetails.sf && this.reverseRouteDetails.sf.length) {
          routeDetails["sf"] = this.reverseRouteDetails.sf;
        }
        if (
          this.reverseRouteDetails.special_features &&
          this.reverseRouteDetails.special_features.length
        ) {
          routeDetails["sf"] = this.reverseRouteDetails.special_features;
        }
        this.details = routeDetails;
        this.createForm();
        this.isShowLoader = false;
        setTimeout(() => {
          this.proceed();
        }, 500);
      })
      .catch((err) => {
        this.isShowLoader = false;
        this.heplers.showSnackBar("Error occured:" + err.message);
      });
  }

  isVerified() {
    let routes = this.routeService.getNewRoutes();
    let filterObj;
    if (routes) {
      filterObj = routes.filter((e) => {
        return (
          e.route_name.toLowerCase() ===
          this.addRouteForm.controls.routeNumber.value.toLowerCase()
        );
      });
    }
    if (filterObj && filterObj.length) {
      if (this.mode === "edit" || this.mode === "details") {
        this.proceed();
      } else {
        const dialogRef = this.dialog.open(ConfirmationDialogueComponent, {
          data: {
            message:
              "Are you sure you want to continue with this route name as the route name already exists?",
            successButton: "PROCEED",
            cancelButton: "CANCEL",
          },
          panelClass: "custom-dialog-container",
        });
        dialogRef.afterClosed().subscribe((res) => {
          if (res === "yes") {
            this.proceed();
          } else {
            dialogRef.close();
          }
        });
      }
    } else {
      this.proceed();
    }
  }

  proceed() {
    let isValid;
    if (this.addRouteForm.valid) {
      this.isShowLoader = true;
      let data = {
        name: this.addRouteForm.controls.routeNumber.value,
        iname: this.addRouteForm.controls.internalName.value,
        di: this.addRouteForm.controls.direction.value,
        unActive: this.addRouteForm.controls.unActive.value,
      };

      if (this.details && this.details.isComplete) {
        data["isComplete"] = this.details.isComplete;
      }

      if (this.details && this.details.stopList) {
        isValid = true;
        data["stopList"] = this.details.stopList;
      }
      if (this.fileName) {
        data["fileName"] = this.fileName;
      }
      if (this.serviceTag["spf"] && this.serviceTag["spf"].length) {
        data["spf"] = this.serviceTag["spf"];
      }

      if (this.selectedTags && this.selectedTags.length) {
        let selectedtag = {
          gid: [...this.selectedTags],
        };
        // let key = Object.keys(this.tags[0]);
        // selectedtag[key[0]] = [...this.selectedTags];
        data["tags"] = selectedtag;
      }

      if (
        this.serviceTag["special_features"] &&
        this.serviceTag["special_features"].length
      ) {
        data["sf"] = this.serviceTag["special_features"];
      }

      if (this.application) {
        data["o"] = this.application;
      }

      if (this.addRouteForm.controls.reverseId.value) {
        data["rr"] = this.addRouteForm.controls.reverseId.value;
      }

      if (this.email) {
        data["uby"] = this.email;
      }

      if (this.details && this.details.routeId) {
        data["routeId"] = this.details.routeId;
      }

      if (this.details && this.details.ag) {
        data["ag"] = this.details.ag;
      }

      if (this.details) {
        data["poly"] = this.details.poly;
      }

      if (this.languageList && this.languageList.length) {
        data["languageList"] = this.languageList;
      }

      if (this.file) {
        let reader: FileReader = new FileReader();
        reader.readAsText(this.file);
        reader.onload = (e) => {
          let csv: string = reader.result as string;
          const json = csv2json(csv, { parseNumbers: true });
          if (json.length) {
            isValid = this.routeService.checkCSVHeaders(Object.keys(json[0]));
          } else {
            isValid = false;
          }
          if (isValid) {
            data["stopList"] = [];
            for (let index = 0; index < json.length; index++) {
              if (
                json[index].LAT &&
                json[index].LONG &&
                json[index]["STOP NAME"] &&
                json[index]["SEQ NO"]
              ) {
                if (
                  Number.isInteger(json[index]["SEQ NO"]) &&
                  json[index]["SEQ NO"] > 0
                ) {
                  data["stopList"][json[index]["SEQ NO"] - 1] = {
                    lat: json[index].LAT,
                    long: json[index].LONG,
                    stopName: json[index]["STOP NAME"],
                    seqNo: json[index]["SEQ NO"],
                  };
                } else {
                  this.heplers.showSnackBar(
                    "Data not valid in the file. Please provide the valid data"
                  );
                  this.disableProceed = true;
                  isValid = false;
                }
              } else {
                this.heplers.showSnackBar(
                  "Data not valid in the file. Please provide the valid data"
                );
                this.disableProceed = true;
                isValid = false;
              }
            }
            const isEmpty = _.some(data["stopList"], _.isEmpty);
            if (isEmpty) {
              this.heplers.showSnackBar(
                "Sequence number not valid in file. Please provide valid data"
              );
              this.disableProceed = true;
              isValid = false;
            }
          } else {
            this.heplers.showSnackBar(
              "Headers not valid. Please provide the valid headers."
            );
            this.disableProceed = true;
            isValid = false;
          }
        };
      }
      setTimeout(() => {
        this.isShowLoader = false;
        if (isValid) {
          this.routeService.setNewRouteDetails(data);
          if (this.mode !== "details") {
            this.router.navigate(["/home/routeMaster/addStop"], {
              queryParams: { back: this.backLink },
            });
            this.dialogRef.close();
          } else {
            if (this.file) {
              this.dialogRef.close(true);
            } else {
              this.dialogRef.close(false);
            }
          }
        }
      }, 1000);
    }
  }

  selectItemFromCheckbox(selectedList, selectedItem) {
    const list = [...selectedList];
    const index = _.findIndex(list, (item) => {
      return item === selectedItem;
    });
    if (index === -1) {
      list.push(selectedItem);
    } else {
      list.splice(index, 1);
    }
    return [...list];
  }

  selectServiceTag(tag) {
    console.log("service tag=====", tag);
    const list = [...this.serviceTag.special_features, ...this.serviceTag.spf];
    const selectedTag = this.selectItemFromCheckbox(list, tag);
    if (this.cityInfo && this.cityInfo.special_features) {
      this.serviceTag["special_features"] = [];
      selectedTag.map((item) => {
        let specialFeatures = _.find(this.cityInfo.special_features, (spf) => {
          return spf === item;
        });
        this.serviceTag["special_features"].push(specialFeatures);
        console.log("specital features", specialFeatures);
      });
      // data['sf'] = [...this.serviceTag['special_features']];
    }
    if (this.cityInfo && this.cityInfo.spf) {
      this.serviceTag["spf"] = [];
      selectedTag.map((item) => {
        let specialFeatures = _.find(this.cityInfo.spf, (spf) => {
          return spf === item;
        });
        this.serviceTag["spf"].push(specialFeatures);
      });
    }
  }
}
