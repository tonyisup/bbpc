import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-select',
  templateUrl: './user-select.component.html',
  styleUrls: ['./user-select.component.scss']
})
export class UserSelectComponent implements OnInit {

	@Input() user: User;
	@Output() userChange = new EventEmitter<User>();
  constructor(
		private _users: UserService
	) { }

	users: Observable<User[]> = new Observable();

  ngOnInit(): void {
		this.users = this._users.getUsers();
  }

	save(): void {
		this.userChange.emit(this.user);
	}
}
