import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Bracket } from '../models/bracket';

@Component({
  selector: 'app-bracket',
  templateUrl: './bracket.component.html',
  styleUrls: ['./bracket.component.scss']
})
export class BracketComponent implements OnInit {

	@Input() bracket: Observable<Bracket> = new Observable();

  constructor(
		private route: ActivatedRoute,
	) { }

  ngOnInit(): void {
		
  }

}
