import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
		private route: ActivatedRoute,
		private api: TournamentsService
	) { }

  ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.tournamentID = params.tournament_id;
			this.api.tournament(this.tournamentID).subscribe(t => {
				this.tournament = t;
				this.tournament.id = t.id;
			})
		})
  }
}
