import os
from google import genai
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List
import json

load_dotenv()

GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")

class Task(BaseModel):
  name: str
  tasks: List[str]

class StandupSummary(BaseModel):
  projects: List[Task]

def get_gemini_client():
  if not GEMINI_API_KEY:
    raise Exception("Missing GEMINI_API_KEY")
  client = genai.Client(api_key=GEMINI_API_KEY)
  return client

def extract_json_string(text):
  if not text:
    return None
  text = text.strip()
  if text.startswith("```json"):
    text = text[len("```json"):].strip()
  elif text.startswith("```"):
    text = text[len("```"):].strip()
  if text.endswith("```"):
    text = text[:-3].strip()
  return text


def get_ai_response(prompt: str):
  client = get_gemini_client()
  response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
    config={"response_schema": StandupSummary}
  )

  try:
    text = None
    candidates = getattr(response, "candidates", None)
    if not candidates and isinstance(response, dict):
      candidates = response.get("candidates")
    if candidates and len(candidates) > 0:
      content = getattr(candidates[0], "content", None)
      if not content and isinstance(candidates[0], dict):
        content = candidates[0].get("content")
      if content:
        parts = getattr(content, "parts", None)
        if not parts and isinstance(content, dict):
          parts = content.get("parts")
        if parts and len(parts) > 0:
          text = getattr(parts[0], "text", None)
          if not text and isinstance(parts[0], dict):
            text = parts[0].get("text")
    if not text and hasattr(response, "content") and getattr(response, "content"):
      text = response.content
    elif not text and hasattr(response, "data"):
      text = response.data

    text = extract_json_string(text)
    if not text:
      return None

    try:
      parsed = json.loads(text)
      return parsed
    except Exception:
      return text
  except Exception:
    return None