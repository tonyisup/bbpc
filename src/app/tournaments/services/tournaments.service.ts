import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { Team } from '../models/team';
import { Tournament } from '../models/tournament';
import { Match } from '../models/match';
import { User } from 'src/app/auth/models/user';
import { UtilService } from 'src/app/services/util.service';
import { map } from 'rxjs/operators';
import { Bracket } from '../models/bracket';

@Injectable({
  providedIn: 'root'
})
export class TournamentsService {

  constructor(
    private tournamentStore: AngularFirestore,
		private _util: UtilService,
  ) { }

	getServerTimestamp(): any {
		return firebase.firestore.FieldValue.serverTimestamp();
	}
	tournament(tournamentID: string): Observable<Tournament> {
		return this.tournamentStore.collection('tournaments').doc<Tournament>(tournamentID).valueChanges();
	}
  tournaments(): Observable<Tournament[]> {
    return this.tournamentStore
			.collection<Tournament>('tournaments', ref => ref.where('active', '==', true))
			.valueChanges({ idField: 'id' });
	}
	//#region Teams
  team(tournamentID: string, teamID: string): Observable<Team> {		
		return this.tournamentStore
		.collection('tournaments').doc(tournamentID)
		.collection('teams').doc<Team>(teamID).valueChanges();
  }
  teams(tournamentID: string): Observable<Team[]> {
		return this.tournamentStore
			.collection('tournaments').doc(tournamentID)
			.collection<Team>('teams').valueChanges({ idField: 'id' });
  }
  teamsByContestant(tournamentID: string, contestant: string): Observable<Team[]> {
		return this.tournamentStore
			.collection('tournaments').doc(tournamentID)
			.collection<Team>('teams',
      ref => ref.where('contestant', '==', contestant)
    ).valueChanges({ idField: 'id' });
  }
  addTeam(team: Team): Promise<any> {
    team.addedOn = this.getServerTimestamp();
		return this.tournamentStore
			.collection('tournaments').doc(team.tournament)
			.collection('teams').add(team);
  }
  updateTeam(team: Team): Promise<any> {
		team.updatedOn = this.getServerTimestamp();
		return this.tournamentStore
			.collection('tournaments').doc(team.tournament)
			.collection('teams').doc(team.id).set(team);
	}
	//#endregion
	//#region Matches
	addMatch(match: Match): Promise<any> {
		match.addedOn = this.getServerTimestamp();
		return this.tournamentStore
			.collection('tournaments').doc(match.tournamentId)
			.collection('matches').add({...match}); 
	}
	updateMatch(match: Match): Promise<any> {
		match.updatedOn = this.getServerTimestamp();
		return this.tournamentStore
			.collection('tournaments').doc(match.tournamentId)
			.collection('matches').doc(match.id).set(match);
	}
	matches(tournamentID: string): Observable<Match[]> {
		return this.tournamentStore
		.collection('tournaments').doc(tournamentID)
		.collection<Match>('matches').valueChanges({ idField: 'id'});
	}
	match(tournamentID: string, matchID: string): Observable<Match> {
		return this.tournamentStore
		.collection('tournaments').doc(tournamentID)
		.collection('matches').doc<Match>(matchID).valueChanges();
	}
	bracket(tournamentID: string, round: number = 1): Observable<Bracket> {
		return this.tournamentStore
			.collection('tournaments').doc(tournamentID)
			.collection<Match>('matches',
				ref => ref.where('roundId', '==', round)
		).valueChanges({ idField: 'id'})
		.pipe(map(matches => {
			const bracket = new Bracket();
			bracket.matches = matches;
			bracket.tournamentId = tournamentID;
			return bracket;
		}));
	}
	createBracket(tournamentID: string, teams: Team[]): Promise<any> {
		const matches = [];
		const round = 1;
		const roundName = 'Round ' + round;

		// go through teams in order of seeds
		// every two teams, create a match
		// matches.push(...roundMatches);
		return this.tournamentStore
			.collection('tournaments').doc(tournamentID)
			.collection('matches').add(matches);
	}
	round(tournamentID: string, roundID: string): Observable<Match[]> {
		return this.tournamentStore
			.collection('tournaments').doc(tournamentID)
			.collection<Match>('matches',
				ref => ref.where('roundId', '==', roundID)
		).valueChanges({ idField: 'id'});
	}
	isRegistered(tournamentID: string, email: string): Promise<boolean> {
		 return new Promise((resolve) => {
			 this.tournamentStore
			.collection('tournaments').doc(tournamentID)
			.collection('users').doc(email).ref.get().then(d => resolve(d.exists));
		 });
	}
	registerUser(tournamentID: string, user: User): Promise<any> {
		const registeredUser = {
			addedOn: this.getServerTimestamp()
		};
		return this.tournamentStore
			.collection('tournaments').doc(tournamentID)
			.collection('users').doc(user.email).set({...registeredUser}); 	
	}
	registerEntry(team: Team): Promise<any> {
		team.id = this._util.getVideoID(team.link);

		return new Promise((resolve, reject) => {
			team.addedOn = this.getServerTimestamp();
			this.tournamentStore
				.collection('tournaments').doc(team.tournament)
				.collection('teams').doc(team.id).ref.get().then(d => {
					if (d.exists) {
						reject('Sorry, that entry is already registered!');
					}
					else {
						this.tournamentStore
						.collection('tournaments').doc(team.tournament)
						.collection('teams').doc(team.id).set(team).then();
						resolve('Entry successfully registered!');
					}
				});
		});
	}
	removeEntry(team: Team): Promise<any> {
		return this.tournamentStore
			.collection('tournaments').doc(team.tournament)
			.collection('teams').doc(team.id).delete();
	}
	//#endregion
}
