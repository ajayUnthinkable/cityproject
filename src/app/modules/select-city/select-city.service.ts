import { Injectable } from '@angular/core';
import { HttpHandlerService } from '../../../providers/http-handler.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Helpers } from 'src/providers/helper';

@Injectable()
export class CityService {

    constructor(private httpHandler: HttpHandlerService, private helpers: Helpers, private router: Router) {
    }

    getAllResources(resourceType, parentId) {
        const token = localStorage.getItem('user_token');
        const val = true;
        if (token) {
            let url = environment.base_url + 'resources/data/' + resourceType;    
                url += `?all=${val}`;
            if (parentId) {
                url += `&parentMetaId=${parentId}`;
            }
            const headerToken = {
                'Authorization': 'Bearer ' + JSON.parse(token).access_token
            };
            return this.httpHandler.get(url, { header: headerToken }).then((res) => {
                if (res) {
                    return res;
                }
            });
        } else {
            this.redirectToLogogin();
        }
    }

    /**
     * Get App Ids
     */
    getApplicationId() {
        const token = localStorage.getItem('user_token');
        const value = true;
        if (token) {
            let url = environment.base_url + 'application';
            url += `?all=${value}`;
            const header = {
                'Authorization': 'Bearer ' + JSON.parse(token).access_token
            };
            return this.httpHandler.get(url, { header: header }).then((res) => {
                if (res) {
                    return res;
                }
            });
        } else {
            this.redirectToLogogin();
        }
    }

    /**
     * Get App Resources
     * @param appId 
     */
    getResources(appId) {
        const token = localStorage.getItem('user_token');
        const val = true;
        if (token) {
            let url = environment.base_url + 'resources?appId=' + appId + `&all=${val}`;
            const header = {
                'Authorization': 'Bearer ' + JSON.parse(token).access_token
            };
            return this.httpHandler.get(url, { header: header }).then((res) => {
                if (res) {
                    return res;
                }
            });
        } else {
            this.redirectToLogogin();
        }
    }
    redirectToLogogin() {
        this.helpers.showSnackBar('You are logged out. Please login again.')
        window.location.href = '/login';
    }

}
