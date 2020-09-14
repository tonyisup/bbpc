import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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

  addTeam(team: any): Promise<any> {
    return this.tournamentStore.collection('teams').add(team);
  }
}
