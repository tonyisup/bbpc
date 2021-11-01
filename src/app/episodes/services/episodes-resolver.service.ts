import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { Episode } from '../models/episode';
import { EpisodesService } from './episodes.service';

@Injectable({
  providedIn: 'root'
})
export class EpisodesResolverService implements Resolve<Observable<Episode[]>> {

  constructor(
		private router: Router,
		private _episodesService: EpisodesService
	) { }

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<Episode[]>> {
		const result = this._episodesService.latest(6);
		if (!result) {
			this.router.navigate(['/']);
			return EMPTY;
		}
		return of(result).pipe(take(1));
	}
}
