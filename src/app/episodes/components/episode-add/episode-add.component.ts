import { Component, Input, OnInit } from '@angular/core';
import { Assignment, Episode } from '../../models/episode';
import { EpisodesService } from '../../services/episodes.service';

@Component({
  selector: 'app-episode-add',
  templateUrl: './episode-add.component.html',
  styleUrls: ['./episode-add.component.scss']
})
export class EpisodeAddComponent implements OnInit {

	episode = new Episode();
	
  constructor(
		private _episodesService: EpisodesService
	) {
		this.episode.current = [];
		this.episode.next = [];
		this.episode.extras = [];
	 }

  ngOnInit(): void {
  }
	save(event: any) {
		this.episode = event as Episode;
		this._episodesService.add(this.episode).then(r => {
			console.log('episode added', r);
		});
	}
}
