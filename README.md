# 🎙️ AI Technical & HR Interview Screening Assistant

An end-to-end, real-time AI-powered interview platform designed to conduct structured, 7-question initial technical and HR screening rounds. It features live audio transcription via WebSockets, dynamic question generation contextualized by candidate resumes and job descriptions, and an instant recruiter assessment dashboard.

---

## 🚀 Live Demo & Links

- **Live Application:** ([https://your-frontend-app.vercel.app](https://ai-interview-assistant-lime.vercel.app/))
- **Backend API & Swagger Docs:** [https://ai-interview-assistant-xr8k.onrender.com/docs](https://ai-interview-assistant-xr8k.onrender.com/docs)
- **GitHub Repository:** [https://github.com/adhiganapathy/Ai-interview-assistant](https://github.com/adhiganapathy/Ai-interview-assistant)

---

## 🌟 Key Features

- **Dynamic Question Generation:** Utilizes Groq's `llama-3.3-70b-versatile` to formulate 7 highly relevant, non-repetitive screening questions tailored to the candidate's resume and target job description.
- **Real-Time Voice Streaming (STT):** Streams browser audio over WebSockets directly to Groq's `whisper-large-v3` engine for low-latency live speech transcription.
- **Interactive Review Dashboard:** Evaluates candidate transcripts upon completion to provide structured overall, technical, and communication scoring alongside actionable recruiter feedback.
- **Text-to-Speech (TTS):** Integrated browser speech synthesis to read out questions naturally for an interactive mock interview experience.
- **Optimized Latency:** Pre-fetches upcoming questions in the background upon stopping speech recording to provide seamless transitions between questions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Icons & UI Components:** Lucide-React
- **HTTP & Streaming:** Axios, Native WebSockets, MediaRecorder API
- **Styling:** Modern Dark-Themed CSS UI

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Server:** Uvicorn (ASGI)
- **AI Models:** 
  - `whisper-large-v3` (Speech-to-Text via Groq API)
  - `llama-3.3-70b-versatile` (Adaptive Reasoning & Evaluation via Groq API)
- **Database / ORM:** SQLAlchemy with SQLite (local/fallback) & PostgreSQL compatibility
- **PDF Processing:** PyPDF

---

## 📁 Project Architecture

```text
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── groq_service.py   # Whisper STT & Llama generation logic
│   │   │   └── pdf_parser.py     # Resume extraction utility
│   │   ├── database.py           # SQLAlchemy setup & connection pooling
│   │   ├── models.py             # Database schemas
│   │   └── main.py               # FastAPI routes & WebSocket endpoints
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SetupPage.jsx     # Job description & resume upload form
│   │   │   └── InterviewPage.jsx # Active interview room & candidate dashboard
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md



# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv interview-env
source interview-env/bin/activate  # On Windows: interview-env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file in backend directory
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Run development server
python -m uvicorn app.main:app --reload



# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev

The frontend application will be live at http://localhost:5173.


