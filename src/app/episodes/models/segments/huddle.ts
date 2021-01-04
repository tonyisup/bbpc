import { Section } from "../interfaces/section";
import { Segment } from "../interfaces/segment";

export class Huddle implements Segment  {
	title: string;
	description: string;
	sections: Section[];
}
