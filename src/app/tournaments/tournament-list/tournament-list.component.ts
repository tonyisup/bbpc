import { Component, OnInit } from '@angular/core';
import { TournamentsService } from '../services/tournaments.service';
import { Observable } from 'rxjs';
import { Tournament } from '../models/tournament';

@Component({
  selector: 'app-tournament-list',
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.scss']
})
export class TournamentListComponent implements OnInit {

  tournaments: Observable<Tournament[]>;

  constructor(
    private tournamentService: TournamentsService
  ) { }

  ngOnInit(): void {
    this.tournaments = this.tournamentService.tournaments();
  }
}
