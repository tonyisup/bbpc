import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from 'src/app/auth/services/user.service';
import { TournamentsService } from '../tournaments/services/tournaments.service';

@Injectable({
  providedIn: 'root'
})
export class RegisteredGuard implements CanActivate {
  
  constructor(
		private _tournaments: TournamentsService,
    private _users: UserService,
    private _router: Router
	) { }
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return new Promise((resolve) => {
      this._users.isSignedIn.subscribe(user => {
        this._tournaments.isRegistered(
          route.params.tournament_id,
          user.email
        ).then(registered => {
          if (registered)
            resolve(true);
          else
            resolve(this._router.createUrlTree(['/tournaments/register', { tournament_id: route.params.tournament_id }]));
        })
      });
    });
  }
  
}
