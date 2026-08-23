from app.services.gemini_service import call_gemini, stream_gemini
import json


class ResumeGenerationService:
    @staticmethod
    def rewrite_bullet(bullet: str, resume_context: str) -> dict:
        system_prompt = """
        You are an expert Resume Writer and Career Coach.
        Your job is to take a weak or average resume bullet point and rewrite it into 3 strong, distinct variations using the STAR (Situation, Task, Action, Result) method.
        
        CRITICAL LANGUAGE REQUIREMENT: Write the rewritten bullet points in VIETNAMESE (Tiếng Việt). Keep technical terms and tool names in English where appropriate.

        Focus on:
        - Strong action verbs
        - Quantifiable metrics (even if you have to suggest placeholder metrics like [X]%)
        - Highlighting impact and results
        
        Return exactly 3 variations in a JSON format:
        {
            "variations": [
                "Rewritten bullet 1 in Vietnamese...",
                "Rewritten bullet 2 in Vietnamese...",
                "Rewritten bullet 3 in Vietnamese..."
            ]
        }
        Do not return markdown, only the raw JSON string.
        """

        user_prompt = f"""
        Original Bullet Point:
        {bullet}
        
        Resume Context (for understanding the role/industry):
        {resume_context}
        """

        try:
            response_text = call_gemini(system_prompt, user_prompt, as_json=True)
            # Try to strip markdown if Gemini accidentally included it
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            elif response_text.startswith("```"):
                response_text = response_text[3:-3]

            data = json.loads(response_text)
            return {"success": True, "variations": data.get("variations", [])}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def stream_bullet_rewrite(bullet: str, resume_context: str):
        system_prompt = """
        You are an expert Resume Writer and Career Coach.
        Your job is to take a weak or average resume bullet point and rewrite it into 3 strong, distinct variations using the STAR (Situation, Task, Action, Result) method.
        
        CRITICAL LANGUAGE REQUIREMENT: Write the rewritten bullet points in VIETNAMESE (Tiếng Việt). Keep technical terms in English.

        Focus on:
        - Strong action verbs
        - Quantifiable metrics (even if you have to suggest placeholder metrics like [X]%)
        - Highlighting impact and results
        
        Format the output clearly, returning only the text variations in Vietnamese, separated by a blank line. Do not return JSON.
        """

        user_prompt = f"""
        Original Bullet Point:
        {bullet}
        
        Resume Context (for understanding the role/industry):
        {resume_context}
        """

        for chunk in stream_gemini(system_prompt, user_prompt):
            yield chunk

    @staticmethod
    def generate_cover_letter(resume_text: str, jd_text: str) -> dict:
        system_prompt = """
        You are an elite Career Coach and Executive Writer.
        Your task is to write a highly tailored, professional, and compelling cover letter for a candidate applying to a specific job.
        
        CRITICAL LANGUAGE REQUIREMENT: Write the cover letter entirely in VIETNAMESE (Tiếng Việt). Keep technical terms and company/tool names in English where appropriate.

        Guidelines:
        1. Keep it concise (3-4 paragraphs maximum).
        2. Do not hallucinate experiences that are not in the resume.
        3. Highlight the EXACT overlapping skills between the candidate's resume and the job description.
        4. Use a confident, engaging tone.
        5. Format it clearly in Vietnamese. Use placeholders like [Tên Trưởng bộ phận Tuyển dụng] or [Tên Công ty] if they are not discernible from the JD.
        
        Return a JSON object containing the cover letter text:
        {
            "cover_letter": "Kính gửi Trưởng bộ phận Tuyển dụng,\\n\\nTôi viết thư này để bày tỏ..."
        }
        Do not return markdown, only the raw JSON string.
        """

        user_prompt = f"""
        Job Description:
        {jd_text}
        
        Candidate's Resume Text:
        {resume_text}
        """

        try:
            response_text = call_gemini(system_prompt, user_prompt, as_json=True)
            # Try to strip markdown if Gemini accidentally included it
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            elif response_text.startswith("```"):
                response_text = response_text[3:-3]

            data = json.loads(response_text)
            return {"success": True, "cover_letter": data.get("cover_letter", "")}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def stream_cover_letter(resume_text: str, jd_text: str):
        system_prompt = """
        You are an elite Career Coach and Executive Writer.
        Your task is to write a highly tailored, professional, and compelling cover letter for a candidate applying to a specific job.
        
        CRITICAL LANGUAGE REQUIREMENT: Write the cover letter entirely in VIETNAMESE (Tiếng Việt). Keep technical terms and company names in English where appropriate.

        Guidelines:
        1. Keep it concise (3-4 paragraphs maximum).
        2. Do not hallucinate experiences that are not in the resume.
        3. Highlight the EXACT overlapping skills between the candidate's resume and the job description.
        4. Use a confident, engaging tone in Vietnamese.
        5. Format it clearly. Use placeholders like [Tên Trưởng bộ phận Tuyển dụng] or [Tên Công ty] if they are not discernible from the JD.
        
        Return the cover letter as plain text in Vietnamese (with markdown formatting for paragraphs). Do not return JSON.
        """

        user_prompt = f"""
        Job Description:
        {jd_text}
        
        Candidate's Resume Text:
        {resume_text}
        """

        for chunk in stream_gemini(system_prompt, user_prompt):
            yield chunk
