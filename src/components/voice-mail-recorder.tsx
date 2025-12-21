import React, { useState, useRef, useEffect, useCallback } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/trpc/react"
import { useUploadThing } from "@/utils/uploadthing"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface VoiceMailRecorderProps {
  episodeId: string;
  userId: string;
}

export default function VoiceMailRecorder({ episodeId, userId }: VoiceMailRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [showRecordings, setShowRecordings] = useState(false)
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [notes, setNotes] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const serviceWorkerRef = useRef<ServiceWorker | null>(null)

  const utils = api.useUtils();
  const { mutate: updateAudio } = api.episode.updateAudioMessage.useMutation();

  const { data: audioMessages, refetch: refetchMessages } = api.episode.getUserAudioMessages.useQuery({
    episodeId,
  });

  const { data: countData } = api.episode.getCountOfUserEpisodeAudioMessages.useQuery({
    episodeId: episodeId,
  });

  const { mutate: deleteMessage } = api.episode.deleteAudioMessage.useMutation({
    onSuccess: () => {
      void refetchMessages();
      void utils.episode.getCountOfUserEpisodeAudioMessages.invalidate({ episodeId });
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
        episodeId: episodeId,
        fileKey: uploadedFile.key,
        notes: notes
      }, {
        onSuccess: () => {
          setNotes("");
          void refetchMessages();
          void utils.episode.getCountOfUserEpisodeAudioMessages.invalidate({ episodeId });
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
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        serviceWorkerRef.current = registration.active;
      });
    }

    // Listen for messages from service worker
    const messageHandler = (event: MessageEvent) => {
      if (event.data.type === 'STOP_RECORDING') {
        stopRecording();
      }
    };
    navigator.serviceWorker.addEventListener('message', messageHandler);

    // Create audio element for playback
    audioRef.current = new Audio()
    audioRef.current.onended = () => setIsPlaying(false)

    // Clean up on unmount
    return () => {
      navigator.serviceWorker.removeEventListener('message', messageHandler);

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
  }, [isRecording])

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

      // Notify service worker about recording state
      if (serviceWorkerRef.current) {
        serviceWorkerRef.current.postMessage({
          type: 'RECORDING_STATE',
          isRecording: true,
          duration: 0
        });
      }

      // Start timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          const newTime = prevTime + 1;
          // Update service worker with new duration
          if (serviceWorkerRef.current) {
            serviceWorkerRef.current.postMessage({
              type: 'RECORDING_STATE',
              isRecording: true,
              duration: newTime
            });
          }
          return newTime;
        });
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setPermissionDenied(true)
    }
  }

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Notify service worker about recording state
      if (serviceWorkerRef.current) {
        serviceWorkerRef.current.postMessage({
          type: 'RECORDING_STATE',
          isRecording: false,
          duration: recordingTime
        });
      }

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording, recordingTime])

  const playRecording = useCallback(() => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current.src = audioUrl
      audioRef.current.play()
      setIsPlaying(true)
      setActiveMessageId(null) // Clear active message if playing new recording
    }
  }, [audioBlob])

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setActiveMessageId(null)
    }
  }, [])

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
      const audioFile = new File([audioBlob], 'audio-message.wav', { type: 'audio/wav' });
      await startUpload(
        [audioFile],
        { episodeId: episodeId }
      );
    } catch (error) {
      console.error("Error submitting audio:", error)
      setIsSubmitting(false)
      toast.error("Failed to submit voice message. Please try again.")
    }
  }

  const handleCancel = () => {
    setAudioBlob(null)
    setRecordingTime(0)
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

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowRecordings(!showRecordings)}
          className="flex items-center justify-between text-sm text-muted-foreground w-full hover:bg-muted/50 p-2 rounded transition-colors"
        >
          <span className="flex items-center gap-1 font-medium">
            {showRecordings ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Your previous recordings: {audioMessages?.length ?? 0}
          </span>
        </button>

        {showRecordings && audioMessages && audioMessages.length > 0 && (
          <div className="flex flex-col gap-2 pl-2 border-l-2 border-muted max-h-40 overflow-y-auto">
            {audioMessages.map((msg) => (
              <div key={msg.id} className="flex items-center justify-between bg-muted/40 p-2 rounded-md group">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => playMessage(msg)}
                    disabled={!msg.fileKey}
                  >
                    {isPlaying && activeMessageId === msg.id ? (
                      <Square className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="text-xs truncate max-w-[150px]">
                    Recording #{msg.id} {msg.notes ? `- ${msg.notes}` : ""}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
            Microphone access was denied. Please allow microphone access to record.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center items-center h-32 bg-muted/50 rounded-lg relative overflow-hidden border border-dashed border-muted-foreground/20">
        {isRecording ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-lg font-medium text-red-500">Recording...</span>
            </div>
            <div className="text-2xl font-bold font-mono">{formatTime(recordingTime)}</div>
          </div>
        ) : audioBlob ? (
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground mb-1">Recording complete</div>
            <div className="text-2xl font-bold font-mono">{formatTime(recordingTime)}</div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm px-4">
            Press the button below to start your recording for the next episode.
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" className="h-7 text-[10px]" onClick={() => setNotes("Play during extras")}>Play during extras</Button>
          <Button variant="secondary" size="sm" className="h-7 text-[10px]" onClick={() => setNotes("Play before assignments")}>Play before assignments</Button>
          <Button variant="secondary" size="sm" className="h-7 text-[10px]" onClick={() => setNotes("Play after weekends")}>Play after weekends</Button>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note for the hosts (optional)..."
          className="min-h-[80px] bg-background text-sm resize-none"
        />
      </div>

      <div className="flex justify-between gap-2 pt-2">
        {isRecording ? (
          <Button variant="destructive" onClick={stopRecording} className="w-full">
            <Square className="mr-2 h-4 w-4 fill-current" />
            Stop Recording
          </Button>
        ) : audioBlob ? (
          <div className="w-full grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Cancel</span>
            </Button>
            {isPlaying ? (
              <Button variant="outline" onClick={stopPlayback}>
                <Square className="h-4 w-4 fill-current" />
                <span className="hidden sm:inline ml-2">Stop</span>
              </Button>
            ) : (
              <Button variant="outline" onClick={playRecording}>
                <Play className="h-4 w-4 fill-current" />
                <span className="hidden sm:inline ml-2">Preview</span>
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="hidden sm:inline ml-2">{isSubmitting ? "Sending..." : "Submit"}</span>
            </Button>
          </div>
        ) : (
          <Button onClick={startRecording} className="w-full">
            <Mic className="mr-2 h-4 w-4" />
            Record Voice Message
          </Button>
        )}
      </div>

      {confirmationDialog}
    </div>
  )
}
