import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

	private API_URL = 'https://www.googleapis.com/youtube/v3/search';
	private readonly API_KEY = 'AIzaSyAZiAzzXfc9kURJ4AZninv_s5HWfcs8Uqw';

  constructor(
		private http: HttpClient
	) { }

	search(query: string): Observable<any> {
		const url = `${this.API_URL}?q=${query}&key=${this.API_KEY}&part=snippet&type=video&maxResults=10`;
		return this.http.get(url).pipe(map((r: any) => r.items))
	}
}
