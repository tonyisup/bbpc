import { Component, Input, OnInit } from '@angular/core';
import { Assignment, Episode } from '../../models/episode';
import { EpisodesService } from '../../services/episodes.service';

@Component({
  selector: 'app-episode-add',
  templateUrl: './episode-add.component.html',
  styleUrls: ['./episode-add.component.scss']
})
export class EpisodeAddComponent implements OnInit {

	@Input() episode = new Episode();
	
  constructor(
		private _episodesService: EpisodesService
	) {
		this.episode.current = [];
		this.episode.next = [];
		this.episode.extras = [];
	 }

  ngOnInit(): void {
  }
	addCurrentAssignment(assignment: Assignment) {
		this.episode.current.push(assignment);
	}
	onSubmit() {
		this._episodesService.add(this.episode).then(r => {
			console.log('episode added', r);
		});
	}
}
