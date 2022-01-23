import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

	user: Observable<User> = new Observable();
	message = '';

  constructor(
		private userService: UserService,
	) { }

  ngOnInit(): void {
		this.user = this.userService.currentUser$;
  }

	save(user: User) {
		this.userService.save(user).then(r => {
			this.message = 'Saved';
			setTimeout(() => {
				this.message = '';
			}, 2000);
		});
	}

	deleteData(user: User) {
		if(confirm("Are you sure you want to delete your data?")) {
			this.userService.deleteData(user.email).then(r => {
				this.message = 'Deleted';
				setTimeout(() => {
					this.message = '';
				}, 2000);
			});
		}
	}
}
