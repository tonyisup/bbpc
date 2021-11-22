import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Episode } from '../../models/episode';

@Component({
  selector: 'app-episode-edit',
  templateUrl: './episode-edit.component.html',
  styleUrls: ['./episode-edit.component.scss']
})
export class EpisodeEditComponent implements OnInit {

	@Input() episode: Episode;
	@Output() episodeChange = new EventEmitter<Episode>();

  constructor() { }

  ngOnInit(): void {
  }

	save() {
		this.episodeChange.emit(this.episode);
	}
}
