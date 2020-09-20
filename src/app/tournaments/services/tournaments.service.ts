import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { Team } from '../models/team';
import { Tournament } from '../models/tournament';
import { Match } from '../models/match';

@Injectable({
  providedIn: 'root'
})
export class TournamentsService {

  constructor(
    private tournamentStore: AngularFirestore
  ) { }

	getServerTimestamp(): any {
		return firebase.firestore.FieldValue.serverTimestamp();
	}
	tournament(tournamentID: string): Observable<Tournament> {
		return this.tournamentStore.collection('tournaments').doc<Tournament>(tournamentID).valueChanges();
	}
  tournaments(): Observable<Tournament[]> {
    return this.tournamentStore.collection<Tournament>('tournaments').valueChanges({ idField: 'id' });
	}
	//#region Teams
  team(teamID: string): Observable<Team> {
    return this.tournamentStore.collection('teams').doc<Team>(teamID).valueChanges();
  }
  teams(tournamentID: string): Observable<Team[]> {
    return this.tournamentStore.collection<Team>('teams',
      ref => ref.where('tournament', '==', tournamentID).orderBy('contestant')
    ).valueChanges({ idField: 'id' });
  }
  teamsByContestant(tournamentID: string, contestant: string): Observable<Team[]> {
    return this.tournamentStore.collection<Team>('teams',
      ref => ref.where('tournament', '==', tournamentID).where('contestant', '==', contestant)
    ).valueChanges({ idField: 'id' });
  }
  addTeam(team: Team): Promise<any> {
    team.addedOn = this.getServerTimestamp();
    return this.tournamentStore.collection('teams').add(team);
  }
  updateTeam(team: Team): Promise<any> {
    team.updatedOn = this.getServerTimestamp();
    return this.tournamentStore.collection('teams').doc(team.id).set(team);
	}
	//#endregion
	//#region Matches
	addMatch(match: Match): Promise<any> {
		match.addedOn = this.getServerTimestamp();
		return this.tournamentStore.collection('matches').add({...match}); 
	}
	updateMatch(match: Match): Promise<any> {
		match.updatedOn = this.getServerTimestamp();
		return this.tournamentStore.collection('matches').doc(match.id).set(match);
	}
	matches(tournamentID: string): Observable<Match[]> {
		return this.tournamentStore.collection<Match>('matches',
		ref => ref.where('tournamentId', '==', tournamentID)).valueChanges({ idField: 'id'});
	}
	match(matchID: string): Observable<Match> {
		return this.tournamentStore.collection('matches').doc<Match>(matchID).valueChanges();
	}
	round(tournamentID: string, roundID: string): Observable<Match[]> {
		return this.tournamentStore.collection<Match>('matches',
			ref => ref.where('tournamentId', '==', tournamentID)
			.where('roundId', '==', roundID)
		).valueChanges({ idField: 'id'});
	}
	//#endregion
}
