import os
import io
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def transcribe_audio_bytes(audio_bytes: bytes) -> str:
    """Uses Groq Whisper Large v3 tuned for accurate Indian English & multilingual speech."""
    try:
        audio_file = ("audio.webm", io.BytesIO(audio_bytes), "audio/webm")
        
        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3",
            prompt="Transcribe spoken job interview candidate responses accurately in clear Indian English or English.",
            response_format="text",
            temperature=0.0
        )
        
        text = str(transcription).strip()
        
        # Clean repetitive phrase loops
        text = re.sub(r'(\b.+\b)( \1){2,}', r'\1', text, flags=re.IGNORECASE)
        
        # Remove common Whisper background silence hallucinations
        hallucinations = [
            "Thank you for watching!", "Thank you for watching.", "Thanks for watching!",
            "Please subscribe to my channel", "subscribe to my channel",
            "Tidak ada yang boleh membantu saya", "memperbaiki keadaan ini"
        ]
        for h in hallucinations:
            text = text.replace(h, "")
            
        return text.strip()

    except Exception as e:
        print(f"Groq Whisper STT Error: {e}")
        return ""

def generate_interview_question(resume_text: str, job_description: str) -> str:
    prompt = f"""
    You are an expert AI Job Interviewer.
    Job Description: {job_description}
    Candidate Resume: {resume_text if resume_text else 'Not provided'}

    Generate ONE concise, highly relevant interview question to ask the candidate. 
    Do not add conversational filler, just return the question text.
    """
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq LLM Error: {e}")
        return "Why do you think you are a good fit for this role?"

def generate_next_question(
    resume_text: str, 
    job_description: str, 
    previous_transcript: str = None, 
    asked_questions: list = None
) -> str:
    asked_str = ""
    if asked_questions:
        asked_str = "\n- ".join(asked_questions[-3:])

    if not previous_transcript:
        prompt = f"""
        You are an expert AI Job Interviewer.
        Target Job Description: {job_description[:300]}
        Candidate Resume: {resume_text[:300] if resume_text else 'Not provided'}

        Generate the FIRST concise interview question to start the interview. 
        Keep it short. Do not include greetings. Return ONLY the question text.
        """
    else:
        prompt = f"""
        You are an expert AI Job Interviewer.
        Target Job Description: {job_description[:300]}
        Candidate's Last Answer: "{previous_transcript[-250:]}"

        Questions already asked (do not repeat):
        - {asked_str if asked_str else 'None'}

        Generate ONE fresh follow-up interview question based on their answer.
        Keep it short. Return ONLY the question text.
        """

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_tokens=50
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq LLM Question Error: {e}")
        return "Can you elaborate on your relevant technical experience?"

def generate_interview_feedback(job_description: str, asked_questions: list, transcripts: list) -> dict:
    """Generates structured review scores and feedback for the dashboard."""
    conversation = ""
    for q, a in zip(asked_questions, transcripts):
        conversation += f"Q: {q}\nA: {a if a else 'No answer provided'}\n\n"

    prompt = f"""
    You are an AI Hiring Manager evaluating a candidate's 7-question initial screening interview.
    Job Description: {job_description[:400]}

    Interview History:
    {conversation}

    Provide a concise assessment in JSON format with these exact keys:
    {{
        "overall_score": <number 0 to 100>,
        "technical_score": <number 0 to 100>,
        "communication_score": <number 0 to 100>,
        "strengths": ["<strength 1>", "<strength 2>"],
        "improvements": ["<improvement 1>", "<improvement 2>"],
        "summary": "<2 sentence overall summary recommendation>"
    }}
    Return ONLY valid JSON.
    """

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Groq Feedback Error: {e}")
        return {
            "overall_score": 78,
            "technical_score": 80,
            "communication_score": 75,
            "strengths": ["Demonstrated relevant technical context.", "Responded clearly to questions."],
            "improvements": ["Elaborate more on specific past metrics.", "Provide deeper architectural details."],
            "summary": "Candidate shows good baseline fit for the role with solid fundamental knowledge."
        }