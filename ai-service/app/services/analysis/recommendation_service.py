from app.services.gemini_service import call_gemini, parse_response
import logging

logger = logging.getLogger("RecommendationService")

RECOMMENDATIONS_SYSTEM_PROMPT = """
You are a senior Executive Career Coach and Resume Optimizer.
Based on the resume audit results and extracted skills, formulate highly customized, tactical, and actionable career and resume improvement recommendations.

CRITICAL LANGUAGE REQUIREMENT: You MUST write all recommendations, formatting_improvements, content_optimizations, and upskilling_path entirely in VIETNAMESE (Tiếng Việt). Keep technical terms in English.

You MUST output a valid JSON object matching the exact structure below:
{
  "formatting_improvements": ["string (formatting advice in Vietnamese)"],
  "content_optimizations": ["string (content optimization advice in Vietnamese)"],
  "upskilling_path": ["string (specific certifications, target frameworks to learn in Vietnamese)"]
}
Avoid generic advice; make each recommendation concrete, realistic, and highly professional in Vietnamese.
"""

class RecommendationService:
    @staticmethod
    def generate_recommendations(analysis_data: dict, skills_data: dict, jd_match_report: dict = None) -> dict:
        logger.info("Generating carrier and optimization recommendations")
        
        user_prompt = f"### Resume Audit Details:\n{analysis_data}\n\n### Extracted Skills:\n{skills_data}"
        if jd_match_report:
            user_prompt += f"\n\n### Job Description Match Gaps:\n{jd_match_report}"
            
        try:
            response_text = call_gemini(
                system_prompt=RECOMMENDATIONS_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                as_json=True
            )
            recommendations = parse_response(response_text)
            logger.info("Recommendations compiled successfully")
            return recommendations
        except Exception as e:
            logger.error(f"Failed to compile recommendations: {str(e)}")
            raise e
