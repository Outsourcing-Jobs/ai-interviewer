import requests
import os
import json
import logging
import time
import threading
from fastapi import HTTPException

# ============================================================================
# Global Rate Limiter
# ============================================================================
_rate_lock = threading.Lock()
_last_call_time: float = 0.0
MIN_CALL_INTERVAL = float(os.getenv("GEMINI_MIN_CALL_INTERVAL", "3"))

# List of priority models for automatic failover / fallback
DEFAULT_FALLBACK_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-3.7-flash",
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
]


def get_candidate_models(primary_model: str = None) -> list[str]:
    """Builds a fallback chain starting with the configured model (if any), otherwise uses DEFAULT_FALLBACK_MODELS."""
    env_model = os.getenv("MODEL_NAME")
    primary = primary_model or (env_model.strip() if env_model else None)

    if primary:
        models = [primary]
        for m in DEFAULT_FALLBACK_MODELS:
            if m not in models:
                models.append(m)
        return models
    return list(DEFAULT_FALLBACK_MODELS)


def _wait_for_rate_limit() -> None:
    """Block until at least MIN_CALL_INTERVAL seconds have elapsed since the last call."""
    global _last_call_time
    with _rate_lock:
        now = time.time()
        elapsed = now - _last_call_time
        if elapsed < MIN_CALL_INTERVAL:
            sleep_time = MIN_CALL_INTERVAL - elapsed
            print(
                f"[RATE LIMITER] Throttling — waiting {sleep_time:.1f}s before next Gemini call"
            )
            time.sleep(sleep_time)
        _last_call_time = time.time()


def call_gemini(
    system_prompt: str,
    user_prompt: str,
    as_json: bool = False,
    audio_base64: str = None,
    image_base64: str = None,
    api_key: str = None,
) -> str:
    """Shared helper to call the Gemini API with automatic multi-model fallback."""
    actual_api_key = api_key or os.getenv("GEMINI_API_KEY")
    timeout = int(os.getenv("REQUEST_TIMEOUT", "60"))
    candidate_models = get_candidate_models()

    # Build parts list
    parts = [{"text": user_prompt}]
    if audio_base64:
        parts.append(
            {
                "inline_data": {
                    "mime_type": "audio/webm",
                    "data": audio_base64,
                }
            }
        )
    if image_base64:
        parts.append(
            {
                "inline_data": {
                    "mime_type": "image/png",
                    "data": image_base64,
                }
            }
        )

    body = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": parts}],
        "generationConfig": {
            "maxOutputTokens": 8192,
            **({"responseMimeType": "application/json"} if as_json else {}),
        },
    }

    last_error_msg = ""
    last_status_code = 500

    for model_index, model_name in enumerate(candidate_models):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": actual_api_key,
        }

        max_model_retries = 2
        retry_delay = 5

        for attempt in range(max_model_retries + 1):
            _wait_for_rate_limit()

            try:
                resp = requests.post(url, json=body, headers=headers, timeout=timeout)

                if resp.status_code == 200:
                    data = resp.json()
                    candidate = data.get("candidates", [{}])[0]
                    finish_reason = candidate.get("finishReason", "UNKNOWN")
                    if finish_reason not in ("STOP", "SUCCESS"):
                        print(
                            f"[WARNING] Gemini ({model_name}) finished with reason: {finish_reason}."
                        )

                    text_output = "".join(
                        part.get("text", "")
                        for c in data.get("candidates", [])
                        for part in c.get("content", {}).get("parts", [])
                    )

                    if model_name != candidate_models[0]:
                        print(f"✅ [FALLBACK SUCCESS] Successfully completed using fallback model: '{model_name}'")

                    return text_output

                last_status_code = resp.status_code
                try:
                    error_data = resp.json()
                    err_info = error_data.get("error", {})
                    last_error_msg = f"{err_info.get('status', resp.status_code)}: {err_info.get('message', resp.text)}"
                except Exception:
                    last_error_msg = resp.text

                # If 404 (Not Found) or 429 (Quota Exceeded / Rate Limit) or 503 (Overloaded), fall back to next model
                if resp.status_code in (404, 429, 503, 500, 504):
                    next_model = (
                        candidate_models[model_index + 1]
                        if model_index + 1 < len(candidate_models)
                        else "None"
                    )
                    print(
                        f"⚠️ [MODEL FALLBACK] Model '{model_name}' failed ({resp.status_code}). Switching to: '{next_model}'..."
                    )
                    break  # Break inner retry loop to switch to next candidate model

            except requests.exceptions.RequestException as e:
                last_error_msg = str(e)
                if attempt < max_model_retries:
                    time.sleep(retry_delay)
                    continue
                break

    # If all candidate models were exhausted
    print(f"❌ [CRITICAL] All Gemini models in fallback chain failed! Last error: {last_error_msg}")
    raise HTTPException(
        status_code=last_status_code if last_status_code != 500 else 500,
        detail=f"AI Service Error: {last_error_msg}",
    )


def parse_response(text_output: str):
    """Clean and parse JSON response from the model."""
    try:
        cleaned = text_output.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        return json.loads(cleaned.strip())
    except Exception as e:
        logging.warning(
            f"Initial JSON parsing attempt failed: {e}. Falling back to brace matching."
        )

    try:
        start = text_output.find("{")
        if start != -1:
            brace_count = 0
            for i in range(start, len(text_output)):
                if text_output[i] == "{":
                    brace_count += 1
                elif text_output[i] == "}":
                    brace_count -= 1
                    if brace_count == 0:
                        try:
                            return json.loads(text_output[start : i + 1])
                        except ValueError:
                            pass
    except Exception as e:
        print(f"Failed to parse JSON: {str(e)}")

    return {}


def stream_gemini(system_prompt: str, user_prompt: str, api_key: str = None):
    """Shared helper to call the Gemini API with streaming and automatic model fallback."""
    actual_api_key = api_key or os.getenv("GEMINI_API_KEY")
    candidate_models = get_candidate_models()

    body = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "maxOutputTokens": 8192,
        },
    }

    for model_name in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:streamGenerateContent?alt=sse"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": actual_api_key,
        }

        _wait_for_rate_limit()

        try:
            resp = requests.post(url, json=body, headers=headers, stream=True, timeout=60)
            if resp.status_code == 200:
                has_yielded = False
                for line in resp.iter_lines():
                    if line:
                        decoded_line = line.decode("utf-8")
                        if decoded_line.startswith("data:"):
                            data_str = decoded_line[5:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                data_json = json.loads(data_str)
                                candidates = data_json.get("candidates", [])
                                if candidates:
                                    parts = candidates[0].get("content", {}).get("parts", [])
                                    for part in parts:
                                        text = part.get("text", "")
                                        if text:
                                            has_yielded = True
                                            yield text
                            except json.JSONDecodeError:
                                continue
                if has_yielded:
                    return
            else:
                print(
                    f"⚠️ [STREAM FALLBACK] Model '{model_name}' returned HTTP {resp.status_code}. Trying next model..."
                )
        except Exception as e:
            print(f"⚠️ [STREAM ERROR] Model '{model_name}' error: {e}. Trying next model...")

    yield "Error: All AI model endpoints in fallback chain failed to stream response."


def to_float(val, default: float = 0.0) -> float:
    """Safely coerce a value to float, handling formats like '8/10' or '8.5'."""
    try:
        return float(str(val).split("/")[0].strip())
    except (ValueError, TypeError):
        return default
