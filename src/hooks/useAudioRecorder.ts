import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Options for the useAudioRecorder hook.
 */
interface UseAudioRecorderOptions {
	/** Optional callback triggered when recording stops, providing the resulting Blob. */
	onStop?: (blob: Blob) => void;
	/** Whether to integrate with a service worker for background state management. */
	serviceWorkerIntegration?: boolean;
}

/**
 * A custom hook for managing audio recording and playback.
 * Provides state and methods for starting/stopping recordings, monitoring volume/time,
 * and handling playback of recorded blobs or remote audio messages.
 *
 * @param options - Configuration options for the recorder.
 * @returns An object containing recorder state and control methods.
 */
export const useAudioRecorder = (options: UseAudioRecorderOptions = {}) => {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [permissionDenied, setPermissionDenied] = useState(false);
	const [activeMessageId, setActiveMessageId] = useState<number | null>(null);
	const [volume, setVolume] = useState(0);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const serviceWorkerRef = useRef<ServiceWorker | null>(null);
	const isRecordingRef = useRef(false);

	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const animationFrameRef = useRef<number | null>(null);

	// Sync ref with state for use in cleanup/event listeners
	useEffect(() => {
		isRecordingRef.current = isRecording;
	}, [isRecording]);

	const stopRecording = useCallback(() => {
		if (mediaRecorderRef.current && isRecordingRef.current) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			setVolume(0);

			if (options.serviceWorkerIntegration && serviceWorkerRef.current) {
				serviceWorkerRef.current.postMessage({
					type: 'RECORDING_STATE',
					isRecording: false,
					duration: recordingTime
				});
			}

			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}

			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}

			if (audioContextRef.current) {
				void audioContextRef.current.close();
				audioContextRef.current = null;
			}
		}
	}, [isRecording, recordingTime, options.serviceWorkerIntegration]);

	const stopPlayback = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
			setIsPlaying(false);
			setActiveMessageId(null);
		}
	}, []);

	const resetRecording = useCallback(() => {
		setAudioBlob(null);
		setRecordingTime(0);
		setVolume(0);
		stopPlayback();
	}, [stopPlayback]);

	useEffect(() => {
		// Service worker setup
		if (options.serviceWorkerIntegration && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').then(registration => {
				serviceWorkerRef.current = registration.active;
			});

			const messageHandler = (event: MessageEvent) => {
				if (event.data.type === 'STOP_RECORDING') {
					stopRecording();
				}
			};
			navigator.serviceWorker.addEventListener('message', messageHandler);

			return () => {
				navigator.serviceWorker.removeEventListener('message', messageHandler);
			};
		}
	}, [options.serviceWorkerIntegration, stopRecording]);

	useEffect(() => {
		// Audio setup
		audioRef.current = new Audio();
		audioRef.current.onended = () => setIsPlaying(false);

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			if (mediaRecorderRef.current && isRecordingRef.current) {
				mediaRecorderRef.current.stop();
			}
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = "";
			}
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			if (audioContextRef.current) {
				void audioContextRef.current.close();
			}
		};
	}, []);

	const startRecording = async () => {
		audioChunksRef.current = [];
		setAudioBlob(null);
		setRecordingTime(0);
		setVolume(0);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			// Web Audio API setup for loudness indicator
			const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			const analyser = audioContext.createAnalyser();
			const source = audioContext.createMediaStreamSource(stream);
			source.connect(analyser);
			analyser.fftSize = 256;
			const bufferLength = analyser.frequencyBinCount;
			const dataArray = new Uint8Array(bufferLength);

			audioContextRef.current = audioContext;
			analyserRef.current = analyser;

			mediaRecorderRef.current = new MediaRecorder(stream);

			mediaRecorderRef.current.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorderRef.current.onstop = () => {
				const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
				setAudioBlob(blob);
				options.onStop?.(blob);
				stream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorderRef.current.start();
			setIsRecording(true);
			isRecordingRef.current = true; // Sync immediately
			setPermissionDenied(false);

			if (audioContext.state === 'suspended') {
				await audioContext.resume();
			}

			const updateVolume = () => {
				if (!isRecordingRef.current) return;
				analyser.getByteFrequencyData(dataArray);
				let max = 0;
				for (let i = 0; i < bufferLength; i++) {
					if (dataArray[i]! > max) max = dataArray[i]!;
				}
				// Normalize to 0-100 range
				const normalizedVolume = Math.min(100, Math.round((max / 255) * 100));
				setVolume(normalizedVolume);
				animationFrameRef.current = requestAnimationFrame(updateVolume);
			};

			updateVolume();

			if (options.serviceWorkerIntegration && serviceWorkerRef.current) {
				serviceWorkerRef.current.postMessage({
					type: 'RECORDING_STATE',
					isRecording: true,
					duration: 0
				});
			}

			if (timerRef.current) {
				clearInterval(timerRef.current);
			}

			timerRef.current = setInterval(() => {
				setRecordingTime((prev) => {
					const next = prev + 1;
					if (options.serviceWorkerIntegration && serviceWorkerRef.current) {
						serviceWorkerRef.current.postMessage({
							type: 'RECORDING_STATE',
							isRecording: true,
							duration: next
						});
					}
					return next;
				});
			}, 1000);
		} catch (error) {
			console.error("Error accessing microphone:", error);
			setPermissionDenied(true);
			toast.error("Microphone access denied");
		}
	};

	const playRecording = async () => {
		if (audioBlob && audioRef.current) {
			try {
				const audioUrl = URL.createObjectURL(audioBlob);
				audioRef.current.src = audioUrl;
				await audioRef.current.play();
				setIsPlaying(true);
				setActiveMessageId(null);
			} catch (error) {
				console.error("Playback failed:", error);
				setIsPlaying(false);
				toast.error("Failed to play recording");
			}
		}
	};

	const playMessage = async (message: { id: number; fileKey: string | null }) => {
		if (!message.fileKey || !audioRef.current) return;

		if (isPlaying && activeMessageId === message.id) {
			stopPlayback();
			return;
		}

		try {
			const audioUrl = `https://utfs.io/f/${message.fileKey}`;
			audioRef.current.src = audioUrl;
			await audioRef.current.play();
			setIsPlaying(true);
			setActiveMessageId(message.id);
			setAudioBlob(null);
		} catch (error) {
			console.error("Playback failed:", error);
			setIsPlaying(false);
			setActiveMessageId(null);
			toast.error("Failed to play message");
		}
	};

	return {
		isRecording,
		recordingTime,
		audioBlob,
		isPlaying,
		permissionDenied,
		activeMessageId,
		volume,
		startRecording,
		stopRecording,
		playRecording,
		stopPlayback,
		playMessage,
		resetRecording,
		setAudioBlob,
	};
};
