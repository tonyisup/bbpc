import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/auth/models/user';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UserService } from 'src/app/auth/services/user.service';
import { Tournament } from '../models/tournament';
import { TournamentsService } from '../services/tournaments.service';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss']
})
export class TournamentComponent implements OnInit {

	@Input() tournament = new Tournament();
	tournamentID: string;
	
	user$: Observable<User>;

  constructor(
		private route: ActivatedRoute,
		private api: TournamentsService,
		private _auth: AuthService
	) { }

  ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.tournamentID = params.tournament_id;
			this.api.tournament(this.tournamentID).subscribe(t => {
				this.tournament = t;
				this.tournament.id = t.id;
			})
		});

		this.user$ = this._auth.onUserLoggedIn();
  }
}
