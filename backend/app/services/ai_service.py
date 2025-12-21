import openai
from app.core.config import settings
import json

client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

class AIService:
    @staticmethod
    def transcribe_audio(file_path: str) -> str:
        # Mocking for now if key is invalid, or if file doesn't exist.
        if "mock" in settings.OPENAI_API_KEY:
            return "Cứu tôi với, tôi đang ở 123 đường ABC, nước ngập cao quá, có 3 người."
        
        try:
            with open(file_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file
                )
            return transcript.text
        except Exception as e:
            print(f"Whisper Error: {e}")
            return "Error transcribing audio."

    @staticmethod
    def extract_incident_info(text: str):
        if "mock" in settings.OPENAI_API_KEY:
             return {
                "location_desc": "123 đường ABC",
                "incident_type": "Flood",
                "priority": "high",
                "num_people": 3,
                "description": text
            }
            
        prompt = f"""
        Extract the following information from the text:
        - location_desc: The address or location description.
        - incident_type: Type of incident (Flood, Fire, Medical, Trapped, Shortage).
        - priority: Assessment (critical, high, medium, low).
        - num_people: Number of people affected (int).
        - description: Summary of the situation.
        
        Text: "{text}"
        
        Return JSON format.
        """
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                response_format={ "type": "json_object" }
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"GPT Error: {e}")
            return {}

ai_service = AIService()
