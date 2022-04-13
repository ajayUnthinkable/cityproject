import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { GoogleLoginService } from 'chalo-google-hybrid-login';
import { Helpers } from 'src/providers/helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  subscription: Subscription;

  constructor(private googleLoginService: GoogleLoginService<any>, private helpers: Helpers) {
    this.subscription = this.googleLoginService.getLogoutMessage().subscribe(msg => {
      if (msg.message === 'Signed out') {
        //perform logout
        this.helpers.logOut();
      }
    })
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    if (this.subscription){
      this.subscription.unsubscribe();
    }
  }
}
