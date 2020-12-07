import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './auth/models/user';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	title = 'bbpc';

	admin: Observable<User> = new Observable<User>();

  constructor(
		private _auth: AuthService
	) { }

	ngOnInit() {
		this.admin = this._auth.onUserLoggedIn();
	}
}
