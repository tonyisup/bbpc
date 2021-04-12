import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { Team } from '../../models/team';
import { TournamentsService } from '../../services/tournaments.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {

	@Input('tournament-id') tournamentId: string;
	@Input('team-id') teamId: string;
	@Input() team: Team;
	@Input('show-entry') showEntry = true;
	@Input('show-eidt') showEdit = false;

  constructor(
    private route: ActivatedRoute,
		private util: UtilService,
    private sanitizer: DomSanitizer,
		private api: TournamentsService
	) { }

  ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.tournamentId = params.tournament_id;
			if (this.team === undefined && this.teamId === undefined) {
				return;
			}
			if (this.team === undefined) {
				this.api.team(this.tournamentId, this.teamId).subscribe(t => this.team = t);
			}
		});
  }

  getVideoID(link: string): SafeResourceUrl {
		console.log(link);
		if (link === undefined) {
			return;
		}
		const url = this.util.getVideoID(link)
		console.log(url);
		return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
