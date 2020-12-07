import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
		private userStore: AngularFirestore
	) { }

	getServerTimestamp(): any {
		return firebase.firestore.FieldValue.serverTimestamp();
	}
	async exists(email: string): Promise<boolean> {
		return (await this.userStore.doc(`users/${email}`).ref.get()).exists;
	}
	async login(user: User): Promise<User> {
		const exists = await this.exists(user.email);
		if (!exists) {
			await this.save(user);
		}
		return this.load(user.email);
	}
	save(user: User): Promise<any> {
		user.updatedOn = this.getServerTimestamp();
		return this.userStore
			.collection('users').doc(user.email).set(user, {
				merge: true
			});
	}
	load(email: string): Promise<User> {
		return this.userStore.doc<User>(`users/${email}`).valueChanges().pipe(first()).toPromise();
	}
}
