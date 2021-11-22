import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EpisodesRoutingModule } from './episodes-routing.module';
import { EpisodesComponent } from './episodes.component';
import { EpisodeComponent } from './components/episode/episode.component';
import { EpisodeAddComponent } from './components/episode-add/episode-add.component';
import { EpisodeListComponent } from './components/episode-list/episode-list.component';
import { EpisodeEditComponent } from './components/episode-edit/episode-edit.component';
import { FormsModule } from '@angular/forms';
import { AssignmentsEditorComponent } from './components/assignments-editor/assignments-editor.component';
import { ExtrasEditorComponent } from './components/extras-editor/extras-editor.component';
import { AssignmentEditComponent } from './components/assignment-edit/assignment-edit.component';
import { AuthModule } from '../auth/auth.module';
import { AppCommonModule } from '../common/app-common.module';
import { ExtraEditComponent } from './components/extra-edit/extra-edit.component';
import { ExtraLinkComponent } from './components/extra-link/extra-link.component';
import { MovieLinkComponent } from './components/movie-link/movie-link.component';
import { AssignmentLinkComponent } from './components/assignment-link/assignment-link.component';


@NgModule({
  declarations: [
		EpisodesComponent, 
		EpisodeComponent, 
		EpisodeAddComponent, 
		EpisodeListComponent, 
		EpisodeEditComponent,
		AssignmentsEditorComponent,
		ExtrasEditorComponent,
		AssignmentEditComponent,
		ExtraEditComponent,
		ExtraLinkComponent,
		MovieLinkComponent,
		AssignmentLinkComponent
	],
  imports: [
    CommonModule,
		FormsModule,
    EpisodesRoutingModule,
		AuthModule,
		AppCommonModule
  ]
})
export class EpisodesModule { }
