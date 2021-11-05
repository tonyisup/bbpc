import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-session-panel',
  templateUrl: './session-panel.component.html',
  styleUrls: ['./session-panel.component.scss']
})
export class SessionPanelComponent implements OnInit {

	user: Observable<User> = new Observable();
  constructor(
		private _users: UserService
	) { }

	signedIn = false;
	
	ngOnInit() {
		this.user = this._users.currentUser$;
		this._users.isSignedIn.subscribe(user => {
			if (user) {
				this.signedIn = true;
			}
		});
	}

	signOut() {
		this._users.signOut();
		this.signedIn = false;
	}
}
