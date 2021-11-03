import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, pluck } from 'rxjs/operators';
import { Video } from '../../models/video';
import { YoutubeService } from '../../services/youtube.service';

@Component({
  selector: 'app-video-select',
  templateUrl: './video-select.component.html',
  styleUrls: ['./video-select.component.scss']
})
export class VideoSelectComponent implements AfterViewInit {

	@ViewChild('input') inputElement: ElementRef;

	@Input() video: Video;
	@Output() videoChange = new EventEmitter<Video>();

  constructor(
		private youtubeService: YoutubeService
	) { }

	search: string;
  inputTouched = false;
  loading = false;
  videos: Video[] = [];

	ngAfterViewInit(): void {
		fromEvent(this.inputElement.nativeElement, 'keyup')
			.pipe(
				debounceTime(500),
				pluck('target', 'value'),
				distinctUntilChanged(),
				filter((value: string) => value.length > 3),
				map(value => value)
			)
			.subscribe(value => {
				this.search = value;
				this.handleSearch(value);
			});
	}
	handleSearch(query: string) {
		this.loading = true;
		this.youtubeService.search(query).subscribe(videos => {
			this.videos = videos.map(video => {
				return {
					videoId: video.id.videoId,
					videoUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
					channelId: video.snippet.channelId,
					channelUrl: `https://www.youtube.com/channel/${video.snippet.channelId}`,
					channelTitle: video.snippet.channelTitle,
					title: video.snippet.title,
					publishedAt: video.snippet.publishedAt,
					description: video.snippet.description,
					thumbnail: video.snippet.thumbnails.high.url
				}
			});
			this.loading = false;
			this.inputTouched = true;
		});
	}
	videoSelected(video: Video) {
		this.video = video;
		this.videoChange.emit(video);
		this.videos = [];
		this.inputElement.nativeElement.value = '';
		this.search = '';
		this.loading = false;
		this.inputTouched = false;
	}
}
