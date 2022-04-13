import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { ChaloGoogleHybridLoginModule, GoogleLoginService } from 'chalo-google-hybrid-login';
import { UserAuthenticationRoutingModule } from './user-authentication-routing.module';
import { UserAuthenticationComponent } from './user-authentication.component';


@NgModule({
  declarations: [
    UserAuthenticationComponent,
    LoginComponent,
  ],
  imports: [
    CommonModule,
    UserAuthenticationRoutingModule,
    ChaloGoogleHybridLoginModule,
  ],
  providers:[GoogleLoginService]
})
export class UserAuthenticationModule { }
