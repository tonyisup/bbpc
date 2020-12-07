import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TournamentsService } from '../../services/tournaments.service';
import { Team } from '../../models/team';

@Component({
  selector: 'app-team-add',
  templateUrl: './team-add.component.html',
  styleUrls: ['./team-add.component.scss']
})
export class TeamAddComponent implements OnInit {

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

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private tournamentService: TournamentsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tournamentID = params.tournament_id;
      this.team.tournament = this.tournamentID;
    });
  }
  filterTeams(filter: string): void {
    this.teams = this.tournamentService.teamsByContestant(this.tournamentID, filter);
  }
  resetTeam(): void {
    this.team.link = '';
    this.team.tournament = this.tournamentID;
  }
  add(): void {
    this.tournamentService.addTeam(this.team).then(r => {
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
