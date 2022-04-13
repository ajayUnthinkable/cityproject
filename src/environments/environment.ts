// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { GoogleLoginConfig } from "chalo-google-hybrid-login";

export const environment = {
  production: false,
  // base_url: `https://central-auth-staging.chalo.com/api/v1/`,
  base_url: `https://central-auth-staging.chalo.com/api/v1/`,
  apiUrl: "https://devdatatool.chalo.com/",
  poly_api_url: "https://devdatatool.chalo.com/datatool/polyline/",
  poly_all_point_url: "https://production.zophop.com/vasudha/polyline/",
  // redirect_uri: 'https://devdatatool.chalo.com',
  redirect_uri: "http://localhost:4200",
  preProd_url: "https://devdatatool.chalo.com/",
  prod_url: "https://datatool.chalo.com/",
  data_tool_url: "https://devdatatool.chalo.com/",
  apiDisaptchUrl: "https://devdatatool.chalo.com/dashboard/",
  baseUrl: "https://devdatatool.chalo.com/",
  eventUrl: "https://devdatatool.chalo.com/datatool/eventhandler/",
  homeScreenUrl: "https://devdatatool.chalo.com/datatool/homescreen/",
  dataToolUrl: "https://devdatatool.chalo.com/datatool/",
  out_poly_url: "https://production.zophop.com/dashboard/enterprise/dev/", // Ajay
  allowUsers: [
    "Owner",
    "owner",
    "Admin",
    "admin",
    "Manager",
    "manager",
    "data executive",
    "Data Executive",
    "Polyline Executive",
  ],
};

export const googleConfig: GoogleLoginConfig = {
  authCodeUrl: `${environment.base_url}google/token?webRequest=true&redirect_uri=${environment.redirect_uri}`,
  userTokenServerUrl: `${environment.base_url.split("api")[0]}oauth/token`,
  auth: {
    google: {
      client_id:
        "631286963633-8qt7clhvrnq4a5086d4emb7ij0bkidc9.apps.googleusercontent.com",
    },
    server: {
      client_id: "web_app_citydatatool",
      client_secret: "KbEvJq7uEv",
    },
  },
  user: {
    userCookie: "chalo_user_staging",
    authenticateUserUrl: `${environment.base_url}google/secure_authenticated/new`,
    loginStateCookie: "chalo_isLoggedIn_staging",
  },
  logout: {
    logoutUrl: `${environment.base_url}google/logout/new`,
  },
  // user: {
  //   userCookie: 'username_staging',
  //   authenticateUserUrl: `${environment.base_url}google/secure_authenticated`,
  //   loginStateCookie: 'chalo_loginstate_staging'
  // },
  // logout: {
  //   logoutUrl: `${environment.base_url}google/logout`
  // }
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
