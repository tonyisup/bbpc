import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-session-panel',
  templateUrl: './session-panel.component.html',
  styleUrls: ['./session-panel.component.scss']
})
export class SessionPanelComponent implements OnInit {

  constructor(
		private _users: UserService
	) { }

	signedIn = false;
	email: string;
	ngOnInit() {
		this._users.isSignedIn.subscribe(user => {
			if (user) {
				this.email = user.email;
				this.signedIn = true;
			}
		});
	}

	signOut() {
		this._users.signOut();
		this.signedIn = false;
		this.email = null;
	}
}
