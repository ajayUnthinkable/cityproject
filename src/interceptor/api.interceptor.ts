import { Injectable } from '@angular/core';
import {
    HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';
import { Helpers } from 'src/providers/helper';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ApiInterceptor implements HttpInterceptor {
    constructor(private helperService:Helpers,private router:Router){ }
    intercept(req: HttpRequest<any>, next: HttpHandler):Observable<HttpEvent<any>>  {
        const token = JSON.parse(localStorage.getItem('user_token'));
        const idApiCall  = this.helperService.checkUserValidate();
        console.log('api-interceptor',idApiCall);
        if(idApiCall) {
            if(!req.url.includes('logout/new')) {
                req = req.clone({
                            setHeaders: {
                              Authorization: `Bearer ${token.access_token}`
                            }
                          });
            }
            return next.handle(req);
        } else {
            localStorage.clear();
            this.router.navigateByUrl('/login');
           // return throwError('error from interceptor');
        }
    }
}