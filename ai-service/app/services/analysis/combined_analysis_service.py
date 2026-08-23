"""
Combined Skills Extraction + Resume Audit Service

Merges two separate Gemini calls (skills extraction + resume analysis) into
a single call to reduce API usage and avoid free-tier rate limits.
"""

from app.services.gemini_service import call_gemini, parse_response
import logging

logger = logging.getLogger("CombinedAnalysisService")

COMBINED_ANALYSIS_SYSTEM_PROMPT = """
You are a senior Talent Acquisition specialist AND professional Resume Auditor.
Your task has TWO parts — extract skills AND audit the resume. Perform both in one pass.

CRITICAL LANGUAGE REQUIREMENT: You MUST write all analysis text, ats_formatting_issues, tone_assessment, strengths, weaknesses, and industry names entirely in VIETNAMESE (Tiếng Việt). Keep standard technical terms, tool names, and framework names in English where appropriate (e.g., Microservices, Docker, React, Clean Architecture, AWS, GPA, CI/CD).

You MUST output a valid JSON object matching this EXACT structure:
{
  "skills": {
    "technical": ["string (hard tech skills, tools, frameworks, databases, languages)"],
    "soft": ["string (soft skills in Vietnamese)"]
  },
  "analysis": {
    "ats_formatting_issues": ["string (formatting warnings in Vietnamese)"],
    "readability_score": number (0-100),
    "tone_assessment": "string (tone description in Vietnamese, e.g. Chuyên nghiệp, Tự tin)",
    "strengths": ["string (key career accomplishments & strengths in Vietnamese)"],
    "weaknesses": ["string (areas for improvement in Vietnamese)"],
    "primary_industry": "string (Identify the primary industry or domain in Vietnamese, e.g., 'Kỹ thuật phần mềm (Software Engineering)', 'Khoa học dữ liệu')",
    "secondary_industry": "string (Optional secondary industry in Vietnamese, e.g., 'Điện toán đám mây (Cloud/DevOps)'. If none, leave empty)",
    "industry_scores": [
      {
        "name": "string (industry domain name in Vietnamese)",
        "score": number (0-100 score indicating how well the candidate's skills match this industry. Provide the top 3-5 industries.)
      }
    ],
    "content_balance": {
      "action_verbs_percent": number (0-100 percentage of bullet points starting with strong action verbs),
      "keywords_percent": number (0-100 percentage of industry-specific keywords density),
      "metrics_percent": number (0-100 percentage of bullet points containing quantitative metrics/numbers),
      "filler_percent": number (0-100 percentage of weak/filler words like 'helped', 'worked on', 'responsible for')
    }
  }
}

### Guidelines:
- For skills: compile comprehensive, cleaned, and standardized lists. No duplicates.
- For analysis: be critical, realistic, and highly professional in Vietnamese.
"""


class CombinedAnalysisService:
    @staticmethod
    def analyze_and_extract(raw_text: str) -> dict:
        """
        Performs skills extraction AND resume audit in a single Gemini call.
        Returns: { "skills": {...}, "analysis": {...} }
        """
        logger.info("Executing combined skills extraction + resume audit (single Gemini call)")
        from datetime import datetime
        current_year = datetime.now().year
        
        dynamic_prompt = COMBINED_ANALYSIS_SYSTEM_PROMPT + f"\n\n### CRITICAL CONTEXT:\n- The current year is {current_year}. Do NOT flag experience dates up to {current_year} as 'future dates' or 'typos'.\n"
        
        user_prompt = f"Extract all skills AND perform a full resume audit on the following resume text:\n\n{raw_text}"
        try:
            response_text = call_gemini(
                system_prompt=dynamic_prompt,
                user_prompt=user_prompt,
                as_json=True
            )
            result = parse_response(response_text)
            
            skills = result.get("skills", {"technical": [], "soft": []})
            analysis = result.get("analysis", {})
            
            logger.info(
                f"Combined analysis completed: {len(skills.get('technical', []))} tech skills, "
                f"{len(skills.get('soft', []))} soft skills, "
                f"readability={analysis.get('readability_score', 'N/A')}"
            )
            return result
        except Exception as e:
            logger.error(f"Combined analysis failed: {str(e)}")
            raise e
