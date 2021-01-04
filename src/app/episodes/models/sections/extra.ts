import { Host } from "src/app/auth/models/host";
import { Section } from "../interfaces/section";
import { Review } from "./review";

export class Extra implements Section {
	name = 'Extra';
	viewer: Host;
	review: Review;
}