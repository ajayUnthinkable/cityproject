import { Injectable } from "@angular/core";
import {
  CanActivate,
  Router,
  ActivatedRoute,
} from "@angular/router";
// import { Observable } from "rxjs/Observable";
import { Helpers } from './helper';
import { routes } from 'src/app/utils/config/constants';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private helper: Helpers, private activatedRouted: ActivatedRoute) { }
  canActivate(): boolean {

    let userToken = localStorage.getItem('user_token');
    if (userToken) {
      const token = JSON.parse(userToken);
      const userInfo = this.helper.parseToken(token.access_token);
      const isAllowed = this.helper.checkUserAllowed(userInfo.authorities[0]);
      if (isAllowed) {
        return true;
      } else {
        this.router.navigateByUrl(`/${routes.loginRoute}`)
        return false;
      }
    } else {
      this.router.navigateByUrl(`/${routes.loginRoute}`)
      return false;
    }
  }
}