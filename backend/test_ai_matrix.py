import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

models_to_try = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-flash-latest",
    "gemini-pro"
]

for model_name in models_to_try:
    print(f"Testing model: {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Ping")
        print(f"SUCCESS with {model_name}: {response.text[:20]}...")
        break
    except Exception as e:
        print(f"FAILED with {model_name}: {str(e)[:100]}")
