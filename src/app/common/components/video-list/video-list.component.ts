import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Video } from '../../models/video';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss']
})
export class VideoListComponent implements OnInit {

	@Output() selected = new EventEmitter<Video>();

	@Input() videos: Video[];
  constructor() { }

  ngOnInit(): void {
  }

	select(video: Video) {
		this.selected.emit(video);
	}
}
