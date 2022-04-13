import { Injectable } from "@angular/core";
import { HttpHandlerService } from "../../../providers/http-handler.service";
import { Router } from "@angular/router";
import { HttpHeaders, HttpClient, HttpParams } from "@angular/common/http";
import { Helpers } from "src/providers/helper";
import { environment } from "src/environments/environment";
import * as _ from "lodash";

@Injectable()
export class RouteService {
  city: any;
  agency: any;
  categoryList = [];
  routeList;
  constructor(
    private httpHandler: HttpHandlerService,
    private helpers: Helpers,
    private router: Router,
    private http: HttpClient
  ) {}

  getRouteList(route) {
    let url;
    let dispatchedInfo = JSON.parse(localStorage.getItem("dispatchInfo"));
    this.city = dispatchedInfo["city"]["name"].toLowerCase();
    this.agency = dispatchedInfo["agency"]["name"].trim();
    if (route === "liveRoutes") {
      url = `${environment.dataToolUrl}${this.city}/${this.agency}/BUS/live/routes`;
    } else if (route === "reviewRoutes") {
      url = `${environment.dataToolUrl}${this.city}/BUS/${this.agency}/review/routes`;
    }
    return this.httpHandler
      .get(url)
      .then((res) => {
        if (res) return res;
      })
      .catch((err) => {
        if (err.status === 401) {
          this.httpHandler.getRefreshToken().then((res) => {
            if (res) {
              this.getRouteList(route);
            }
          });
        }
        return err;
      });
  }
  getRouteOutPoly(routeId: string, _fromDate, _todate) {
    let url;
    // url = `${environment.preProd_url}scheduler_v4/${this.city}/download/fare?routeId=${this.routeId}`;
    let dispatchedInfo = JSON.parse(localStorage.getItem("dispatchInfo"));
    this.city = dispatchedInfo["city"]["name"].toLowerCase();
    url =
      `${environment.out_poly_url}` +
      `${this.city}` +
      "/accuracy/route?routeId=" +
      `${routeId}` +
      "&from=" +
      `${_fromDate}` +
      "&to=" +
      `${_todate}` +
      "&accuracyRadius=20&thresholdStopVisits=30";

    return this.httpHandler
      .get(url)
      .then((res) => {
        if (res) {
          return res;
        }
      })
      .catch((err) => {
        if (err.status === 401) {
          this.httpHandler.getRefreshToken().then((res) => {
            if (res) {
              this.getRouteOutPoly(routeId, _fromDate, _todate);
            }
          });
        }
        return err;
      });
  }

  // getRouteDetails(route) ajay
  /**
   {
    const url = `${
      environment.preProd_url
    }cityData/production/deployCities?city=${this.city.toLowerCase()}`;
    const token = "Y2hhbG9fdXNlcjpDaGFsb3VzZXJAMTIz";
    const headerToken = {
      Authorization: `Basic ${token}`,
    };
    const options = {
      responseType: "text",
      header: headerToken,
    };

    return this.httpHandler
      .get(url, options)
      .then()
      .catch(() =>
        this.helpers.showSnackBar("Something went wrong. Plaese try again")
      );
  }
   */

  getOutPolyPoints() {
    let url;
  }

  setNewRoutes(routeList) {
    this.routeList = routeList ? routeList : "";
  }
  getNewRoutes() {
    return this.routeList;
  }

  uploadCsvFile(file, url, params?) {
    let data = {
      file: file,
    };
    return this.postUrlFormData(url, data, params)
      .then((res) => {
        if (res) {
          return res;
        }
      })
      .catch((err) => {
        return err;
      });
  }

  postUrlFormData(url, data?: Object, params?: HttpParams) {
    const formData = new FormData();
    if (data["file"].length) {
      data["file"].forEach((item) => {
        formData.append("files", item);
      });
    } else {
      formData.append("files", data["file"]);
    }
    const header = new HttpHeaders();
    header.set("Content-Type", "multipart/form-data");
    return this.http
      .post(url, formData, { responseType: "text", params: params })
      .toPromise()
      .then()
      .catch(() =>
        this.helpers.showSnackBar("Something went wrong. Please try again")
      );
  }

  deployFareList(url) {
    const options = {
      responseType: "text",
    };
    return this.httpHandler
      .get(url, options)
      .then()
      .catch(() =>
        this.helpers.showSnackBar("Something went wrong. Plaese try again")
      );
  }

  deployFaresToProd() {
    const url = `${
      environment.apiUrl
    }cityData/deployFares?city=${this.city.toLowerCase()}`;
    const options = {
      responseType: "text",
    };

    return this.httpHandler
      .get(url, options)
      .then()
      .catch(() =>
        this.helpers.showSnackBar("Something went wrong. Plaese try again")
      );
  }

  deployCityToDev() {
    const url = `${
      environment.preProd_url
    }cityData/development/deployCities?city=${this.city.toLowerCase()}`;
    const token = "Y2hhbG9fdXNlcjpDaGFsb3VzZXJAMTIz";
    const headerToken = {
      Authorization: `Basic ${token}`,
    };
    const options = {
      responseType: "text",
      header: headerToken,
    };
    return this.httpHandler
      .get(url, options)
      .then()
      .catch(() =>
        this.helpers.showSnackBar("Something went wrong. Plaese try again")
      );
  }

  deployCityToProd() {
    const url = `${
      environment.preProd_url
    }cityData/production/deployCities?city=${this.city.toLowerCase()}`;
    const token = "Y2hhbG9fdXNlcjpDaGFsb3VzZXJAMTIz";
    const headerToken = {
      Authorization: `Basic ${token}`,
    };
    const options = {
      responseType: "text",
      header: headerToken,
    };

    return this.httpHandler
      .get(url, options)
      .then()
      .catch(() =>
        this.helpers.showSnackBar("Something went wrong. Plaese try again")
      );
  }

  deployFaresOnlyProd() {
    const url = `${
      environment.preProd_url
    }cityData/deployFares?city=${this.city.toLowerCase()}`;
    const token = "Y2hhbG9fdXNlcjpDaGFsb3VzZXJAMTIz";
    const headerToken = {
      Authorization: `Basic ${token}`,
    };
    const options = {
      responseType: "text",
      header: headerToken,
    };

    return this.httpHandler
      .get(url, options)
      .then()
      .catch(() =>
        this.helpers.showSnackBar("Something went wrong. Plaese try again")
      );
  }

  downloadFareandRouteList(url) {
    const options = {
      responseType: "text",
    };
    return this.httpHandler.get(url, options);
  }
  getStopDetail(isProd, routeId) {
    let url = `${environment.dataToolUrl}${this.city}/${this.agency}/BUS/route/details?routeId=${routeId}&env=preprod`;
    if (isProd) {
      url = `${environment.dataToolUrl}${this.city}/${this.agency}/BUS/route/details?routeId=${routeId}&env=production`;
    }
    return this.httpHandler.get(url).then((res) => {
      return res.route;
    });
  }

  updateStopDetail(stopId, stopName) {
    const url = `${
      environment.dataToolUrl
    }stop/${this.city.toLowerCase()}/update?stopId=${stopId}`;
    const data = {
      name: stopName,
    };
    const options = {
      responseType: "text",
    };
    return this.httpHandler.post(url, data, options);
  }

  editRouteDetails(data, routeId) {
    const url = `${
      environment.dataToolUrl
    }route/${this.city.toLowerCase()}/update?routeId=${routeId}`;
    const options = {
      responseType: "text",
    };
    return this.httpHandler.post(url, data, options);
  }

  getRouteDetails(routeId, prod) {
    let url = `${environment.dataToolUrl}${this.city}/${this.agency}/BUS/live/routes`;
    if (prod) {
      url = `${environment.dataToolUrl}${this.city}/${this.agency}/BUS/live/routes`;
    }
    return this.httpHandler.get(url);
  }

  getAgency(prod) {
    let url = `${environment.dataToolUrl}metadata`;
    // if (prod) {
    //     url = `${environment.proddataToolUrl}metadata`;
    // }

    return this.httpHandler
      .get(url)
      .then((res) => {
        let finalCityInfo = {};
        let cityData = _.find(res, (item) => {
          return item.city === this.city.toUpperCase();
        });
        if (cityData && cityData.directions) {
          finalCityInfo["directions"] = [...cityData.directions];
        }
        if (cityData && cityData.modes_map) {
          let modes = _.find(cityData.modes_map, (item) => {
            return item.mode === "BUS";
          });
          finalCityInfo["agencies"] = modes.agencies.map((item) => {
            return item.agencyName;
          });
        }
        if (cityData && cityData.special_features) {
          finalCityInfo["special_features"] = [...cityData.special_features];
        }
        if (cityData && cityData.spf) {
          finalCityInfo["spf"] = [...cityData.spf];
        }
        if (cityData && cityData.o) {
          finalCityInfo["applications"] = [...cityData.o];
        }
        if (cityData && cityData.tags) {
          finalCityInfo["tags"] = cityData.tags;
        }

        if (cityData && cityData.localeIds) {
          finalCityInfo["localeIds"] = cityData.localeIds;
        }

        return finalCityInfo;
      })
      .catch((err) => {
        this.helpers.showSnackBar("error occured: " + err.message);
      });
  }

  getFareList(routeId, prod) {
    let url = `${environment.dataToolUrl}scheduler/${this.city}/fares/data?routeId=${routeId}&env=preprod`;
    if (prod) {
      url = `${environment.dataToolUrl}scheduler/${this.city}/fares/data?routeId=${routeId}&env=production`;
    }
    return this.httpHandler.get(url).then((res) => {
      console.log(res);
      return res;
    });
  }

  getTimeTable(routeId) {
    let url = `${environment.apiUrl}scheduler_v4/v4/${this.city}/routeTimeTable?routeId=${routeId}`;
    return this.httpHandler
      .get(url)
      .then((res) => {
        console.log("result=============", res);
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  setNewRouteDetails(details) {
    localStorage.setItem("routeDetail", JSON.stringify(details));
  }

  getNewRouteDetails() {
    return JSON.parse(localStorage.getItem("routeDetail"));
  }

  getTotalStopList() {
    if (!this.city) {
      let dispatchedInfo = JSON.parse(localStorage.getItem("dispatchInfo"));
      this.city = dispatchedInfo["city"]["name"].toLowerCase();
    }
    const url = `${environment.dataToolUrl}${this.city}/BUS/stops`;
    // return this.http.get(url);
    return this.httpHandler
      .get(url)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  addNewRoute(timeTableFile, categories, fareFiles, routeId, distanceFile) {
    if (!this.agency) {
      let dispatchedInfo = JSON.parse(localStorage.getItem("dispatchInfo"));
      this.agency = dispatchedInfo["agency"]["name"];
    }
    let url = `${environment.dataToolUrl}${this.city}/BUS/routes/update`;
    if (routeId) {
      url = `${environment.dataToolUrl}${this.city}/BUS/routes/${routeId}/update`;
    }
    let data = this.getNewRouteDetails();
    const payload = {
      di: data.di,
      name: data.name,
      iname: data.iname,
      ag: data.ag ? data.ag : this.agency,
      unActive: data.unActive,
      poly: data.poly,
    };

    const stopSequence = data.stopList.map((item) => {
      if (item.id) {
        return {
          stopId: item.id,
          name: item.stopName,
          lat: item.lat,
          lon: item.long,
          // ls:item.ls
        };
      } else {
        return {
          name: item.stopName,
          lat: item.lat,
          lon: item.long,
          // ls:item.ls
        };
      }
    });
    payload["stopSequence"] = [...stopSequence];
    if (data.o) {
      payload["o"] = [...data.o];
    }

    if (data.spf) {
      payload["spf"] = [...data.spf];
    }

    if (data.isComplete) {
      payload["isComplete"] = data.isComplete;
    }

    if (data.sf) {
      payload["sf"] = [...data.sf];
    }

    if (data.rr) {
      payload["rr"] = data.rr;
    }
    if (data.uby) {
      payload["uby"] = data.uby;
    }
    if (data.tags) {
      payload["tags"] = data.tags;
    }

    if (distanceFile.length) {
      payload["distanceArray"] = distanceFile;
    }

    const formData = new FormData();
    if (timeTableFile) {
      formData.append("trip", timeTableFile);
    }
    if (fareFiles.length > 0) {
      let catIds = [];
      for (let category of categories) {
        const index = _.findIndex(this.categoryList, { name: category });
        catIds.push(this.categoryList[index].id);
        formData.append(
          "category",
          JSON.stringify(this.categoryList[index].id)
        );
      }
      for (let fare of fareFiles) {
        formData.append("fare", fare);
      }
    } else {
      formData.append("category", "");
    }
    formData.append("data", JSON.stringify(payload));

    const header = new HttpHeaders();
    header.set("Content-Type", "multipart/form-data");
    return this.http.post(url, formData, { responseType: "text" }).toPromise();
  }

  checkCSVHeaders(array) {
    const headers = JSON.parse(JSON.stringify(array));
    const csvHeaders = ["SEQ NO", "STOP NAME", "LAT", "LONG"];
    for (let i = 0; i < csvHeaders.length; i++) {
      const index = headers.indexOf(csvHeaders[i]);
      if (index === -1) {
        return false;
      }
      if (i === csvHeaders.length - 1) {
        return true;
      }
    }
  }
  getFareCategories() {
    let dispatchedInfo = JSON.parse(localStorage.getItem("dispatchInfo"));
    this.city = dispatchedInfo["city"]["name"].toLowerCase();
    this.agency = dispatchedInfo["agency"]["name"].trim();
    let categories = [];
    let url = `${environment.dataToolUrl}${this.city}/${this.agency}/BUS/fare/cateogories`;
    return this.httpHandler
      .get(url)
      .then((res) => {
        this.categoryList = res["fareCategories"];
        for (let category of res["fareCategories"]) {
          categories.push(category["name"]);
        }
        return categories;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
