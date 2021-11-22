import { Component, Input, OnInit } from '@angular/core';
import { Movie } from 'src/app/common/models/movie';

@Component({
  selector: 'app-movie-link',
  templateUrl: './movie-link.component.html',
  styleUrls: ['./movie-link.component.scss']
})
export class MovieLinkComponent implements OnInit {

	@Input() movie: Movie;
	@Input() hidden = true;

  constructor() { }

  ngOnInit(): void {
  }

}
