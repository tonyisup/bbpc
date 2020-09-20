import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { TournamentsService } from '../../services/tournaments.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Team } from '../../models/team';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {

  tournamentID: string;
  teams: Observable<Team[]>;
  filter = '';

  constructor(
		private route: ActivatedRoute,
		private util: UtilService,
    private tournamentService: TournamentsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tournamentID = params.tournament_id;
      if (this.tournamentID !== undefined) {
        this.teams = this.tournamentService.teams(this.tournamentID);
      }
    });
  }
  filterTeams(): void {
    this.teams = this.tournamentService.teamsByContestant(this.tournamentID, this.filter);
  }
  getVideoID(link: string): SafeResourceUrl {
		return this.util.getVideoID(link);
  }
}
