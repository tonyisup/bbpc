import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie, MovieDetail } from '../models/movie';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

	private readonly API_KEY = '38ebbe4b';

  constructor(
		private http: HttpClient
	) { }

	search(query: string): Observable<Movie[]> {
		return this.http
			.get<Movie[]>(`https://www.omdbapi.com/?s=${query}&apikey=${this.API_KEY}`)
			.pipe(map(response => response['Search']));
		;
	 }

	 details(id: string): Observable<MovieDetail> {
		 return this.http	.get<MovieDetail>(`https://www.omdbapi.com/?i=${id}&apikey=${this.API_KEY}`)
	 }
}