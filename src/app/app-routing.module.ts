import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FaqComponent } from './components/faq/faq.component';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
	{ path : 'faq', component: FaqComponent },
  { path: 'tournaments', loadChildren: () => import('./tournaments/tournaments.module').then(m => m.TournamentsModule) },
  { path: 'episodes', loadChildren: () => import('./episodes/episodes.module').then(m => m.EpisodesModule) },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
	{ path: '', redirectTo: '/episodes', pathMatch: 'full' },
  { 
		path: 'admin', 
		loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
		canActivate: [AdminGuard]
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
