import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Match } from '../../models/match';
import { Team } from '../../models/team';
import { TournamentsService } from '../../services/tournaments.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {

	@Input('tournament-id') tournamentId: string;
	@Input('match-id') matchId: string;
	@Input() match: Match;
	@Input('show-entry') showEntry = true;
	
  constructor(
		private route: ActivatedRoute,
		private api: TournamentsService
	) { }

  ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.tournamentId = params.tournament_id;
			
			if (this.match !== undefined) {
				return;
			}

			if (this.matchId !== undefined) {
				this.api.match(this.tournamentId, this.matchId).subscribe(m => this.match = m);
				return;
			}
			if (params.match_id === undefined) {
				console.log("no match info");
				return;
			}
			this.matchId = params.match_id;
			this.api.match(this.tournamentId, this.matchId).subscribe(m => this.match = m);
		});
  }

	winner(team: Team) {
		this.match.winner = team;
		this.api.updateMatch(this.match).then();
	}
}
