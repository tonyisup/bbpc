import { Movie } from "src/app/common/movie";
import { Section } from "../interfaces/section";
import { Review } from "./review";

export class Spoiler implements Section {
	name = 'Spoiler';
	review: Review;
	start: string;
	end: string;
}
