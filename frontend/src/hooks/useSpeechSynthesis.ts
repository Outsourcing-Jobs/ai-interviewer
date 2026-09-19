import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechSynthesisHookOptions {
    defaultLang?: string;
    onEnd?: () => void;
}

export const useSpeechSynthesis = (options: SpeechSynthesisHookOptions = {}) => {
    const { defaultLang = "vi" } = options;
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRate] = useState<number>(() => {
        const saved = localStorage.getItem("ai_interview_speech_rate");
        return saved ? parseFloat(saved) : 1.0;
    });
    const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
        const saved = localStorage.getItem("ai_interview_auto_speak");
        return saved !== null ? saved === "true" : true;
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isStoppedRef = useRef<boolean>(false);
    const currentTextRef = useRef<string>("");
    const currentLangRef = useRef<string>(defaultLang);

    // Stop and cleanup on unmount
    useEffect(() => {
        return () => {
            isStoppedRef.current = true;
            if (audioRef.current) {
                audioRef.current.onplay = null;
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current.pause();
                audioRef.current.src = "";
            }
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const stop = useCallback(() => {
        isStoppedRef.current = true;
        if (audioRef.current) {
            audioRef.current.onplay = null;
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = "";
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setIsPaused(false);
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current && isSpeaking && !isPaused) {
            audioRef.current.pause();
            setIsPaused(true);
        } else if (typeof window !== "undefined" && "speechSynthesis" in window && isSpeaking && !isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, [isSpeaking, isPaused]);

    const resume = useCallback(() => {
        if (audioRef.current && isSpeaking && isPaused) {
            audioRef.current.play().then(() => {
                setIsPaused(false);
            }).catch(() => {
                setIsPaused(false);
            });
        } else if (typeof window !== "undefined" && "speechSynthesis" in window && isSpeaking && isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, [isSpeaking, isPaused]);

    // Fallback: Browser Web Speech Synthesis (ONLY for English or when Vietnamese voice exists)
    const speakViaBrowser = useCallback((cleanText: string, lang: string) => {
        if (isStoppedRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) {
            setIsSpeaking(false);
            return;
        }

        const isVi = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(cleanText) || lang.toLowerCase().startsWith("vi");

        const voices = window.speechSynthesis.getVoices();
        const matched = voices.filter(v => v.lang.toLowerCase().startsWith(isVi ? "vi" : "en"));

        // CRITICAL FIX: If language is Vietnamese but OS has no Vietnamese voice,
        // NEVER speak with an English voice because it will spell out letters ("m o t", "m a n g")!
        if (isVi && matched.length === 0) {
            console.warn("No native Vietnamese voice pack found in OS. Skipping browser fallback to prevent spelling letters.");
            setIsSpeaking(false);
            setIsPaused(false);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = rate;
        utterance.lang = isVi ? "vi-VN" : "en-US";

        if (matched.length > 0) {
            const premium = matched.find(v => v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Neural"));
            utterance.voice = premium || matched[0];
        }

        utterance.onstart = () => {
            if (isStoppedRef.current) {
                window.speechSynthesis.cancel();
                return;
            }
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            options.onEnd?.();
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
    }, [rate, options]);

    // Primary: Cloud Neural TTS Stream (Natural Vietnamese / English)
    const speak = useCallback((text: string, lang: string = defaultLang) => {
        stop();
        isStoppedRef.current = false;

        if (!text || text.trim().length === 0) {
            return;
        }

        currentTextRef.current = text;
        currentLangRef.current = lang;

        const cleanText = text
            .replace(/```[\s\S]*?```/g, " xem đoạn mã ")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/[*#_~>[\]()]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const isVi = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(cleanText) || lang.toLowerCase().startsWith("vi");
        const targetLang = isVi ? "vi" : "en";
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const ttsUrl = `${apiUrl}/speech/tts?text=${encodeURIComponent(cleanText)}&lang=${targetLang}`;

        try {
            if (!audioRef.current) {
                audioRef.current = new Audio();
            }

            const audio = audioRef.current;
            audio.playbackRate = rate;

            audio.onplay = () => {
                if (isStoppedRef.current) {
                    audio.pause();
                    return;
                }
                setIsSpeaking(true);
                setIsPaused(false);
            };

            audio.onended = () => {
                setIsSpeaking(false);
                setIsPaused(false);
                options.onEnd?.();
            };

            audio.onerror = (e) => {
                if (isStoppedRef.current) return;
                console.warn("Backend TTS stream failed, trying direct Google TTS stream...", e);

                // Fallback to direct client Google TTS audio stream
                const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&total=1&idx=0&textlen=${encodeURIComponent(cleanText).length}&q=${encodeURIComponent(cleanText)}`;
                audio.onerror = () => {
                    if (isStoppedRef.current) return;
                    speakViaBrowser(cleanText, targetLang);
                };
                audio.src = directUrl;
                audio.play().catch(() => {
                    if (isStoppedRef.current) return;
                    speakViaBrowser(cleanText, targetLang);
                });
            };

            audio.src = ttsUrl;
            audio.load();
            audio.play().catch(err => {
                if (isStoppedRef.current) return;
                if (err.name === "NotAllowedError") {
                    console.log("Autoplay policy: Click 'Đọc câu hỏi' to hear the question.");
                } else {
                    console.warn("Audio play failed, trying direct Google TTS:", err);
                    const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&total=1&idx=0&textlen=${encodeURIComponent(cleanText).length}&q=${encodeURIComponent(cleanText)}`;
                    audio.src = directUrl;
                    audio.play().catch(() => {
                        if (isStoppedRef.current) return;
                        speakViaBrowser(cleanText, targetLang);
                    });
                }
            });
        } catch (err) {
            if (isStoppedRef.current) return;
            console.warn("Primary TTS error:", err);
            speakViaBrowser(cleanText, targetLang);
        }
    }, [defaultLang, rate, stop, speakViaBrowser, options]);

    const updateRate = (newRate: number) => {
        setRate(newRate);
        localStorage.setItem("ai_interview_speech_rate", newRate.toString());
        if (audioRef.current && isSpeaking) {
            audioRef.current.playbackRate = newRate;
        }
    };

    const toggleAutoSpeak = () => {
        const next = !autoSpeak;
        setAutoSpeak(next);
        localStorage.setItem("ai_interview_auto_speak", next ? "true" : "false");
        if (!next && isSpeaking) {
            stop();
        }
    };

    return {
        isSpeaking,
        isPaused,
        rate,
        autoSpeak,
        isSupported: true,
        speak,
        stop,
        pause,
        resume,
        setRate: updateRate,
        toggleAutoSpeak
    };
};
