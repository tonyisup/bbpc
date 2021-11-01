import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { UserService } from 'src/app/auth/services/user.service';
import { Tournament } from '../models/tournament';
import { TournamentsService } from '../services/tournaments.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {


	@Input() tournament = new Tournament();
	tournamentID: string;
	isRegistered = false;

  constructor(
		private _route: ActivatedRoute,
		private _tournaments: TournamentsService,
    private _users: UserService
	) { }
  
  ngOnInit(): void {
		this._route.params.subscribe(params => {
			this.tournamentID = params.tournament_id;
			this._tournaments.tournament(this.tournamentID).subscribe(t => {
				this.tournament = t;
				this.tournament.id = t.id;
			})
		});

		this._users.isSignedIn.subscribe(user => {
			this._tournaments.isRegistered(
				this.tournamentID,
				user.email
			).then(registered => this.isRegistered = registered);
		})
  }

	registerForTournament(): void {
		this._users.currentUser$.subscribe(user => {
			this._tournaments.registerUser(this.tournamentID, user).then(r => {
				console.log('registered', r);
				this.isRegistered = true;
			});
		});
	}
}
