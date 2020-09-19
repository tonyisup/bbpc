import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { Team } from '../models/team';

@Injectable({
  providedIn: 'root'
})
export class TournamentsService {

  constructor(
    private tournamentStore: AngularFirestore
  ) { }

  tournaments(): Observable<any[]> {
    return this.tournamentStore.collection('tournaments').valueChanges({ idField: 'id' });
  }

  team(teamID: string): Observable<Team> {
    return this.tournamentStore.collection('teams').doc<Team>(teamID).valueChanges();
  }
  teams(tournamentID: string): Observable<Team[]> {
    return this.tournamentStore.collection<Team>('teams',
      ref => ref.where('tournament', '==', tournamentID).orderBy('contestant')
    ).valueChanges({ idField: 'id' });
  }
  teamsByContestant(tournamentID: string, contestant: string): Observable<any[]> {
    return this.tournamentStore.collection('teams',
      ref => ref.where('tournament', '==', tournamentID).where('contestant', '==', contestant)
    ).valueChanges({ idField: 'id' });
  }

  addTeam(team: Team): Promise<any> {
    team.addedOn = firebase.firestore.FieldValue.serverTimestamp();
    return this.tournamentStore.collection('teams').add(team);
  }
  updateTeam(team: Team): Promise<any> {
    team.updatedOn = firebase.firestore.FieldValue.serverTimestamp();
    return this.tournamentStore.collection('teams').doc(team.id).set(team);
  }
}
