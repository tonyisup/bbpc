import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, reduce, scan, switchMap } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user';
import { UserService } from 'src/app/auth/services/user.service';
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
		updatedOn: null
	};
  user: User;
	teamsFilled = false;

  constructor(
		private _route: ActivatedRoute,
		private _tournaments: TournamentsService,
    private _users: UserService,
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

    this._tournaments.addTeam(this.team).then(r => {
      this.resetTeam();
      
      this.filterTeams(this.team.contestant);
    });
  }
  getVideoID(link: string): SafeResourceUrl {
    let id = link.split('v=')[1];
    const ampersandPosition = id.indexOf('&');
    if (ampersandPosition !== -1) {
      id = id.substring(0, ampersandPosition);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
  }
}
