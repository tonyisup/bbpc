import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Assignment } from '../../models/episode';

@Component({
  selector: 'app-assignment-edit',
  templateUrl: './assignment-edit.component.html',
  styleUrls: ['./assignment-edit.component.scss']
})
export class AssignmentEditComponent implements OnInit {

	@Input() assignment: Assignment;
	@Output() assignmentChange = new EventEmitter<Assignment>();
  constructor() { }

  ngOnInit(): void {
  }

	save() {
		this.assignmentChange.emit(this.assignment);
	}

	removeUser() {
		this.assignment.assigner = null;
		this.save();
	}

	removeMovie() {
		this.assignment.movie = null;
		this.save();
	}
}
