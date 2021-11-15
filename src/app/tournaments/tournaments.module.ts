import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TournamentsRoutingModule } from './tournaments-routing.module';
import { TournamentsComponent } from './tournaments.component';
import { TournamentListComponent } from './tournament-list/tournament-list.component';
import { TournamentsService } from './services/tournaments.service';
import { TeamListComponent } from './teams/team-list/team-list.component';
import { TeamAddComponent } from './teams/team-add/team-add.component';
import { TeamEditComponent } from './teams/team-edit/team-edit.component';
import { SeedComponent } from './seed/seed.component';
import { TournamentComponent } from './tournament/tournament.component';
import { MatchAddComponent } from './matches/match-add/match-add.component';
import { MatchEditComponent } from './matches/match-edit/match-edit.component';
import { MatchListComponent } from './matches/match-list/match-list.component';
import { TeamComponent } from './teams/team/team.component';
import { MatchComponent } from './matches/match/match.component';
import { UsersComponent } from './users/users.component';
import { RegisterComponent } from './register/register.component';
import { TeamRegisterComponent } from './teams/team-register/team-register.component';
import { AppCommonModule } from '../common/app-common.module';
import { BracketComponent } from './bracket/bracket.component';
import { RulesComponent } from './rules/rules.component';


@NgModule({
	declarations: [
		TournamentsComponent, 
		TournamentListComponent, 
		TeamListComponent, 
		TeamAddComponent, 
		TeamEditComponent, 
		SeedComponent, 
		TournamentComponent, 
		MatchAddComponent, 
		MatchEditComponent, 
		MatchListComponent, 
		TeamComponent, 
		MatchComponent, UsersComponent, RegisterComponent, TeamRegisterComponent, BracketComponent, RulesComponent
	],
	imports: [
		FormsModule,
		CommonModule,
		ReactiveFormsModule,
		TournamentsRoutingModule,
		AppCommonModule
	],
	providers: [
		TournamentsService
	],
	exports: [
		TournamentListComponent
	]
})
export class TournamentsModule { }
