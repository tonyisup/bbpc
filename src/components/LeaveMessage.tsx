'use client'
import React, { useState, type FC, useMemo } from "react";
import { signIn, useSession } from "next-auth/react";
import { Mic, X } from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";

const VoiceMailRecorder = dynamic(() => import("./voice-mail-recorder"), { ssr: false });

const LeaveMessage: FC = () => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const shouldFetchEpisode = useMemo(() => isModalOpen && !!session?.user, [isModalOpen, session?.user]);
  const { data: episode } = api.episode.next.useQuery(undefined, { enabled: shouldFetchEpisode });

  if (!session?.user) {
    return (
      <button
        type="button"
        title="Log in to leave a message"
        className="text-red-500 hover:text-red-400 transition-colors"
        onClick={() => void signIn()}
      >
        <MicrophoneIcon />
      </button>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <button
          title="Leave a message"
          className="text-red-500 hover:text-red-400 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <MicrophoneIcon />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="text-xl font-bold">Leave a Message</DialogTitle>
        </DialogHeader>
        {episode ? (
          <VoiceMailRecorder
            episodeId={episode.id}
            userId={session.user.id}
          />
        ) : (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            Loading episode details...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const MicrophoneIcon = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse effect */}
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-20"></span>
      <Mic className="h-6 w-6 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
    </div>
  );
}

export default LeaveMessage;