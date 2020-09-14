import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TournamentsComponent } from './tournaments.component';
import { TournamentListComponent } from './tournament-list/tournament-list.component';
import { TeamListComponent } from './team-list/team-list.component';
import { TeamAddComponent } from './team-add/team-add.component';

const routes: Routes = [
  { path: '', component: TournamentsComponent },
  { path: 'list', component: TournamentListComponent },
  { path: 'teams', component: TeamListComponent },
  { path: 'teams/add', component: TeamAddComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TournamentsRoutingModule { }
