import { Component, OnInit, OnDestroy } from '@angular/core';
import { routes } from '../../../../utils/config/constants'
import { faBars, faScroll, faSortDown, faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { MatDialog } from '@angular/material/dialog';
import { CitySelectionComponent } from 'src/app/modules/select-city/components/city-selection/city-selection.component';
import { Helpers } from 'src/providers/helper';
import { Subscription } from 'rxjs';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { ConfirmationDialogueComponent } from 'src/app/components/confirmation-dialogue/confirmation-dialogue.component';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit, OnDestroy {

  faBars = faBars;
  faScroll = faScroll;
  faSortDown = faSortDown;
  faSignOut = faSignOutAlt;
  faUserCircle = faUserCircle;
  route = routes;
  isMenuCollapsed: boolean = false;
  city;
  dispatchedInfo: any;
  userRole;
  initStyle = {
    "margin-left": "210px"
  }
  style = this.initStyle;
  subscription: Subscription;
  email;
  currentRoute;
  constructor(private dialog: MatDialog, private helpers: Helpers, private router: Router, private activatedRoute: ActivatedRoute) {

  }

  ngOnInit(): void {
    const currentUrlArray = this.router.url.split('/');
    this.currentRoute = currentUrlArray[currentUrlArray.length - 1];
    console.log(this.currentRoute)
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    this.userRole = userDetails.role.toLowerCase();
    this.email = userDetails.email.toLowerCase()
    this.subscription = this.helpers.changeCityEmitter.subscribe(data => {
      this.getCity();
    })
    this.getCity();
    this.toggle();
    this.router.events.subscribe((val)=>{
      if(val['url'] && val['url'].includes('addStop')) {
        if(!this.isMenuCollapsed)
              this.toggle();
      }
    });
    if(this.currentRoute.includes('addStop')) {
      if(!this.isMenuCollapsed) 
             this.toggle();
    }
  }

  isSideMenuVisible(){
    const isPoly = this.currentRoute.includes('poly?');
    return !isPoly;
  }

  getCity() {
    this.dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
    this.city = this.dispatchedInfo["city"]["name"];
  }

  // getDispatchData() {
  //   this.dispatchedInfo = JSON.parse(localStorage.getItem('dispatchInfo'));
  // }
  openCityPopUp() {
    console.log("open city pop up");
    const dialogRef = this.dialog.open(CitySelectionComponent, {
      data: { isFrom: 'home' },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      this.helpers.isCityChange.next(result);
    });
  }

  logOut() {
    const dialogRef = this.dialog.open(ConfirmationDialogueComponent, {
      data: {
        message: `Are you sure you want to logout?`,
        successButton: 'Yes',
        cancelButton: 'No'
      },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res === 'yes') {
        this.helpers.logOut();
      }
    })
  }

  toggle() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    if (this.isMenuCollapsed) {
      this.style = {
        "margin-left": "80px"
      }
    }
    else {
      this.style = this.initStyle;
    }
  }

  navigateToPage(path) {
    console.log("current url======", this.router.url);
    let currentUrl = this.router.url;
    
    const currentUrlArray = this.router.url.split('/');
    const pathArray = path.split('/');
    console.log('pathArray',pathArray);
    // if (currentUrlArray[currentUrlArray.length - 1] === 'addStop' || currentUrlArray[currentUrlArray.length - 1] === 'editStop' || currentUrlArray[currentUrlArray.length - 1] ==='add-event') {
      if (currentUrl.includes('addStop')|| currentUrl.includes('editStop')) {

      const dialogRef = this.dialog.open(ConfirmationDialogueComponent, {
        data: {
          message: 'All the changes will be discarded. So are you sure you to leave this page? ',
          successButton: 'Yes',
          cancelButton: 'No'
        },
        panelClass: 'custom-dialog-container'
      })
      dialogRef.afterClosed().subscribe(res => {
        if (res === 'yes') {
          this.currentRoute = pathArray[pathArray.length - 1];
          if (currentUrlArray[currentUrlArray.length - 1] === 'addStop'){
            localStorage.removeItem('routeDetail')
          } else {
            localStorage.removeItem('stopData')
          }
          this.router.navigateByUrl(path);
        }
      })
    } else {
      this.currentRoute = pathArray[pathArray.length - 1];
      this.router.navigateByUrl(path);
    }
  }
  ngOnDestroy(): void {
    this.dialog.closeAll();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
