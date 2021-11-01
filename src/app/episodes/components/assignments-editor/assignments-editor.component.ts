import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Assignment } from '../../models/episode';

@Component({
  selector: 'app-assignments-editor',
  templateUrl: './assignments-editor.component.html',
  styleUrls: ['./assignments-editor.component.scss']
})
export class AssignmentsEditorComponent implements OnInit {

	@Input() assignments: Assignment[] = [];
	@Output() assignmentsChange = new EventEmitter<Assignment[]>();

	assignment: Assignment | null = null;

  constructor() { }

  ngOnInit(): void {
  }

	addAssignment() {
		this.assignment = new Assignment();
	}

	add(assignment: Assignment) {
		this.assignments.push(assignment);
		this.assignmentsChange.emit(this.assignments);
	}

	remove(assignment: Assignment) {
		this.assignments = this.assignments.filter(a => a !== assignment);
		this.assignmentsChange.emit(this.assignments);
	}
}
