import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
	) { }

  shuffle(array: any[]): any[] {
    let currentIndex = array.length;
    let temporaryValue = 0;
    let randomIndex = 0;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
	}

	getVideoID(link: string): string {
		if (!link) return null;
		
		if (link.indexOf('v=') > 0) {
			let id = link.split('v=')[1];
			const ampersandPosition = id.indexOf('&');
			if (ampersandPosition !== -1) {
				id = id.substring(0, ampersandPosition);
			}
			return id;
		}

		if (link.indexOf('.be/') > 0) {

			let id = link.split('.be/')[1];
			return id;
		}
	}
}
