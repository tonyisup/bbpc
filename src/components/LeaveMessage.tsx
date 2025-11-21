'use client'
import { useState, type FC, useMemo } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { FaMicrophoneAlt } from "react-icons/fa";
import dynamic from "next/dynamic";
import { api } from "@/trpc/react";

const Modal = dynamic(() => import("./common/Modal"), { ssr: false });
const VoiceMailRecorder = dynamic(() => import("./voice-mail-recorder"), { ssr: false });

const LeaveMessage: FC = () => {
  const { user, isSignedIn } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const shouldFetchEpisode = useMemo(() => isModalOpen && isSignedIn, [isModalOpen, isSignedIn]);
  const { data: episode } = api.episode.next.useQuery(undefined, { enabled: shouldFetchEpisode });

  if (!isSignedIn || !user) return (<>
    <SignInButton mode="modal">
      <button
        title="Log in to leave a message"
        className="text-red-500"
      >
        <MicrophoneIcon />
      </button>
    </SignInButton>
  </>);
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
        {episode && (
          <VoiceMailRecorder 
            episodeId={episode.id} 
            userId={user.id}
          />
        )}
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
