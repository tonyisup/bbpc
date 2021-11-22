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

	latest(limit: number = 1): Observable<Episode[]> {
		return this.episodesStore.collection<Episode>('episodes',
			ref => ref.orderBy('number', 'desc').limit(limit)).valueChanges();
	}
	add(episode: Episode): Promise<any> {
		const newEpisode = {
			number: episode.number,
			title: episode.title,
		}
		return this.episodesStore.collection('episodes').add({...newEpisode}).then(ref => {
			return ref.update({
				current: firebase.firestore.FieldValue.arrayUnion({...episode.current}),
				next: firebase.firestore.FieldValue.arrayUnion({...episode.next}),
				extras: firebase.firestore.FieldValue.arrayUnion({...episode.extras})
			})
		});
	}
	getEpisode(id: string): Observable<Episode> {
		return this.episodesStore.doc<Episode>(`episodes/${id}`).valueChanges();
	}
}