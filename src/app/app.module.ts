import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { UtilService } from './services/util.service';
import { AuthModule } from './auth/auth.module';
import { AppCommonModule } from './common/app-common.module';
import { HttpClientModule } from '@angular/common/http';
import { TournamentsModule } from './tournaments/tournaments.module';
import { FaqComponent } from './components/faq/faq.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    FaqComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
		AngularFirestoreModule,
		AuthModule,
		AppCommonModule,
		HttpClientModule,
		TournamentsModule,
		FormsModule
  ],
  providers: [
    UtilService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
