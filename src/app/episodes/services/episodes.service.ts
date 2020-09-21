import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';

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
}
