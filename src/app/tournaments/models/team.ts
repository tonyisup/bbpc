import { Movie } from "src/app/common/models/movie";
import { Video } from "src/app/common/models/video";

export class Team {
  contestant: string;
  name: string;
  link: string;
	movie: Movie;
	video: Video;
  tournament: string;
  seed: number;
  id: any;
  addedOn: any;
  updatedOn: any;
}
