import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from "@angular/fire/auth-guard";

import { TournamentsComponent } from './tournaments.component';
import { TournamentListComponent } from './tournament-list/tournament-list.component';
import { TeamListComponent } from './teams/team-list/team-list.component';
import { TeamAddComponent } from './teams/team-add/team-add.component';
import { TeamEditComponent } from './teams/team-edit/team-edit.component';
import { SeedComponent } from './seed/seed.component';
import { TournamentComponent } from './tournament/tournament.component';
import { MatchListComponent } from './matches/match-list/match-list.component';
import { MatchAddComponent } from './matches/match-add/match-add.component';
import { MatchEditComponent } from './matches/match-edit/match-edit.component';
import { TeamComponent } from './teams/team/team.component';
import { MatchComponent } from './matches/match/match.component';
import { RegisterComponent } from './register/register.component';
import { TeamRegisterComponent } from './teams/team-register/team-register.component';
import { RegisteredGuard } from '../guards/registered.guard';
import { AdminGuard } from '../guards/admin.guard';
import { BracketComponent } from './bracket/bracket.component';
import { BracketResolverService } from './services/bracket-resolver.service';


const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["auth"]);

const routes: Routes = [
  { path: '', component: TournamentsComponent },
	{ 
		path: 'bracket/:tournament_id',
		component: BracketComponent,
		resolve: {
			bracket: BracketResolverService
		}
	},
  { path: 'tournament', component: TournamentComponent },
  { path: 'list', component: TournamentListComponent },
  { path: 'seed', component: SeedComponent, canActivate: [AdminGuard] },
  { path: 'team', component: TeamComponent },
  { path: 'teams', component: TeamListComponent },
  { path: 'teams/add', component: TeamAddComponent, canActivate: [AdminGuard] },
  { path: 'teams/edit', component: TeamEditComponent, canActivate: [AdminGuard] },
  { path: 'match', component: MatchComponent },
  { path: 'matches', component: MatchListComponent },
  { path: 'matches/add', component: MatchAddComponent, canActivate: [AdminGuard] },
  { path: 'matches/edit', component: MatchEditComponent, canActivate: [AdminGuard] },
  { 
		path: 'register',
		component: RegisterComponent,
		canActivate: [AngularFireAuthGuard],
		data: { authGuardPipe: redirectUnauthorizedToLogin }
	},
  { 
		path: 'teams/register',
		component: TeamRegisterComponent,
		canActivate: [AngularFireAuthGuard, RegisteredGuard], 
		data: { authGuardPipe: redirectUnauthorizedToLogin }
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TournamentsRoutingModule { }
