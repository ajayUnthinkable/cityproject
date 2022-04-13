import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import {
  GOOGLE_LOGIN_CONFIG,
  GoogleLoginService,
  GOOGLE_LOGIN_HTTP_INTERCEPTOR,
  ChaloGoogleHybridLoginModule,
} from "chalo-google-hybrid-login";
import { googleConfig } from "../environments/environment";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { Helpers } from "src/providers/helper";
import { AuthGuard } from "src/providers/auth-guard";
import { HttpHandlerService } from "../providers/http-handler.service";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { ServerErrorInterceptor } from "src/interceptor/service-error.interceptor";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ConfirmationDialogueComponent } from "./components/confirmation-dialogue/confirmation-dialogue.component";
import { ApiInterceptor } from "src/interceptor/api.interceptor";
import { TranslationModule } from "./components/translation-component/translation.module";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
@NgModule({
  declarations: [AppComponent, ConfirmationDialogueComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    HttpClientModule,
    FontAwesomeModule,
    ChaloGoogleHybridLoginModule,
    TranslationModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  providers: [
    { provide: GOOGLE_LOGIN_CONFIG, useValue: googleConfig },
    GoogleLoginService,
    Helpers,
    AuthGuard,
    HttpHandlerService,
    {
      provide: GOOGLE_LOGIN_HTTP_INTERCEPTOR,
      useClass: ServerErrorInterceptor,
    }, //ServerErrorInterceptor-class which implements HttpInterceptor
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true }, //ServerErrorInterceptor-class which implements HttpInterceptor
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
