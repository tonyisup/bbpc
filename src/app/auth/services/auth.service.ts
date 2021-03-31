import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { ReplaySubject } from 'rxjs';
import { User } from '../models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

	private _loggedInUser$: ReplaySubject<User> = new ReplaySubject(1);

  constructor(
		private _user: UserService,
		private _auth: AngularFireAuth,
	) { 		
		this._user.isSignedIn.subscribe(result => {
			if (!result) return;
			const user: User = {
				email: result.email,
				displayName: '',
				updatedOn: null
			};
			this._user.login(user)
				.then(u => {
					this._loggedInUser$.next(u);
				})
				.catch(e => console.error(`Auth Login Error: ${e}`));
		});
	}

	onUserLoggedIn(): ReplaySubject<User> {
		return this._loggedInUser$;
	}
	//onAuth(): 
	AuthLogin(provider: firebase.auth.AuthProvider) {
		return this._auth.signInWithPopup(provider)
			.then(result => {
				if (result.additionalUserInfo) {
					const user: User = {
						email: result.user.email,
						displayName: result.user.displayName,
						updatedOn: null
					};
					this._user.login(user)
						.then(u => {
							this._loggedInUser$.next(u);
						})
						.catch(e => console.error(`Auth Login Error: ${e}`));
				}
			})
			.catch(e => console.error(e));
	}

	FacebookAuth() {
		return this.AuthLogin(new auth.FacebookAuthProvider());
	}
}
