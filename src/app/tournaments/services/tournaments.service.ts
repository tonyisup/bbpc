import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';

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

  teams(tournamentID: string): Observable<any[]> {
    return this.tournamentStore.collection('teams',
      ref => ref.where('tournament', '==', tournamentID).orderBy('contestant')
    ).valueChanges();
  }
  teamsByContestant(tournamentID: string, contestant: string): Observable<any[]> {
    return this.tournamentStore.collection('teams',
      ref => ref.where('tournament', '==', tournamentID).where('contestant', '==', contestant)
    ).valueChanges();
  }

  addTeam(team: any): Promise<any> {
    team.added_on = firebase.firestore.FieldValue.serverTimestamp();
    return this.tournamentStore.collection('teams').add(team);
  }
}
