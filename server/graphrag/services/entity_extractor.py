import requests
import json
from django.conf import settings

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# Updated working Groq models (fallback order)
MODELS = [
    "llama-3.1-8b-instant",
    "llama3-8b-8192",
    "mixtral-8x7b-32768",
    "gemma-7b-it",
]


def call_groq(prompt):
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    for model in MODELS:
        try:
            print(f"Trying model: {model}")

            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You extract entities and return ONLY valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
            }

            response = requests.post(GROQ_URL, headers=headers, json=payload)
            data = response.json()

            if "error" in data:
                print(f"Failed: {model} → {data['error']['message']}")
                continue

            return data["choices"][0]["message"]["content"]

        except Exception as e:
            print(f"Exception in {model}: {e}")
            continue

    return None


def extract_entities(text: str):
    prompt = f"""
Extract entities from the following text.

Entity Types:
Person, Organization, Product, Technology, Location, Event, Date, Concept

Return ONLY valid JSON:
[
  {{
    "name": "",
    "type": ""
  }}
]

Text:
{text}
"""

    result = call_groq(prompt)

    if not result:
        return []

    try:
        return json.loads(result)
    except Exception:
        print("JSON parse failed, raw output:", result)
        return []
