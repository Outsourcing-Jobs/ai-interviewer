from app.services.gemini_service import call_gemini, parse_response
import logging

logger = logging.getLogger("AIResumeAnalysisService")

ANALYSIS_SYSTEM_PROMPT = """
You are a senior professional Resume Auditor. Your task is to perform a style, tone, formatting, and content audit on the provided resume text.

CRITICAL LANGUAGE REQUIREMENT: You MUST write all ats_formatting_issues, tone_assessment, strengths, and weaknesses entirely in VIETNAMESE (Tiếng Việt). Keep technical terms in English.

You MUST output a valid JSON object matching the exact structure below:
{
  "ats_formatting_issues": ["string (formatting issues in Vietnamese)"],
  "readability_score": number (0-100),
  "tone_assessment": "string (tone in Vietnamese, e.g. Chuyên nghiệp)",
  "strengths": ["string (strengths in Vietnamese)"],
  "weaknesses": ["string (weaknesses in Vietnamese)"]
}
Be critical, realistic, and highly professional.
"""

class AIResumeAnalysisService:
    @staticmethod
    def analyze(raw_text: str) -> dict:
        logger.info("Executing resume audit/analysis pipeline")
        user_prompt = f"Audit the following resume text:\n\n{raw_text}"
        try:
            response_text = call_gemini(
                system_prompt=ANALYSIS_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                as_json=True
            )
            analysis_results = parse_response(response_text)
            logger.info("Resume audit completed successfully")
            return analysis_results
        except Exception as e:
            logger.error(f"Resume audit failed: {str(e)}")
            raise e
