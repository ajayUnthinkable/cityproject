import { GoogleLoginConfig } from "chalo-google-hybrid-login";

export const environment = {
  production: true,
  base_url: `https://auth.chalo.com/api/v1/`,
  apiUrl: 'https://datatool.chalo.com/',
  redirect_uri: 'https://datatool.chalo.com',
  poly_api_url: 'https://datatool.chalo.com/datatool/polyline/',
  poly_all_point_url: 'https://production.zophop.com/vasudha/polyline/',
  preProd_url: 'https://devdatatool.chalo.com/',
  prod_url: 'https://datatool.chalo.com/',
  data_tool_url: 'https://datatool.chalo.com/',
  apiDisaptchUrl: 'https://datatool.chalo.com/dashboard/',
  baseUrl: 'https://datatool.chalo.com/',
  eventUrl: 'https://datatool.chalo.com/datatool/eventhandler/',
  homeScreenUrl: 'https://datatool.chalo.com/datatool/homescreen/',
  dataToolUrl: 'https://datatool.chalo.com/datatool/',
  allowUsers: ['Owner', 'owner', 'Admin', 'admin', 'Manager', 'manager', 'data executive', 'Data Executive', 'Polyline Executive']
};

export const googleConfig: GoogleLoginConfig = {
  authCodeUrl: `${environment.base_url}google/token?webRequest=true&redirect_uri=${environment.redirect_uri}`,
  userTokenServerUrl: `${environment.base_url.split('api')[0]}oauth/token`,
  auth: {
    google: {
      client_id: '631286963633-htpr4rshe53notddve4u1khj1cq81kh4.apps.googleusercontent.com'
    },
    server: {
      client_id: 'web_city_datatool', client_secret: 'lfVIe68ilW'
    }
  },
  user: {
    userCookie: 'chalo_userId',
    authenticateUserUrl: `${environment.base_url}google/secure_authenticated/new`,
    loginStateCookie: 'chalo_user_loginstate'


  },
  logout: {
    logoutUrl: `${environment.base_url}google/logout/new`
  }
  // user: {
  //   userCookie: 'username',
  //   authenticateUserUrl: 'https://auth.chalo.com/api/v1/google/authenticated',
  //   loginStateCookie:'chalo_loginstate'


  // },
  // logout: {
  //   logoutUrl: 'https://auth.chalo.com/api/v1/google/logout'
  // }
}