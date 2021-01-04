import { Host } from "src/app/auth/models/host";
import { Section } from "../interfaces/section";
import { Review } from "./review";

export class Homework implements Section {
	name = 'Homework';
	assigner: Host;
	reviews: Review[];
}
