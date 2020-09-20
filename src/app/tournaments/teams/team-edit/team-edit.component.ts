import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TournamentsService } from '../../services/tournaments.service';
import { Observable, Subscription } from 'rxjs';
import { Team } from '../../models/team';

@Component({
  selector: 'app-team-edit',
  templateUrl: './team-edit.component.html',
  styleUrls: ['./team-edit.component.scss']
})
export class TeamEditComponent implements OnInit, OnDestroy {

  teamSub: Subscription;
  teamID: string;
  team: Team;
  constructor(
    private route: ActivatedRoute,
    private tournamentService: TournamentsService
  ) { }
  ngOnDestroy(): void {
    this.teamSub.unsubscribe();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.teamID = params.team_id;
      this.teamSub = this.tournamentService.team(this.teamID).subscribe(t => {
        this.team = t;
        this.team.id = this.teamID;
      });
    });
  }

  save(): void {
    this.tournamentService.updateTeam(this.team).then(r => console.log(r));
  }
}
