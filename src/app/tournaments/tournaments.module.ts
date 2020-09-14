import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TournamentsRoutingModule } from './tournaments-routing.module';
import { TournamentsComponent } from './tournaments.component';
import { TournamentListComponent } from './tournament-list/tournament-list.component';
import { TournamentsService } from './services/tournaments.service';
import { TeamListComponent } from './team-list/team-list.component';


@NgModule({
  declarations: [TournamentsComponent, TournamentListComponent, TeamListComponent],
  imports: [
    FormsModule,
    CommonModule,
    TournamentsRoutingModule
  ],
  providers: [
    TournamentsService
  ]
})
export class TournamentsModule { }
