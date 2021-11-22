import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSelectComponent } from './components/movie-select/movie-select.component';
import { FormsModule } from '@angular/forms';
import { ListenOnComponent } from './components/listen-on/listen-on.component';
import { MovieCardComponent } from './components/movie-card/movie-card.component';
import { EllipsifyPipe } from './pipes/ellipsify.pipe';
import { DefaultImagePipe } from './pipes/default-image.pipe';
import { VideoSelectComponent } from './components/video-select/video-select.component';
import { VideoListComponent } from './components/video-list/video-list.component';
import { VideoCardComponent } from './components/video-card/video-card.component';
import { MovieLinkComponent } from './components/movie-link/movie-link.component';



@NgModule({
  declarations: [
		MovieSelectComponent,
		ListenOnComponent,
		MovieCardComponent,
		EllipsifyPipe,
		DefaultImagePipe,
		VideoSelectComponent,
		VideoListComponent,
		VideoCardComponent,
		MovieLinkComponent
	],
  imports: [
    CommonModule,
		FormsModule
  ],
	exports: [
    MovieSelectComponent,
		ListenOnComponent,
		MovieCardComponent,
		VideoSelectComponent,
		MovieLinkComponent
	],
})
export class AppCommonModule { }
