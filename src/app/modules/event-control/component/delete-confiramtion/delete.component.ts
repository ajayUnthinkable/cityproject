import { Component, Inject } from '@angular/core';
import { HttpHandlerService } from '../../../../../providers/http-handler.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventControlDataService } from '../../event-control.services';

@Component({
    selector: 'app-delete-dialog',
    templateUrl: 'delete.html',
    styleUrls: ['./delete.scss']
})
export class DeleteDialogComponent {

    isSaveDisable = false;
    show = true;
    data1: any;
    message: any;
    constructor(
        public dialogRef: MatDialogRef<DeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any, private httpHandler: HttpHandlerService,
        private snackBar: MatSnackBar, private eventControlDataService: EventControlDataService) {
        this.data1 = data;
        if (data.type == 'Event') {
            this.message = data.eventData.data.eventDetails.name;
        } else if (data.type === 'HomeScreenEvent') {
            this.message = data.eventData;
        }
    }

    onNoClick(): void {
        this.dialogRef.close('Cancel');
    }

    delete() {
        const dispatchInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
        const cityName = dispatchInfo.city.name.toLowerCase();
        if (this.data.eventData && this.data.type === 'Event') {
            this.isSaveDisable = true;
            const dataToSend = {
                eventId: this.data.eventData.eventId,
                city: cityName
            }
            this.eventControlDataService.deleteEvent(dataToSend).then((res) => {
                this.deleteSuccess(res);
            }, (err) => {
                this.deleteFail(err);
            });
        } else {
            if (this.data.eventData && this.data.type === 'HomeScreenEvent') {
                this.isSaveDisable = true;
                const dataToSend = {
                    eventId: this.data.eventData,
                    city: cityName
                }
                this.eventControlDataService.deleteHomeEvent(dataToSend).then((res) => {
                    console.log('res==', res);
                    this.deleteSuccess(res);
                }, (err) => {
                    this.deleteFail(err);
                });
            }
        }

    }

    deleteSuccess(res) {
        if (!res) {
            return;
        }
        if (res && (res === 202 || res.status === 200 || res.status === 206)) {
            this.dialogRef.close('Deleted');
            this.showMessage(res.message);
        }
        this.isSaveDisable = false;
    }

    deleteFail(err) {
        if (err.status === 401) {
            this.httpHandler.getRefreshToken().then((res) => {
                this.delete();
            });
        } else {
            this.isSaveDisable = false;
        }
    }

    showMessage(msg) {
        if (msg && msg.length) {
        } else {
            msg = 'Deleted Successfully.'
        }
        this.snackBar.open(msg, '', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 4000
        });
    }
}
