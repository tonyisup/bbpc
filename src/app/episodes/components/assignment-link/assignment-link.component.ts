import { Component, Input, OnInit } from '@angular/core';
import { Assignment } from '../../models/episode';

@Component({
  selector: 'app-assignment-link',
  templateUrl: './assignment-link.component.html',
  styleUrls: ['./assignment-link.component.scss']
})
export class AssignmentLinkComponent implements OnInit {

	@Input() assignment: Assignment;
	
  constructor() { }

  ngOnInit(): void {
  }

}
