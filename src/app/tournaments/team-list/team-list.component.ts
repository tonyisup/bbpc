import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { TournamentsService } from '../services/tournaments.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Team } from '../models/team';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {

  tournamentID: string;
  teams: Observable<any[]>;
  filter = '';

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private tournamentService: TournamentsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tournamentID = params.id;
      if (this.tournamentID !== undefined) {
        this.teams = this.tournamentService.teams(this.tournamentID);
      }
    });
  }
  filterTeams(): void {
    this.teams = this.tournamentService.teamsByContestant(this.tournamentID, this.filter);
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
