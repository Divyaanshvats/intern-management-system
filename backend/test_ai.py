import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Using API Key: {api_key[:10]}...")

genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content("Hello, can you hear me?")
    print("AI Response:", response.text)
    print("SUCCESS: AI Generation is working.")
except Exception as e:
    print("FAILED: AI Generation failed.")
    print("Error details:", str(e))
