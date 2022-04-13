import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Helpers } from 'src/providers/helper';
import { RouteService } from '../../route-master.service';

@Component({
  selector: 'app-review-changes',
  templateUrl: './review-changes.component.html',
  styleUrls: ['./review-changes.component.scss']
})
export class ReviewChangesComponent implements OnInit {
  panelOpenState = false;
  isClicked = {};
  isFareFileUploaded = false;
  isTimeTableUploaded = false;
  isDistanceUploaded = false;
  details;
  currentRoute;
  constructor(private matDialogueRef: MatDialogRef<ReviewChangesComponent>, @Inject(MAT_DIALOG_DATA) public data: any,private routeService:RouteService , private activatedRoute:ActivatedRoute) {
    this.isFareFileUploaded = data.isFareFileUploaded,
    this.isTimeTableUploaded = data.isTimeTableUploaded,
    this.isDistanceUploaded = data.isDistanceUploaded
   }

  ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(params => {
          this.currentRoute = params.back;
      });
    this.details = this.routeService.getNewRouteDetails();
    console.log("details==========",this.details);
    
  }

  success() {
    this.matDialogueRef.close('yes');
  }

  cancel() {
    this.matDialogueRef.close('No');
  }

  infoClicked(item) {
    if (this.isClicked[item]) {
      this.isClicked[item] = false;
    } else {
      this.isClicked[item] = true;
    }
  }

}
