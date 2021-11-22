import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Extra } from '../../models/episode';

@Component({
  selector: 'app-extras-editor',
  templateUrl: './extras-editor.component.html',
  styleUrls: ['./extras-editor.component.scss']
})
export class ExtrasEditorComponent implements OnInit {

	@Input() extras: Extra[];
	@Output() extrasChange = new EventEmitter<Extra[]>();

	extra: Extra | null = null;

  constructor() { }

  ngOnInit(): void {
  }

	addExtra() {
		this.extra = new Extra();
	}
	add() {
		this.extras.push(this.extra);
		this.extrasChange.emit(this.extras);
		this.extra = null;
	}
	remove(extra: Extra) {
		this.extras = this.extras.filter(a => a !== extra);
		this.extrasChange.emit(this.extras);
	}
}
