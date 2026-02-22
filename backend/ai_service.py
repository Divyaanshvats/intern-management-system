import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def generate_evaluation_report(evaluation):
    prompt = f"""
You are an HR evaluation assistant.

Generate a structured professional performance report.

Manager Rating: {evaluation.rating}
Manager Comment: {evaluation.manager_comment}

Intern Feedback: {evaluation.intern_comment}

HR Comment: {evaluation.hr_comment}
HR Rating Adjustment: {evaluation.hr_rating_adjustment}

Tasks:
1. Write a concise executive summary.
2. Highlight strengths.
3. Identify areas of improvement.
4. Flag if performance is below expectations.
5. Provide final performance verdict.
"""

    response = model.generate_content(prompt)

    return response.text
