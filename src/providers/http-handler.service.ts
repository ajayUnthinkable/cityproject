import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { GoogleLoginService, GoogleLoginResponse } from 'chalo-google-hybrid-login';
import { Helpers } from './helper';

@Injectable()
export class HttpHandlerService {
    header;

    constructor(private http: HttpClient, private helpers: Helpers,
        private googleLoginService: GoogleLoginService<GoogleLoginResponse>
    ) {
        this.createHeaders();
    }

    createHeaders() {
        let headers = new HttpHeaders();
        headers = headers.set('content-type', 'application/json; charset=UTF-8');
        return headers;
    }

    get(url, option?): Promise<any> {
        let headers = new HttpHeaders();
        let options = {
            headers: headers,
        }
        if (option) {
            options = this.createOption(headers, option)
        }
        return this.http.get(url, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.errorHandler.bind(this));
    }

    post(url, data?: Object, option?): Promise<any> {
        let headers;
        let options = {
            headers: headers,
        }
        if (option) {
            options = this.createOption(headers, option)
        }
        return this.http.post(url, data, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.errorHandler.bind(this));
    }

    put(url, data?: Object, option?): Promise<any> {
        let headers;
        let options = {
            headers: headers,
        }
        if (option) {
            options = this.createOption(headers, option)
        }
        return this.http.put(url, data, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.errorHandler.bind(this));
    }

    delete(url, option?): Promise<any> {
        let headers;
        let options = {
            headers: headers,
        }
        if (option) {
            options = this.createOption(headers, option)
        }
        return this.http.delete(url, options)
            .toPromise()
            .then(this.extractData)
            .catch(this.errorHandler.bind(this));
    }


    getRefreshToken() {
        const token = JSON.parse(localStorage.getItem('user_token'));
        return this.googleLoginService.getUserTokenFromRefreshToken(token.refresh_token).toPromise()
            .then((response) => {
                localStorage.setItem('user_token', JSON.stringify(response));
                return response;
            }, (err) => {
                if(err.status == 401) {
                    this.helpers.logOut();
                 }
                // this.helpers.showSnackBar('Something went wrong.')
            });
    }

    private extractData(res: Response) {
        if (res && res['_body'] == 'OK') {
            return { statusCode: 200 };
        }
        return res;
    }

    private errorHandler(error: HttpErrorResponse | any) {
        let errMsg: string;
        let body;
        if (error instanceof HttpErrorResponse) {
            body = error.error;
            errMsg = body.message ? body.message :
                'Something went wrong. Please try again';
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        if (error.status === 401 && body.error === 'invalid_token') {
        } else if (error.status === 0) {
        } else if (errMsg) {
        } else {
            this.helpers.showSnackBar('Something went wrong. Please try again')
        }
        return Promise.reject(error);
    }

    createOption(headers, option?) {
        if (option && option.header) {
            const header = option.header;
            const headerKeys = Object.keys(header);
            headers = this.createHeaders();
            headerKeys.forEach(key => {
                headers = headers.set(key, header[key])
            })
        }
        const options = {
            headers: headers,
        }
        if (option) {
            const optionKeys = Object.keys(option);
            optionKeys.forEach(key => {
                if (key != 'header') {
                    options[key] = option[key];
                }

            })
        }
        return options;
    }
    postUrlEncoded(url, data?: Object, option?): Promise<any> {
        option =  {'Content-Type' : 'application/x-www-form-urlencoded'}
        let headers;
        let options = {
            headers: headers,
        }
        if (option) {
            options = this.createOption(headers, option)
        }
        return this.http.post(url, data)
            .toPromise()
            .then(this.extractData)
            .catch(this.errorHandler.bind(this));
    }
}
