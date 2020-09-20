import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Match } from '../../models/match';
import { Team } from '../../models/team';
import { TournamentsService } from '../../services/tournaments.service';

@Component({
  selector: 'app-match-add',
  templateUrl: './match-add.component.html',
  styleUrls: ['./match-add.component.scss']
})
export class MatchAddComponent implements OnInit {

	tournamentID: string;
	teams: Observable<Team[]>
	match = new Match();

  constructor(
		private route: ActivatedRoute,
		private tournamentService: TournamentsService
	) { }

  ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.tournamentID = params.tournament_id;
			this.match.tournamentId = this.tournamentID;
			this.teams = this.tournamentService.teams(this.tournamentID);
		})
  }

	resetMatch(): void {
		this.match = new Match();
		this.match.tournamentId = this.tournamentID;
	}
	add(): void {
		this.match.teamIdA = this.match.teamA.id;
		this.match.teamIdB = this.match.teamB.id;
		if (this.match.winner !== undefined) {
			this.match.winnerId = this.match.winner.id;
		}

		this.tournamentService.addMatch(this.match).then(r => {
			this.resetMatch();
		})
	}
}
