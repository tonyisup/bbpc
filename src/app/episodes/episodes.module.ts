import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EpisodesRoutingModule } from './episodes-routing.module';
import { EpisodesComponent } from './episodes.component';
import { EpisodeComponent } from './components/episode/episode.component';
import { EpisodeAddComponent } from './components/episode-add/episode-add.component';
import { EpisodeListComponent } from './components/episode-list/episode-list.component';


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
