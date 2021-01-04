import { Listener } from "src/app/auth/models/listener";
import { Section } from "../interfaces/section";

export class Call implements Section {
	name = 'Call';
	caller: Listener;
}