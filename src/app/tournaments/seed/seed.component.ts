import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { TournamentsService } from '../services/tournaments.service';
import { UtilService } from '../../services/util.service';
import { Team } from '../models/team';

@Component({
  selector: 'app-seed',
  templateUrl: './seed.component.html',
  styleUrls: ['./seed.component.scss']
})
export class SeedComponent implements OnInit, OnDestroy {

  tournamentID: string;
  teamsSub: Subscription;
  teams: Team[];

  constructor(
    private route: ActivatedRoute,
    private tournamentService: TournamentsService,
    private utilService: UtilService
  ) { }
  ngOnDestroy(): void {
    this.teamsSub.unsubscribe();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tournamentID = params.tournament_id;
      if (this.tournamentID !== undefined) {
        this.teamsSub = this.tournamentService.teams(this.tournamentID).subscribe(teams => {
          this.teams = teams.sort((a: Team, b: Team) => a.seed - b.seed);
        });
      }
    });
  }

  seed(): void {
    this.teams = this.utilService.shuffle(this.teams);
  }

  save(): void {
    let seed = 1;
    for (const team of this.teams) {
      team.seed = seed++;
      this.tournamentService.updateTeam(team);
    }
  }

	createBracket() {
		this.tournamentService.createBracket(this.tournamentID, this.teams);
	}
}
