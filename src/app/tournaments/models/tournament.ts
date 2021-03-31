import { Match } from "../models/match";
import { Team } from "../models/team";
import { RegisteredUser } from "./registered-user";

export class Tournament {
	name: string;
	description: string;
	id: any;
	addedOn: any;
	updatedOn: any;
	teamlimit: number;
	rounds: number[];
	users: RegisteredUser[];
	matches: Match[];
	teams: Team[];
}
