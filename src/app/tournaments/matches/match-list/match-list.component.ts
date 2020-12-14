import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { UtilService } from 'src/app/services/util.service';
import { Match } from '../../models/match';
import { TournamentsService } from '../../services/tournaments.service';

@Component({
  selector: 'app-match-list',
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.scss']
})
export class MatchListComponent implements OnInit, OnDestroy {

	tournamentID: string;
	matchesSub: Subscription;
	matches: Match[];
	roundId: string;
	showingRound = false;

  constructor(
		private route: ActivatedRoute,
		private api: TournamentsService
	) { }

	ngOnDestroy(): void {
		this.matchesSub.unsubscribe();
	}

  ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.tournamentID = params.tournament_id;
			if (params.round_id !== undefined) {
				this.roundId = params.round_id;
				this.showingRound = true;
				this.filter();
			} else {
				this.matchesSub = this.api.matches(this.tournamentID).subscribe(m => this.matches = m);
			}
		})
	}
	filter(): void {
		this.matchesSub = this.api.round(this.tournamentID, this.roundId).pipe(take(1)).subscribe(m => this.matches = m);
	}
}
