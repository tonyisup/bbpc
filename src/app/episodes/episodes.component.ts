import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Episode } from './models/episode';

@Component({
  selector: 'app-episodes',
  templateUrl: './episodes.component.html',
  styleUrls: ['./episodes.component.scss']
})
export class EpisodesComponent implements OnInit {

	@Input() latest: Observable<Episode> = new Observable();
	@Input() episodes: Observable<Episode[]> = new Observable();

  constructor(
		private route: ActivatedRoute
	) {
		this.route.data.subscribe(data => {
			data.episodes.subscribe((episodes: Episode[]) => {
				this.latest = of(episodes[0]);
				this.episodes = of(episodes.slice(1));
			});
		});
	}

  ngOnInit(): void {
  }

}
