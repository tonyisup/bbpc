import { Component, OnInit } from '@angular/core';
import { TournamentsService } from '../services/tournaments.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tournament-list',
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.scss']
})
export class TournamentListComponent implements OnInit {

  tournaments: Observable<any[]>;

  constructor(
    private tournamentService: TournamentsService
  ) { }

  ngOnInit(): void {
    this.tournaments = this.tournamentService.tournaments();
  }
}
