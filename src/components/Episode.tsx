import { FC } from "react";
import { HiExternalLink } from "react-icons/hi";
import { trpc } from "../utils/trpc";
import AddEpisodeExtraModal from "./AddEpisodeExtraModal";
import HomeworkFlag from "./HomeworkFlag";
import MovieInlinePreview from "./MovieInlinePreview";
import UserTag from "./UserTag";

interface EpisodeProps {
  episodeId: string,
  allowMoreExtras?: boolean
}

const Episode: FC<EpisodeProps> = ({episodeId, allowMoreExtras = false}) => {
	const { data: isAdmin } = trpc.auth.isAdmin.useQuery();
  const { data: episode, isLoading, refetch } = trpc.episode.get.useQuery({id: episodeId})
  const handleRefresh = () => refetch();
  if (isLoading) return <span>Loading...</span>;
  return <section className="flex flex-col w-full mb-8">
    <div className="mt-4 w-full">
      <div className="flex w-full justify-center items-center gap-2">
        <h2 className="text-2xl font-bold">          
          {episode?.number} - {episode?.title}
        </h2>
        {episode?.recording && <a href={episode.recording ?? ""} target="_blank" rel="noreferrer">
          <HiExternalLink className="text-2xl" />
        </a>}
      </div>
      {episode?.description && <div className="mt-4 w-full text-center">
        <p>{episode.description}</p>
      </div>}
      {episode?.Assignment && episode.Assignment.length > 0 && <>
        <div className="mt-4 w-full text-center"><h3>Assignments</h3></div>
        <div className="flex gap-2 justify-around">
          {episode?.Assignment?.sort((a,b) => a.homework && !b.homework ? -1 : a.homework && b.homework ? 0 : 1).map((assignment) => {
            return <div key={assignment.id} className="flex flex-col items-center gap-2">
              <div className="flex gap-4">
                <HomeworkFlag homework={assignment.homework ?? false} />
                <UserTag user={assignment.User} />
              </div>
              {assignment.Movie && <MovieInlinePreview movie={assignment.Movie} />}
            </div>
          })}
        </div>
      </>}
    </div>

    <div className="mt-4 w-full">
      {episode?.Review && episode.Review.length > 0 && <>
        <div className="w-full text-center"><h3>Extras</h3></div>
        <div className="flex justify-center gap-2 flex-wrap">
          {episode?.Review?.map((review) => {
            return <div key={review.id} className="flex items-center gap-2 w-20">
              {/* <UserTag user={review.User} /> */}
              {review.Movie && <MovieInlinePreview movie={review.Movie} />}
            </div>
          })}
        </div>
      </>}      
      {allowMoreExtras && isAdmin && episode && <div className="flex justify-center items-center gap-2 w-full p-2">
            <AddEpisodeExtraModal episode={episode} refreshItems={handleRefresh} />
          </div>}
    </div>
  </section>
}

export default Episode;