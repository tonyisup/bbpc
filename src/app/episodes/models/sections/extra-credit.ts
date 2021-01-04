import { Host } from "src/app/auth/models/host";
import { Section } from "../interfaces/section";
import { Review } from "./review";

export class ExtraCredit implements Section {
	name = 'ExtraCredit';
	assigner: Host;
	reviews: Review[];
}