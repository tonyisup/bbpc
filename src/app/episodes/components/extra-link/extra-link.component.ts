import { Component, Input, OnInit } from '@angular/core';
import { Extra } from '../../models/episode';

@Component({
  selector: 'app-extra-link',
  templateUrl: './extra-link.component.html',
  styleUrls: ['./extra-link.component.scss']
})
export class ExtraLinkComponent implements OnInit {

	@Input() extra: Extra;
	
  constructor() { }

  ngOnInit(): void {
  }

}
