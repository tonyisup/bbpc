import { Section } from "../interfaces/section";
import { Segment } from "../interfaces/segment";
import { ExtraCredit } from "../sections/extra-credit";
import { Homework } from "../sections/homework";

export class Assignments implements Segment  {
	title: string;
	description: string;
	sections: Section[];

	constructor() {
		this.sections = [
			new Homework(),
			new ExtraCredit()
		];
	}
}
