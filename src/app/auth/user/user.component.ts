import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

	user: Observable<User> = new Observable();
  constructor(
		private authService: AuthService,
	) { }

  ngOnInit(): void {
		this.user = this.authService.onUserLoggedIn();
  }

}
