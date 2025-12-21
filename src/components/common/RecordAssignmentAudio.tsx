import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Play, Send, Loader2, X, ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUploadThing } from '../../utils/uploadthing';
import { api } from '@/trpc/react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

interface RecordAssignmentAudioProps {
  userId: string;
  assignmentId: string;
  mode?: 'default' | 'compact';
}

const RecordAssignmentAudio: React.FC<RecordAssignmentAudioProps> = ({ userId, assignmentId, mode = 'default' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [showRecordings, setShowRecordings] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const utils = api.useUtils();
  const { mutate: updateAudio } = api.review.updateAudioMessage.useMutation();

  const { data: uploadInfo, refetch } = api.uploadInfo.getAssignmentUploadInfo.useQuery({
    assignmentId: assignmentId,
    userId: userId,
  });

  const { data: audioMessages, refetch: refetchMessages } = api.review.getUserAudioMessagesForAssignment.useQuery({
    userId,
    assignmentId,
  });

  const { mutate: deleteMessage } = api.review.deleteAudioMessage.useMutation({
    onSuccess: () => {
      void refetchMessages();
      void utils.review.getCountOfUserAudioMessagesForAssignment.invalidate({ userId, assignmentId });
      toast.success("Recording deleted");
    },
    onError: (err) => {
      toast.error("Failed to delete recording");
    }
  });

  const { startUpload, isUploading } = useUploadThing("audioUploader", {
    onUploadError: (error: Error) => {
      console.error("Error uploading audio:", error);
      setIsSubmitting(false);
      toast.error("Failed to upload audio. Please try again.");
    },
    onClientUploadComplete: (data) => {
      const uploadedFile = data[0];
      if (!uploadedFile) return;
      if (!uploadedFile.serverData.uploadedId) return;

      updateAudio({
        id: uploadedFile.serverData.uploadedId,
        assignmentId: assignmentId,
        fileKey: uploadedFile.key
      }, {
        onSuccess: () => {
          refetch();
          void refetchMessages();
          void utils.review.getCountOfUserAudioMessagesForAssignment.invalidate({ userId, assignmentId });
          setIsUploaded(true);
          setTimeout(() => setIsUploaded(false), 5000);
          setAudioBlob(null);
          setIsSubmitting(false);
          toast.success("Voice message submitted successfully!");
        }
      });
    },
  });

  useEffect(() => {
    // Create audio element for playback
    audioRef.current = new Audio()
    audioRef.current.onended = () => setIsPlaying(false)

    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  const startRecording = async () => {
    audioChunksRef.current = []
    setAudioBlob(null)
    setRecordingTime(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)

        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setPermissionDenied(false)

      // Clear any existing timer first
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Start timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setPermissionDenied(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current.src = audioUrl
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setActiveMessageId(null)
    }
  }

  const playMessage = (message: { id: number; fileKey: string | null }) => {
    if (!message.fileKey || !audioRef.current) return;

    if (isPlaying && activeMessageId === message.id) {
      stopPlayback();
      return;
    }

    const audioUrl = `https://utfs.io/f/${message.fileKey}`;
    audioRef.current.src = audioUrl;
    audioRef.current.play();
    setIsPlaying(true);
    setActiveMessageId(message.id);
    setAudioBlob(null); // Clear pending recording if we play an old one
  }

  const handleSubmit = async () => {
    if (!audioBlob) return

    setIsSubmitting(true)

    try {
      let fileName = 'audio-message.wav';
      if (uploadInfo) {
        const { episodeNumber, userName, movieName, messageCount } = uploadInfo;
        const safeMovieName = movieName ? movieName.replace(/[^a-zA-Z0-9]/g, '-') : 'unknown-movie';
        const safeUserName = userName ? userName.replace(/[^a-zA-Z0-9]/g, '-') : 'unknown-user';
        fileName = `${episodeNumber}-${safeUserName}-${safeMovieName}-${messageCount + 1}.wav`;
      }

      const audioFile = new File([audioBlob], fileName, { type: 'audio/wav' });
      await startUpload(
        [audioFile],
        { assignmentId: assignmentId }
      );
    } catch (error) {
      console.error("Error submitting audio:", error)
      setIsSubmitting(false)
      toast.error("Failed to submit voice message. Please try again.")
    }
  }

  const handleCancel = () => {
    // Reset the component state
    setAudioBlob(null)
    setRecordingTime(0)

    // If there's any playback happening, stop it
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const isCompact = mode === 'compact';

  const content = (
    <>
      {!isCompact && (
        <CardHeader>
          <CardTitle className="text-center">Record Assignment Audio</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("space-y-4", isCompact && "p-0")}>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowRecordings(!showRecordings)}
            title="Show/hide recordings"
            aria-label="Show/hide recordings"
            className="flex items-center justify-between text-sm text-muted-foreground w-full hover:bg-muted/50 p-1 rounded transition-colors"
          >
            <span className="flex items-center gap-1">
              {showRecordings ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Recordings: {audioMessages?.length ?? 0}
            </span>
          </button>

          {showRecordings && audioMessages && audioMessages.length > 0 && (
            <div className="flex flex-col gap-2 pl-2 border-l-2 border-muted max-h-48 overflow-y-auto">
              {audioMessages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between bg-muted/30 p-2 rounded-md group">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      title={`Play recording ${msg.id}`}
                      aria-label={`Play recording ${msg.id}`}
                      onClick={() => playMessage(msg)}
                      disabled={!msg.fileKey}
                    >
                      {isPlaying && activeMessageId === msg.id ? (
                        <Square className="h-4 w-4 fill-current" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <span className="text-xs truncate max-w-[120px]">
                      Recording #{msg.id}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive opacity-50 hover:opacity-100 transition-opacity"
                    title={`Delete recording ${msg.id}`}
                    aria-label={`Delete recording ${msg.id}`}
                    onClick={() => {
                      setPendingDeleteId(msg.id);
                      setIsConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        {permissionDenied && (
          <Alert variant="destructive">
            <AlertDescription>
              Microphone access was denied. Please allow microphone access to record a voice message.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center items-center py-8 bg-muted rounded-md relative">
          {isRecording ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-lg font-medium">Recording...</span>
              </div>
              <div className="text-2xl font-bold">{formatTime(recordingTime)}</div>
            </div>
          ) : audioBlob ? (
            <div className="text-center">
              <div className="text-lg mb-2">Recording complete</div>
              <div className="text-sm text-muted-foreground">{formatTime(recordingTime)} recorded</div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">Press record to start your voice message</div>
          )}
        </div>
      </CardContent>
      <CardFooter className={cn("flex justify-between", isCompact && "p-0 pt-4")}>
        {isRecording ? (
          <Button
            variant="destructive"
            onClick={stopRecording}
            aria-label="Stop Recording"
            title="Stop Recording"
            className="w-full">
            <Square className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        ) : audioBlob ? (
          <div className="w-full grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              aria-label="Cancel Recording"
              title="Cancel Recording"
              className="col-span-1">
              <X className={cn("h-4 w-4", !isCompact && "mr-2")} />
              {!isCompact && <span>Cancel</span>}
            </Button>
            {isPlaying ? (
              <Button
                variant="outline"
                onClick={stopPlayback}
                aria-label="Stop Playback"
                title="Stop Playback"
                className="col-span-1">
                <Square className={cn("h-4 w-4", !isCompact && "mr-2")} />
                {!isCompact && <span>Stop</span>}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={playRecording}
                aria-label="Play Recording"
                title="Play Recording"
                className="col-span-1">
                <Play className={cn("h-4 w-4", !isCompact && "mr-2")} />
                {!isCompact && <span>Preview</span>}
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              aria-label="Submit Recording"
              title="Submit Recording"
              className="col-span-1">
              {isSubmitting ? (
                <>
                  <Loader2 className={cn("h-4 w-4 animate-spin", !isCompact && "mr-2")} />
                  {!isCompact && "Sending..."}
                </>
              ) : (
                <>
                  <Send className={cn("h-4 w-4", !isCompact && "mr-2")} />
                  {!isCompact && "Submit"}
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            onClick={startRecording}
            aria-label="Start Recording"
            title="Start Recording"
            className="w-full">
            <Mic className="mr-2 h-4 w-4" />
            Record Voice Message
          </Button>
        )}
      </CardFooter>
    </>
  );

  const confirmationDialog = (
    <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Recording</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this recording? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2 flex-row justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsConfirmOpen(false);
              setPendingDeleteId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (pendingDeleteId !== null) {
                deleteMessage({ id: pendingDeleteId });
              }
              setIsConfirmOpen(false);
              setPendingDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isCompact) {
    return (
      <>
        <div className="w-full">{content}</div>
        {confirmationDialog}
      </>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        {content}
      </Card>
      {confirmationDialog}
    </>
  );
};

export default RecordAssignmentAudio;
