import { Component, OnInit, OnDestroy } from '@angular/core';
import { GoogleLoginResponse, GoogleLoginService } from "chalo-google-hybrid-login";
import { Helpers } from 'src/providers/helper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { routes } from '../../../../utils/config/constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  showLogin: string = "hidden";
  subscription: Subscription;
  constructor(private helpers: Helpers, private snackBar: MatSnackBar, private router: Router, private googleLoginService: GoogleLoginService<GoogleLoginResponse>) { }

  ngOnInit() {
    let isAuthenticated = this.googleLoginService.isUserAuthenticated();
    if (isAuthenticated) {
      this.showLogin = "hidden";
      this.googleLoginService.getGoogleLoginResponse().subscribe(res => {
        this.onGoogleResponse(res);
      }, err => {
        this.showLogin = 'visible';
      })
    }
    else {
      this.showLogin = "visible";
    }
  }


  selectCity() {
    window.location.href = `/${routes.cityRoute}`;
  }
  checkAcces(userInfo, userData) {
    const isAllowed = this.helpers.checkUserAllowed(userInfo.authorities[0]);
    if (isAllowed) {
      localStorage.setItem('user_token', JSON.stringify(userData));
      this.selectCity();
    } else {
      this.helpers.showSnackBar('You are not allowed to access this portal.')
    }
  }

  onGoogleResponse(response: GoogleLoginResponse) {
    const result = response.data;
    if (result.access_token) {
      let userInfo = this.helpers.parseToken(result.access_token);
      this.checkAcces(userInfo, result)
    }
    else {
      let error;
      this.showLogin = "visible";
      if (result && result.error) {
        error = result.error.error_description || result.error.message || "Something went wrong";
      } else {
        error = "Something went wrong";
      }
      this.helpers.showSnackBar(error);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
