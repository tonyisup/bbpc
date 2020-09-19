import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TournamentsComponent } from './tournaments.component';
import { TournamentListComponent } from './tournament-list/tournament-list.component';
import { TeamListComponent } from './team-list/team-list.component';
import { TeamAddComponent } from './team-add/team-add.component';
import { TeamEditComponent } from './team-edit/team-edit.component';
import { SeedComponent } from './seed/seed.component';
import { TournamentComponent } from './tournament/tournament.component';

const routes: Routes = [
  { path: '', component: TournamentsComponent },
  { path: 'tournament', component: TournamentComponent },
  { path: 'list', component: TournamentListComponent },
  { path: 'seed', component: SeedComponent },
  { path: 'teams', component: TeamListComponent },
  { path: 'teams/add', component: TeamAddComponent},
  { path: 'teams/edit', component: TeamEditComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TournamentsRoutingModule { }
