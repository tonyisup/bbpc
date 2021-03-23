import { Match } from "../models/match";
import { Team } from "../models/team";
import { User } from "../../auth/models/user";

export class Tournament {
	name: string;
	id: any;
	addedOn: any;
	updatedOn: any;
	rounds: number[];
	users: User[];
	matches: Match[];
	teams: Team[];
}
