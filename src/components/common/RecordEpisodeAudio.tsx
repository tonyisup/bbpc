import React, { useState, useRef } from 'react';
import { BsRecordFill, BsStopFill, BsX } from "react-icons/bs";
import { api } from '@/trpc/react';
import { useUploadThing } from '../../utils/uploadthing';

interface RecordEpisodeAudioProps {
  userId: string;
  episodeId: string;
}

const RecordEpisodeAudio: React.FC<RecordEpisodeAudioProps> = ({ userId, episodeId: episodeId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { mutate: updateAudio } = api.episode.updateAudioMessage.useMutation();

  const { data: uploadInfo, refetch } = api.uploadInfo.getEpisodeUploadInfo.useQuery({
    episodeId: episodeId,
  });

  const { startUpload, isUploading } = useUploadThing("audioUploader", {
    onUploadError: (error: Error) => {
      console.error("Error uploading audio:", error);
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
          setAudioUrl(null);
        }
      });
    },
  });
  // const [loudness, setLoudness] = useState(0);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    // Create an audio context and analyzer
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    /* 
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
        const updateLoudness = () => {
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / dataArray.length;
          setLoudness(average);
          if (isRecording) {
            requestAnimationFrame(updateLoudness);
          }
        };
    
        updateLoudness(); */

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      audioContext.close(); // Close the audio context when done
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    setAudioUrl(null);
    stopRecording();
  }

  const handleSubmit = async () => {
    if (audioChunksRef.current.length) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

      let fileName = 'audio-message.wav';
      if (uploadInfo) {
        const { episodeNumber, userName, messageCount } = uploadInfo;
        const safeUserName = userName ? userName.replace(/[^a-zA-Z0-9]/g, '-') : 'unknown-user';
        fileName = `${episodeNumber}-${safeUserName}-${messageCount + 1}.wav`;
      }

      const audioFile = new File([audioBlob], fileName, { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', audioFile);
      await startUpload(
        [audioFile],
        { episodeId: episodeId }
      );
    }
  };

  return (<>
    <div className="flex flex-col items-center bg-gray-800 text-white p-4">
      <p>
        You have {uploadInfo?.messageCount ?? 0} messages for the next episode
      </p>
      <div className="flex flex-wrap items-center">
        <button
          type="button"
          className="cursor-pointer p-2 text-red-600 disabled:text-gray-600 rounded-md flex items-center justify-center text-8xl"
          onClick={startRecording}
          disabled={isRecording}
          title="Start Recording"
        >
          <BsRecordFill className="inline-block" />
        </button>
        <button
          type="button"
          className="cursor-pointer p-2 text-black disabled:text-gray-600 rounded-md flex items-center justify-center text-8xl"
          onClick={stopRecording}
          disabled={!isRecording}
          title="Stop Recording"
        >
          <BsStopFill className="inline-block" />
        </button>
        <button
          type="button"
          className="cursor-pointer p-2 text-red-600 disabled:text-gray-600 rounded-md flex items-center justify-center text-8xl"
          onClick={cancelRecording}
          disabled={!audioUrl}
          title="Cancel Recording"
        >
          <BsX className="inline-block" />
        </button>
      </div>
      <div className="min-h-6">
        {!isUploading && !isUploaded && !isRecording && audioUrl && !isUploading &&
          <p className="text-gray-600 text-2xl font-bold">
            Send it!
          </p>
        }
        {!isUploading && !isUploaded && !isRecording && !audioUrl &&
          <p className="text-gray-600 text-2xl font-bold">
            Standby...
          </p>
        }
        {isUploading &&
          <p className="text-yellow-600 text-2xl font-bold animate-pulse">
            Uploading...
          </p>
        }
        {isUploaded &&
          <p className="text-green-600 text-2xl font-bold">
            Uploaded!
          </p>
        }
        {isRecording &&
          <p className="text-red-600 text-2xl font-bold animate-pulse">
            Recording...
          </p>
        }
      </div>
      <div className="p-4">{<audio controls src={audioUrl ?? ""}></audio>}</div>
      <button className="cursor-pointer p-4 bg-red-600 text-gray-300 rounded-md disabled:bg-gray-500 disabled:text-gray-800" onClick={handleSubmit} disabled={!audioUrl}>
        Submit
      </button>
    </div>
  </>
  );
};

export default RecordEpisodeAudio;
