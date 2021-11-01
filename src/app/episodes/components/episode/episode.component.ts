import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Episode } from '../../models/episode';

@Component({
  selector: 'app-episode',
  templateUrl: './episode.component.html',
  styleUrls: ['./episode.component.scss']
})
export class EpisodeComponent implements OnInit {

	@Input() episode: Observable<Episode> = new Observable();

  constructor(
		private route: ActivatedRoute
	) { 
		this.route.data.subscribe(data => {
			this.episode = data.episode as Observable<Episode>;
		});
	}

  ngOnInit(): void {
  }

}
