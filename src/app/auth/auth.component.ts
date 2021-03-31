import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './models/user';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

	user$: Observable<User>;
  constructor(
		public _auth: AuthService
	) { }

  ngOnInit(): void {
  }

	auth() {
		this._auth.FacebookAuth();
		this.user$ = this._auth.onUserLoggedIn();
	}
}
