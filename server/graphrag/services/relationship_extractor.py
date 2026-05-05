import requests
import json
from django.conf import settings

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# same fallback models (tested)
MODELS = ["llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma-7b-it"]


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
                        "content": "Extract relationships and return ONLY valid JSON.",
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


def extract_relationships(text: str):
    prompt = f"""
Extract relationships between entities from the text.

Return ONLY JSON like:
[
  {{
    "source": "entity1",
    "relation": "relationship",
    "target": "entity2"
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
        print("JSON parse failed:", result)
        return []
