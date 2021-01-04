import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { Episode } from '../models/episode';

@Injectable({
  providedIn: 'root'
})
export class EpisodesService {

  constructor(
		private episodesStore: AngularFirestore
	) { }
	
	getServerTimestamp(): any {
		return firebase.firestore.FieldValue.serverTimestamp();
	}

	latest(): Observable<Episode[]> {
		return this.episodesStore.collection<Episode>('episodes',
			ref => ref.orderBy('number', 'desc').limit(1)).valueChanges();
	}
	add(episode: Episode): Promise<DocumentReference> {
		return this.episodesStore.collection<Episode>('episodees').add(episode);
	}
}