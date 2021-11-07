import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Bracket } from '../models/bracket';
import { TournamentsService } from './tournaments.service';

@Injectable({
  providedIn: 'root'
})
export class BracketResolverService implements Resolve<Observable<Bracket>> {

  constructor(
		private tournamentService: TournamentsService,
	) { }
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<Bracket>> {
		const id = route.paramMap.get('tournament_id');
		const result = this.tournamentService.bracket(id);
		return of(result);
	}
}
