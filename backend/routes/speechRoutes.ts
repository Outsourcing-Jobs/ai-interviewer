import express, { Request, Response } from "express";

const router = express.Router();

/**
 * Clean text from markdown and code blocks
 */
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " xem đoạn mã ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*#_~>[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Detect language by Vietnamese diacritics
 */
function detectLanguage(text: string, requestedLang = "vi"): string {
  const viRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  if (viRegex.test(text)) {
    return "vi";
  }
  return requestedLang.toLowerCase().startsWith("vi") ? "vi" : "en";
}

/**
 * Split text into short speakable sentences (< 120 chars)
 */
function splitTextIntoChunks(text: string, maxLen = 120): string[] {
  const clean = cleanTextForSpeech(text);
  if (clean.length <= maxLen) return [clean];

  const sentences = clean.split(/(?<=[.?!,;\n])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + " " + sentence).trim().length <= maxLen) {
      currentChunk = (currentChunk + " " + sentence).trim();
    } else {
      if (currentChunk) chunks.push(currentChunk);
      if (sentence.length <= maxLen) {
        currentChunk = sentence;
      } else {
        const words = sentence.split(" ");
        let sub = "";
        for (const word of words) {
          if ((sub + " " + word).trim().length <= maxLen) {
            sub = (sub + " " + word).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = word;
          }
        }
        currentChunk = sub;
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks.filter(c => c.trim().length > 0);
}

/**
 * Fetch TTS audio chunk from multiple resilient providers
 */
async function fetchTTSChunk(chunk: string, lang: string): Promise<Buffer | null> {
  const encoded = encodeURIComponent(chunk);
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "stagefright/1.2 (Linux;Android 5.0)",
    "GoogleTTS/1.0"
  ];

  const len = chunk.length;
  const urls = [
    `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&total=1&idx=0&textlen=${len}&q=${encoded}`,
    `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=dict-chrome-ex&total=1&idx=0&textlen=${len}&q=${encoded}`,
    `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${lang}&total=1&idx=0&textlen=${len}&q=${encoded}`
  ];

  for (const url of urls) {
    for (const ua of userAgents) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": ua,
            "Accept": "*/*"
          },
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          if (arrayBuffer && arrayBuffer.byteLength > 100) {
            return Buffer.from(arrayBuffer);
          }
        }
      } catch (err: any) {
        // try next
      }
    }
  }

  return null;
}

/**
 * @route GET /api/speech/tts
 * @desc Generate natural Vietnamese / English speech audio from text
 */
router.get("/tts", async (req: Request, res: Response) => {
  try {
    const rawText = (req.query.text as string || "").trim();
    const requestedLang = (req.query.lang as string) || "vi";

    if (!rawText) {
      return res.status(400).json({ message: "Text parameter is required" });
    }

    const text = cleanTextForSpeech(rawText);
    const lang = detectLanguage(text, requestedLang);
    const chunks = splitTextIntoChunks(text, 120);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const buf = await fetchTTSChunk(chunk, lang);
      if (buf) {
        audioBuffers.push(buf);
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(502).json({ message: "Failed to generate speech audio from upstream" });
    }

    const combinedBuffer = Buffer.concat(audioBuffers);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", combinedBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24h
    res.send(combinedBuffer);
  } catch (error: any) {
    console.error("TTS generation error:", error.message);
    res.status(500).json({ message: "TTS service error", error: error.message });
  }
});

export default router;
