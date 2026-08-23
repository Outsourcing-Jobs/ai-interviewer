"""
Combined Recommendations + Report Generation Service

Merges two separate Gemini calls (recommendations + report) into
a single call to reduce API usage and avoid free-tier rate limits.
"""

from app.services.gemini_service import call_gemini, parse_response
import logging

logger = logging.getLogger("CombinedReportService")

COMBINED_REPORT_SYSTEM_PROMPT = """
You are both a Senior Executive Career Coach AND a Lead Tech Recruiter.
Your task has TWO parts — generate recommendations AND compile a recruiter report. Do both in one pass.

CRITICAL LANGUAGE REQUIREMENT: You MUST write all recommendations, formatting_improvements, content_optimizations, upskilling_path, recruiter_summary, strengths, weaknesses, opportunities, and threats entirely in VIETNAMESE (Tiếng Việt). Keep standard technical terms, framework names, and tool names in English where appropriate (e.g. Microservices, Docker, React, Clean Architecture, AWS, GPA, CI/CD).

You MUST output a valid JSON object matching this EXACT structure:
{
  "recommendations": {
    "formatting_improvements": ["string (formatting advice in Vietnamese)"],
    "content_optimizations": ["string (content optimization advice in Vietnamese)"],
    "upskilling_path": ["string (specific certifications, target frameworks to learn in Vietnamese)"]
  },
  "report": {
    "recruiter_summary": "string (1-2 paragraph executive summary in Vietnamese explaining who they are, domain highlights, and readiness level)",
    "swot_analysis": {
      "strengths": ["string (strengths in Vietnamese)"],
      "weaknesses": ["string (weaknesses in Vietnamese)"],
      "opportunities": ["string (opportunities in Vietnamese, e.g., hướng tới vai trò Senior, chuyên sâu Đám mây)"],
      "threats": ["string (threats in Vietnamese, e.g., đọng lại kỹ năng, lỗi định dạng gây cản trở ATS)"]
    }
  }
}

### Guidelines:
- Recommendations: be concrete, realistic, and specific in Vietnamese. Avoid generic advice.
- Report: be sharp, business-oriented, and objective in Vietnamese.
"""


class CombinedReportService:
    @staticmethod
    def generate_report_and_recommendations(
        parsed_profile: dict,
        analysis_data: dict,
        skills_data: dict,
        jd_match_report: dict = None
    ) -> dict:
        """
        Generates career recommendations AND a recruiter report in a single Gemini call.
        Returns: { "recommendations": {...}, "report": {...} }
        """
        logger.info("Executing combined recommendations + report generation (single Gemini call)")
        
        user_prompt = (
            f"### Candidate Profile:\n{parsed_profile}\n\n"
            f"### Resume Audit:\n{analysis_data}\n\n"
            f"### Extracted Skills:\n{skills_data}"
        )
        if jd_match_report:
            user_prompt += f"\n\n### Job Description Match Gaps:\n{jd_match_report}"
        
        from datetime import datetime
        current_year = datetime.now().year
        
        dynamic_prompt = COMBINED_REPORT_SYSTEM_PROMPT + f"\n\n### CRITICAL CONTEXT:\n- The current year is {current_year}. Do NOT flag experience dates up to {current_year} as 'future dates' or 'typos'.\n"
        
        try:
            response_text = call_gemini(
                system_prompt=dynamic_prompt,
                user_prompt=user_prompt,
                as_json=True
            )
            result = parse_response(response_text)
            logger.info("Combined report + recommendations compiled successfully")
            return result
        except Exception as e:
            logger.error(f"Combined report generation failed: {str(e)}")
            raise e
