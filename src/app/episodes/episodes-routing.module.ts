import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '../guards/admin.guard';
import { EpisodeAddComponent } from './components/episode-add/episode-add.component';
import { EpisodeEditComponent } from './components/episode-edit/episode-edit.component';
import { EpisodeComponent } from './components/episode/episode.component';

import { EpisodesComponent } from './episodes.component';
import { EpisodeResolverService } from './services/episode-resolver.service';
import { EpisodesResolverService } from './services/episodes-resolver.service';

const routes: Routes = [
	{ path: 'add', component: EpisodeAddComponent, canActivate: [AdminGuard] },
	{
		path: 'edit/:id',
		component: EpisodeEditComponent,
		resolve: {
			episode: EpisodeResolverService
		},
		canActivate: [AdminGuard]
	},
	{ 
		path: ':id', 
		component: EpisodeComponent,
		resolve: {
			episode: EpisodeResolverService
		} 
	},
	{ 
		path: '', 
		component: EpisodesComponent,
		resolve: {
			episodes: EpisodesResolverService
		} 
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpisodesRoutingModule { }
