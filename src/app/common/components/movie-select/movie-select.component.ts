import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, pluck, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { Movie } from '../../models/movie';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-select',
  templateUrl: './movie-select.component.html',
  styleUrls: ['./movie-select.component.scss']
})
export class MovieSelectComponent implements AfterViewInit {

	@ViewChild('input') inputElement: ElementRef;

	@Input() movie: Movie;
	@Output() movieChange = new EventEmitter<Movie>();

  constructor(
		private movieService: MovieService
	) { }

	query: string = '';
	movies$: Observable<Movie[]>;

	ngAfterViewInit() {
		fromEvent(this.inputElement.nativeElement, 'keyup')
			.pipe(
				debounceTime(500),
				pluck('target', 'value'),
				distinctUntilChanged(),
				filter((value: string) => value.length > 3),
				map(value => value)
			)
			.subscribe(value => {
				this.query = value;
				this.search();
			});
	}
	search() {
		this.movies$ = this.movieService.search(this.query);
	}

	select(movie: Movie) {
		this.movie = movie;
		this.movieChange.emit(movie);
		this.movies$ = null;
		this.query = '';
		this.inputElement.nativeElement.value = '';
	}
}
