import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const [liveTranscript, setLiveTranscript] = useState("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const recognitionRef = useRef<any>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recordedAudioUrl) {
                URL.revokeObjectURL(recordedAudioUrl);
            }
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => {});
            }
            streamRef.current?.getTracks().forEach(track => track.stop());
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    /* ignore */
                }
            }
        };
    }, [recordedAudioUrl]);

    const startRecording = useCallback(async (
        onStop: (audioBlob: Blob) => void,
        onLiveTranscript?: (text: string) => void,
        language: string = "vi"
    ) => {
        try {
            // Revoke old URL if any
            if (recordedAudioUrl) {
                URL.revokeObjectURL(recordedAudioUrl);
                setRecordedAudioUrl(null);
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // 1. Setup AudioContext for Live Audio Level Visualizer
            try {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioCtx) {
                    const audioCtx = new AudioCtx();
                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 64;
                    const source = audioCtx.createMediaStreamSource(stream);
                    source.connect(analyser);

                    audioContextRef.current = audioCtx;
                    analyserRef.current = analyser;

                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    const updateLevel = () => {
                        if (!analyserRef.current) return;
                        analyserRef.current.getByteFrequencyData(dataArray);
                        let sum = 0;
                        for (let i = 0; i < dataArray.length; i++) {
                            sum += dataArray[i];
                        }
                        const avg = sum / dataArray.length;
                        const normalized = Math.min(100, Math.round((avg / 128) * 100));
                        setAudioLevel(normalized);
                        animFrameRef.current = requestAnimationFrame(updateLevel);
                    };
                    updateLevel();
                }
            } catch (err) {
                console.warn("AudioContext visualizer initialization skipped:", err);
            }

            // 2. Setup Web Speech Recognition for Real-Time Live Transcript
            setLiveTranscript("");
            const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognitionClass) {
                try {
                    const recognition = new SpeechRecognitionClass();
                    recognition.continuous = true;
                    recognition.interimResults = true;
                    recognition.lang = language.toLowerCase().startsWith("vi") ? "vi-VN" : "en-US";

                    let accumulatedText = "";
                    recognition.onresult = (event: any) => {
                        let interim = "";
                        for (let i = event.resultIndex; i < event.results.length; ++i) {
                            if (event.results[i].isFinal) {
                                accumulatedText += " " + event.results[i][0].transcript;
                            } else {
                                interim += event.results[i][0].transcript;
                            }
                        }
                        const current = (accumulatedText + " " + interim).trim();
                        setLiveTranscript(current);
                        if (onLiveTranscript && current) {
                            onLiveTranscript(current);
                        }
                    };

                    recognition.onerror = (event: any) => {
                        if (event.error !== "no-speech") {
                            console.warn("Speech recognition warning:", event.error);
                        }
                    };

                    recognition.start();
                    recognitionRef.current = recognition;
                } catch (recErr) {
                    console.warn("Live SpeechRecognition not started:", recErr);
                }
            }

            // 3. Setup MediaRecorder
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const blobUrl = URL.createObjectURL(audioBlob);
                setRecordedAudioUrl(blobUrl);
                onStop(audioBlob);
            };

            mediaRecorderRef.current.start(1000);
            setIsRecording(true);
            setRecordingTime(0);
            timerIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } catch (error) {
            console.error("Microphone access error:", error);
            toast.error("Không thể truy cập microphone. Vui lòng cấp quyền micro cho trình duyệt!");
        }
    }, [recordedAudioUrl]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        // Stop live streams
        streamRef.current?.getTracks().forEach(track => track.stop());

        // Stop timer
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        // Stop visualizer animation frame
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }

        // Close AudioContext
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => {});
        }

        // Stop SpeechRecognition
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                /* ignore */
            }
            recognitionRef.current = null;
        }

        setAudioLevel(0);
        setIsRecording(false);
    }, []);

    const clearRecording = useCallback(() => {
        stopRecording();
        if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
            setRecordedAudioUrl(null);
        }
        setLiveTranscript("");
        setRecordingTime(0);
    }, [recordedAudioUrl, stopRecording]);

    return {
        isRecording,
        recordingTime,
        audioLevel,
        recordedAudioUrl,
        liveTranscript,
        startRecording,
        stopRecording,
        clearRecording,
        setRecordingTime
    };
};
