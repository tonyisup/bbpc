import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Extra } from '../../models/episode';

@Component({
  selector: 'app-extra-edit',
  templateUrl: './extra-edit.component.html',
  styleUrls: ['./extra-edit.component.scss']
})
export class ExtraEditComponent implements OnInit {

	@Input() extra: Extra;
	@Output() extraChange = new EventEmitter<Extra>();

  constructor() { }

  ngOnInit(): void {
  }

	save(): void {
		console.log('extra edit save', this.extra);
		this.extraChange.emit(this.extra);
	}

	removeUser(): void {
		this.extra.watcher = null;
		this.save();
	}

	removeMovie(): void {
		this.extra.movie = null;
		this.save();
	}
}
