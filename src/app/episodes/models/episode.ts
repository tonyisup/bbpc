import { User } from "src/app/auth/models/user";
import { Movie } from "src/app/common/models/movie";

export class Episode {
	number: number;
	title: string;
	html: string;
	addedOn: any;
	updatedOn: any;
	recordedOn: any;
	publishedOn: any;
	current: Assignment[];
	next: Assignment[];
	extras: Extra[];
}

export class Assignment {
	assigner: User;
	type: string;
	movie: Movie;
}

export enum AssigmentType {
	Homework,
	ExtraCredit
}

export class Extra {
	watcher: User;
	movie: Movie;
}