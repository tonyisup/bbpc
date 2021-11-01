import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { Episode } from '../models/episode';
import { EpisodesService } from './episodes.service';

@Injectable({
  providedIn: 'root'
})
export class EpisodeResolverService implements Resolve<Observable<Episode>> {

	constructor(
		private router: Router,
		private _episodesService: EpisodesService
	) { }

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<Episode>>{
		const id = route.paramMap.get('id');
		if (!id) {
			this.router.navigate(['/episodes']);
			return EMPTY;
		}
		const result = this._episodesService.getEpisode(id);
		if (!result) {
			this.router.navigate(['/episodes']);
			return EMPTY;
		}

		return of(result).pipe(take(1));
	}
}
