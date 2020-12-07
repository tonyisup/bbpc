import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-session-panel',
  templateUrl: './session-panel.component.html',
  styleUrls: ['./session-panel.component.scss']
})
export class SessionPanelComponent implements OnInit {

  constructor(
		private _ngFireAuth: AngularFireAuth
	) { }

	signedIn = false;
	email: string;
	ngOnInit() {
		this._ngFireAuth.onAuthStateChanged(user => {
			if (user) {
				this.email = user.email;
				this.signedIn = true;
			}
		})
	}

	signOut() {
		this._ngFireAuth.signOut();
		this.signedIn = false;
		this.email = null;
	}
}
