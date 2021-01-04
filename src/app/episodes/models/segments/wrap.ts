import { Section } from "../interfaces/section";
import { Segment } from "../interfaces/segment";

export class Wrap implements Segment {
	title: string;
	description: string;
	sections: Section[];
}
