import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TournamentsComponent } from './tournaments.component';
import { TournamentListComponent } from './tournament-list/tournament-list.component';
import { TeamListComponent } from './team-list/team-list.component';

const routes: Routes = [
  { path: '', component: TournamentsComponent },
  { path: 'list', component: TournamentListComponent },
  { path: 'teams', component: TeamListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TournamentsRoutingModule { }
