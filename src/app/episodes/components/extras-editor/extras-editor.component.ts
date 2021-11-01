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
  constructor() { }

  ngOnInit(): void {
  }

	add(extra: Extra) {
		this.extras.push(extra);
		this.extrasChange.emit(this.extras);
	}
	remove(extra: Extra) {
		this.extras = this.extras.filter(a => a !== extra);
		this.extrasChange.emit(this.extras);
	}
}
