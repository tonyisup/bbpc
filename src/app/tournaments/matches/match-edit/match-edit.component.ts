import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Match } from '../../models/match';
import { Team } from '../../models/team';
import { TournamentsService } from '../../services/tournaments.service';

@Component({
  selector: 'app-match-edit',
  templateUrl: './match-edit.component.html',
  styleUrls: ['./match-edit.component.scss']
})
export class MatchEditComponent implements OnInit, OnDestroy {

	matchSub: Subscription;
	tournamentID: string;
	matchID: string;
	teams: Team[];
	match = new Match();

  constructor(
		private route: ActivatedRoute,
		private tournamentService: TournamentsService
	) { }

  ngOnDestroy(): void {
    this.matchSub.unsubscribe();
  }
  ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.matchID = params.match_id;
			this.tournamentID = params.tournament_id;
			this.tournamentService.teams(this.tournamentID).subscribe(t => {
				this.teams = t;
			});
			this.matchSub = this.tournamentService.match(this.tournamentID, this.matchID).subscribe(m => {
				this.match = m;
				this.match.id = this.matchID;
			})
		})
  }
	save(): void {
		this.tournamentService.updateMatch(this.match).then(r => console.log(r));
	}
}
