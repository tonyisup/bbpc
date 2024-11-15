import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import RecordEpisodeAudio from "../components/common/RecordEpisodeAudio";

const Call: NextPage = () => {
  const session = useSession();
  const { data: episode } = trpc.episode.next.useQuery();
  if (!session.data?.user || !episode) return null;
  return <div>
    <RecordEpisodeAudio userId={session.data.user.id} episodeId={episode.id} />
  </div>
}

export default Call;
