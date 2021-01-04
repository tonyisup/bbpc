import { Host } from "src/app/auth/models/host";
import { Movie } from "src/app/common/movie";
import { Rating } from "src/app/common/rating";
import { Section } from "../interfaces/section";

export class Review implements Section {
	name = 'Review';
	author: Host;
	movie: Movie;
	rating: Rating;
}
