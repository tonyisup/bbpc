import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Play, Send, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUploadThing } from '../../utils/uploadthing';
import { api } from '@/trpc/react';

interface RecordAssignmentAudioProps {
  userId: string;
  assignmentId: string;
}

const RecordAssignmentAudio: React.FC<RecordAssignmentAudioProps> = ({ userId, assignmentId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { mutate: updateAudio } = api.review.updateAudioMessage.useMutation();

  const { data: uploadInfo, refetch } = api.uploadInfo.getAssignmentUploadInfo.useQuery({
    assignmentId: assignmentId,
    userId: userId,
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
        assignmentId: assignmentId,
        fileKey: uploadedFile.key
      }, { 
        onSuccess: () => {
          refetch();
          setIsUploaded(true);
          setTimeout(() => setIsUploaded(false), 5000);
          setAudioBlob(null);
          setIsSubmitting(false);
          alert("Voice message submitted successfully!");
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
    }
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
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Record Assignment Audio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Recordings for this assignment: {uploadInfo?.messageCount ?? 0}</span>
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
      <CardFooter className="flex justify-between">
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
  );
};

export default RecordAssignmentAudio;
