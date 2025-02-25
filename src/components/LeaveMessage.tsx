'use client'
import { useState, type FC } from "react";
import { trpc } from "../utils/trpc";
import { signIn, useSession } from "next-auth/react";
import { FaMicrophoneAlt } from "react-icons/fa";
import Modal from "./common/Modal";
import RecordEpisodeAudio from "./common/RecordEpisodeAudio";
import { api } from "@/trpc/react";

const LeaveMessage: FC = () => {
  const session = useSession();
  const { data: episode } = api.episode.next.useQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!session.data?.user) return (<>
    <button
      title="Log in to leave a message"
      className="text-red-500"
      onClick={() => signIn()}
    >
      <MicrophoneIcon />
    </button>
  </>);
  if (!episode) return null;
  const toggleModal = () => {
    setIsModalOpen(true);
  };

  return (<>
      <button 
        title="Leave a message"
        className="text-red-500"
        onClick={toggleModal}
      >
        <MicrophoneIcon />
      </button>
      <Modal
        isOpen={isModalOpen}
        titleText="Leave a message"
        setIsOpen={setIsModalOpen}
      >
        <RecordEpisodeAudio userId={session.data.user.id} episodeId={episode.id} />
      </Modal>
    </>
  );
};

const MicrophoneIcon = () => {
  
  const pulseStyle = {
    animation: 'pulse 2s infinite',
  };

  const glowStyle = {
    filter: 'drop-shadow(0 0 5px #ff0000)',
  };

  return (<div className="text-red-500">
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
      <FaMicrophoneAlt style={{...pulseStyle, ...glowStyle}} />
    </div>
  );
}

export default LeaveMessage;