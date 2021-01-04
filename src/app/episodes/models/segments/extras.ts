import { Section } from "../interfaces/section";
import { Segment } from "../interfaces/segment";

export class Extras implements Segment  {
	title: string;
	description: string;
	sections: Section[];
}
