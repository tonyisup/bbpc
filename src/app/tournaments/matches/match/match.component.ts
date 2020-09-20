import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Match } from '../../models/match';
import { TournamentsService } from '../../services/tournaments.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit {

	@Input('match-id') matchId: string;
	@Input() match: Match;
	@Input('show-entry') showEntry = true;
	
  constructor(
		private route: ActivatedRoute,
		private api: TournamentsService
	) { }

  ngOnInit(): void {
		if (this.match !== undefined) {
			return;
		}

		if (this.matchId !== undefined) {
			this.api.match(this.matchId).subscribe(m => this.match = m);
			return;
		}
		this.route.params.subscribe(params => {
			if (params.match_id === undefined) {
				console.log("no match info");
				return;
			}
			this.matchId = params.match_id;
			this.api.match(this.matchId).subscribe(m => this.match = m);
		});
  }
}
