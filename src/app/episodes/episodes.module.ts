import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EpisodesRoutingModule } from './episodes-routing.module';
import { EpisodesComponent } from './episodes.component';
import { EpisodeComponent } from './episodes/episode/episode.component';
import { EpisodeAddComponent } from './episodes/episode-add/episode-add.component';
import { EpisodeListComponent } from './episodes/episode-list/episode-list.component';


@NgModule({
  declarations: [
		EpisodesComponent, 
		EpisodeComponent, 
		EpisodeAddComponent, 
		EpisodeListComponent],
  imports: [
    CommonModule,
    EpisodesRoutingModule
  ]
})
export class EpisodesModule { }
