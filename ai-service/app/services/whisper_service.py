import os
import logging
import base64
import requests
from fastapi import UploadFile
from app.services.gemini_service import get_candidate_models

logger = logging.getLogger(__name__)

# Service to handle audio transcription.
# Uses Groq Whisper API when available, with automatic failover to Gemini Audio API.

class WhisperService:
    def __init__(self):
        self.model = True  # Compatibility flag

    def load_model(self):
        """No-op kept for backward compatibility with existing startup logic."""
        pass

    def _call_groq(self, audio_bytes: bytes, filename: str) -> str:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return ""
            
        url = "https://api.groq.com/openai/v1/audio/transcriptions"
        headers = {
            "Authorization": f"Bearer {api_key}"
        }
        files = {
            "file": (filename, audio_bytes)
        }
        data = {
            "model": "whisper-large-v3-turbo",
            "response_format": "json",
            "prompt": "um, uh, ah, ahh, hmm, like, you know"
        }
        
        try:
            response = requests.post(url, headers=headers, files=files, data=data, timeout=30)
            response.raise_for_status()
            text = response.json().get("text", "")
            if text:
                logger.info(f"Groq Whisper Transcription: '{text}'")
                return text.strip()
        except Exception as e:
            logger.warning(f"Groq Transcription error (falling back to Gemini): {e}")
        return ""

    def _call_gemini_audio(self, audio_bytes: bytes, filename: str) -> str:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY is not set for audio transcription.")
            return ""

        # Determine mime type
        ext = os.path.splitext(filename)[1].lower()
        mime_map = {
            ".webm": "audio/webm",
            ".mp3": "audio/mp3",
            ".wav": "audio/wav",
            ".ogg": "audio/ogg",
            ".m4a": "audio/mp4",
            ".mp4": "audio/mp4"
        }
        mime_type = mime_map.get(ext, "audio/webm")

        b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
        candidate_models = get_candidate_models()

        for model in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": "Please transcribe the following candidate spoken interview answer verbatim into text. Output ONLY the transcription text without quotes, markdown, or extra explanations."
                            },
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": b64_audio
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1
                }
            }
            try:
                res = requests.post(url, headers=headers, json=payload, timeout=40)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            transcription = parts[0]["text"].strip()
                            logger.info(f"Gemini Audio Transcription ({model}): '{transcription}'")
                            return transcription
                else:
                    logger.warning(f"Gemini audio transcription model {model} returned status {res.status_code}")
            except Exception as err:
                logger.warning(f"Gemini audio transcription model {model} failed: {err}")
                continue

        logger.error("All audio transcription backends failed.")
        return ""

    def transcribe_bytes(self, audio_bytes: bytes, filename: str = "audio.webm") -> str:
        # Step 1: Try Groq Whisper if key exists
        text = self._call_groq(audio_bytes, filename)
        if text:
            return text

        # Step 2: Fallback to Gemini
        text = self._call_gemini_audio(audio_bytes, filename)
        return text

    def transcribe(self, file: UploadFile):
        """
        Sends audio data to Groq / Gemini for transcription.
        """
        try:
            audio_data = file.file.read()
            filename = file.filename if file.filename else "audio.webm"
            text = self.transcribe_bytes(audio_data, filename)
            return {"text": text.strip()}
        except Exception as e:
            logger.error(f"[CRITICAL] Transcription error: {e}")
            return {"text": ""}

    @classmethod
    def transcribe_audio(cls, file_path: str):
        """Synchronous helper for transcription from file path"""
        try:
            with open(file_path, "rb") as f:
                audio_data = f.read()
            filename = os.path.basename(file_path)
            
            text = whisper_service.transcribe_bytes(audio_data, filename)
            return {"text": text.strip()}
        except Exception as e:
            logger.error(f"[CRITICAL] Transcription error from path: {e}")
            return {"text": ""}

whisper_service = WhisperService()

