import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Play, Send, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/trpc/react"
import { useUploadThing } from "@/utils/uploadthing"
import { toast } from "sonner"

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const serviceWorkerRef = useRef<ServiceWorker | null>(null)

  const { mutate: updateAudio } = api.episode.updateAudioMessage.useMutation();
  const { data: countOfUserAudioMessagesForEpisode, refetch } = api.episode.getCountOfUserEpisodeAudioMessages.useQuery({ 
    episodeId: episodeId, 
    userId: userId 
  });

  const { startUpload, isUploading } = useUploadThing("audioUploader", {
    onUploadError: (error: Error) => {
      console.error("Error uploading audio:", error);
      setIsSubmitting(false);
      alert("Failed to upload audio. Please try again.");
    },
    onClientUploadComplete: (data) => {
      const uploadedFile = data[0];
      if (!uploadedFile) return;
      if (!uploadedFile.serverData.uploadedId) return;
      
      updateAudio({ 
        id: uploadedFile.serverData.uploadedId, 
        episodeId: episodeId,
        fileKey: uploadedFile.key
      }, { 
        onSuccess: () => {
          refetch();
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
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'STOP_RECORDING') {
        stopRecording();
      }
    });

    // Create audio element for playback
    audioRef.current = new Audio()
    audioRef.current.onended = () => setIsPlaying(false)

    // Set up media session
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Voice Message Recording',
        artist: 'BBPC',
        album: 'Voice Messages',
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (audioBlob) {
          playRecording();
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying) {
          stopPlayback();
        }
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        if (isRecording) {
          stopRecording();
        } else if (isPlaying) {
          stopPlayback();
        }
      });
    }

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

      // Clean up media session
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('stop', null);
      }
    }
  }, [audioBlob, isPlaying, isRecording])

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

      // Update media session state
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }

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

      // Update media session state
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }

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

      // Update media session state
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
    }
  }, [audioBlob])

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)

      // Update media session state
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
    }
  }, [])

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
      alert("Failed to submit voice message. Please try again.")
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

    // Update media session state
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Record Voice Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Recordings for this episode: {countOfUserAudioMessagesForEpisode}</span>
        </div>
        {permissionDenied && (
          <Alert variant="destructive">
            <AlertDescription>
              Microphone access was denied. Please allow microphone access to record a voice message.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center items-center h-32 bg-muted rounded-md relative">
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
      <CardFooter>
        {isRecording ? (
          <Button variant="destructive" onClick={stopRecording} className="w-full">
            <Square className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        ) : audioBlob ? (
          <div className="w-full grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={handleCancel} className="col-span-1">
              Cancel
            </Button>
            {isPlaying ? (
              <Button variant="outline" onClick={stopPlayback} className="col-span-1">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button variant="outline" onClick={playRecording} className="col-span-1">
                <Play className="mr-2 h-4 w-4" />
                Preview
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={isSubmitting} className="col-span-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button onClick={startRecording} className="w-full">
            <Mic className="mr-2 h-4 w-4" />
            Record Voice Message
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

