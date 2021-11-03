import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, reduce, scan, switchMap } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user';
import { UserService } from 'src/app/auth/services/user.service';
import { UtilService } from 'src/app/services/util.service';
import { Team } from '../../models/team';
import { Tournament } from '../../models/tournament';
import { TournamentsService } from '../../services/tournaments.service';

@Component({
  selector: 'app-team-register',
  templateUrl: './team-register.component.html',
  styleUrls: ['./team-register.component.scss']
})
export class TeamRegisterComponent implements OnInit {

  tournament = new Tournament();
	tournamentID: string;
  teams: Observable<Team[]>;
  team: Team = {
		id: null,
		seed: 0,
		contestant:"",
		link:"",
		name: "",
		tournament: "",
		addedOn: null,
		updatedOn: null,
		movie: null,
		video: null
	};
  user: User;
	teamsFilled = false;
	message = '';

  constructor(
		private _route: ActivatedRoute,
		private _tournaments: TournamentsService,
    private _users: UserService,
		private _util: UtilService,
    private sanitizer: DomSanitizer,
  ) { }

  
  ngOnInit(): void {
    this._users.isSignedIn.pipe(switchMap(user => {
      this.user = user;
      return this._route.params;
    })).subscribe(params => {
			this.tournamentID = params.tournament_id;
			this._tournaments.tournament(this.tournamentID).subscribe(t => {
				this.tournament = t;
				this.tournament.id = t.id;
        this.filterTeams(this.user.email);
			})
		});
  }
  resetTeam(): void {
    this.team.link = '';
    this.team.tournament = this.tournamentID;
  }
  filterTeams(filter: string): void {
    this.teams = this._tournaments.teamsByContestant(this.tournamentID, filter);
		this.teams.subscribe(t => this.teamsFilled = t.length >= this.tournament.teamlimit);
  }
  add(): void {
    this.team.tournament = this.tournamentID;
    this.team.contestant = this.user.email;
		this.team.link = this.team.video.videoUrl;
		this.team.name = this.team.name || this.team.video.title;

    this._tournaments.registerEntry(this.team).then(r => {
			this.displayMessage(r);

      this.resetTeam();
      
      this.filterTeams(this.team.contestant);
    }).catch(r => {
			this.displayMessage(r);
		});
  }
	displayMessage(m: string) {
		this.message = m;
		setTimeout(() => {
			this.message = '';
		}, 3000);
	}
	remove(team: Team) {
		this._tournaments.removeEntry(team).then(r => this.displayMessage(r)).catch(r => this.displayMessage(r));
	}
	isValidLink(link: string): boolean {
		if (!link) return false;
		return (link.indexOf('v=') >= 0) || (link.indexOf('.be/') >= 0);
	}
  getVideoURL(link: string): SafeResourceUrl {
		let id = this._util.getVideoID(link);
		return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
  }
}
