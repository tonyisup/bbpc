import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Video } from '../../models/video';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.scss']
})
export class VideoCardComponent implements OnInit {

	@Input() video: Video;
	@Output() videoChange = new EventEmitter<Video>();

  constructor() { }

  ngOnInit(): void {
  }

}
