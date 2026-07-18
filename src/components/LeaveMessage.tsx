"use client";
import React, { useState, type FC, useMemo } from "react";
import { signIn, useSession } from "next-auth/react";
import { Mic } from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const VoiceMailRecorder = dynamic(() => import("./voice-mail-recorder"), {
  ssr: false,
});

const LeaveMessage: FC = () => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const shouldFetchEpisode = useMemo(
    () => isModalOpen && !!session?.user,
    [isModalOpen, session?.user]
  );
  const { data: episode } = api.episode.next.useQuery(undefined, {
    enabled: shouldFetchEpisode,
  });

  if (!session?.user) {
    return (
      <button
        type="button"
        aria-label="Log in to leave a voice message"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        onClick={() => void signIn()}
      >
        <MicrophoneIcon />
        <span className="hidden text-sm font-semibold lg:inline">
          Leave a message
        </span>
      </button>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Leave a voice message"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          onClick={() => setIsModalOpen(true)}
        >
          <MicrophoneIcon />
          <span className="hidden text-sm font-semibold lg:inline">
            Leave a message
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="text-xl font-bold">
            Leave a Message
          </DialogTitle>
        </DialogHeader>
        {episode ? (
          <VoiceMailRecorder episodeId={episode.id} userId={session.user.id} />
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
      <Mic className="h-5 w-5" aria-hidden="true" />
    </div>
  );
};

export default LeaveMessage;
