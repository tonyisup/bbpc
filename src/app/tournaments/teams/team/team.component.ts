import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
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
	@Input('show-name') showName = false;

  constructor(
    private route: ActivatedRoute,
		private _util: UtilService,
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
				this.api.team(this.tournamentId, this.teamId).subscribe(t => {
					this.team = t;
					console.log(t);
				});
			}
		});
  }

  getVideoLink(link: string): SafeUrl {
		console.log(link);
		return this.sanitizer.bypassSecurityTrustUrl(link);
  }
  getVideoURL(link: string): SafeResourceUrl {
		let id = this._util.getVideoID(link);
		return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
  }
}
