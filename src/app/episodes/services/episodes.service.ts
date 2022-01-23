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
			addedOn: this.getServerTimestamp(),
			recordedOn: episode.recordedOn,
		}
		return this.episodesStore.collection('episodes')
			.add({...newEpisode})
			.then(ref => {
				firebase.firestore.FieldValue
				const promises = [];
				episode.current.forEach(assignment => {
					const newAssignment = {
						episode: ref.id,
						...assignment
					};
					promises.push(this.episodesStore.collection('assignments').add(newAssignment));
				});				
				episode.next.forEach(assignment => {
					const newAssignment = {
						episode: ref.id,
						...assignment
					};
					promises.push(this.episodesStore.collection('assignments').add(newAssignment));
				});
				episode.extras.forEach(extra => {
					const newExtra = {
						episode: ref.id,
						...extra
					};
					promises.push(this.episodesStore.collection('extras').add(newExtra));
				})
				return Promise.all(promises);
			});
	}
	getEpisode(id: string): Observable<Episode> {
		return this.episodesStore.doc<Episode>(`episodes/${id}`).valueChanges();
	}
}