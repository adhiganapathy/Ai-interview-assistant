import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mic, Square, User, ArrowRight, RefreshCw, CheckCircle2, Award, TrendingUp, Check, AlertCircle } from 'lucide-react';

export default function InterviewPage({ sessionId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);
  const [question, setQuestion] = useState('Loading your first question...');
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [savedTranscripts, setSavedTranscripts] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const MAX_QUESTIONS = 7;

  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    fetchNextQuestion('', []);

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/transcribe/${sessionId}`);
    ws.onopen = () => console.log('WebSocket connected for live streaming');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'partial_transcript' && data.text) {
        setTranscript(data.text);
      }
    };
    socketRef.current = ws;

    return () => {
      ws.close();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [sessionId]);

  const fetchNextQuestion = async (lastTranscript, currentAsked = askedQuestions) => {
    setLoadingQuestion(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/sessions/${sessionId}/next-question`, {
        previous_transcript: lastTranscript,
        asked_questions: currentAsked
      });

      const newQuestion = res.data.question;
      setQuestion(newQuestion);
      setAskedQuestions((prev) => [...prev, newQuestion]);
      speakQuestion(newQuestion);

    } catch (err) {
      console.error('Error fetching question:', err);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleNextQuestion = async () => {
    const updatedTranscripts = [...savedTranscripts, transcript];
    setSavedTranscripts(updatedTranscripts);

    if (askedQuestions.length >= MAX_QUESTIONS) {
      // Completed 7 questions -> Generate Candidate Dashboard
      setIsCompleted(true);
      setEvaluating(true);
      try {
        const res = await axios.post(`http://127.0.0.1:8000/api/sessions/${sessionId}/evaluate`, {
          asked_questions: askedQuestions,
          transcripts: updatedTranscripts
        });
        setFeedback(res.data);
      } catch (err) {
        console.error("Evaluation error:", err);
      } finally {
        setEvaluating(false);
      }
    } else {
      setTranscript('');
      fetchNextQuestion(transcript, askedQuestions);
    }
  };

  const startRecording = async () => {
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      }

      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setTimer(0);
      timerIntervalRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
    } catch (err) {
      alert('Microphone access is required: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 📊 CANDIDATE REVIEW DASHBOARD UI
  if (isCompleted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1b233a',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%',
          backgroundColor: '#27314f',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Screening Complete (7/7 Questions)
            </span>
            <h1 style={{ margin: '12px 0 6px 0', fontSize: '28px', fontWeight: '800' }}>Candidate Review Dashboard</h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Session #{sessionId} Assessment Report</p>
          </div>

          {evaluating ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <RefreshCw size={32} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
              <p style={{ margin: 0, fontSize: '16px', color: '#cbd5e1' }}>Evaluating screening responses with AI Hiring Manager...</p>
            </div>
          ) : feedback ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Score Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>OVERALL SCORE</span>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
                    {feedback.overall_score}%
                  </div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>TECHNICAL FIT</span>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>
                    {feedback.technical_score}%
                  </div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>COMMUNICATION</span>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#a78bfa', marginTop: '4px' }}>
                    {feedback.communication_score}%
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#f8fafc' }}>Recruiter Summary</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>{feedback.summary}</p>
              </div>

              {/* Strengths & Improvements */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#34d399' }}>Key Strengths</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                    {feedback.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#f87171' }}>Areas for Growth</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                    {feedback.improvements?.map((i, idx) => <li key={idx}>{i}</li>)}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Start New Interview Practice
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // 🎙️ ACTIVE INTERVIEW ROOM UI
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1b233a',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '850px',
        width: '100%',
        backgroundColor: '#27314f',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Initial Screening Interview</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Session ID: #{sessionId}</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            Question {askedQuestions.length} of {MAX_QUESTIONS}
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* AI Speech Bubble */}
            <div style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              padding: '20px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase' }}>
                  AI Screener
                </span>
                {loadingQuestion && <RefreshCw size={14} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />}
              </div>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', lineHeight: '1.5' }}>
                "{question}"
              </p>
            </div>

            {/* Controls */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '16px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}
                >
                  <Mic size={18} /> Start Answer
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}
                >
                  <Square size={18} /> Stop Recording
                </button>
              )}

              <div style={{
                fontSize: '22px',
                fontWeight: '800',
                fontFamily: 'monospace',
                color: '#f8fafc',
                backgroundColor: '#0f172a',
                padding: '6px 16px',
                borderRadius: '10px'
              }}>
                {formatTime(timer)}
              </div>
            </div>

            {/* Transcript Box */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '18px',
              borderRadius: '16px',
              minHeight: '110px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Transcription:
                </span>
                <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {transcript || (isRecording ? 'Listening to your microphone...' : 'Your spoken answer will appear here...')}
                </p>
              </div>

              {!isRecording && (
                <button
                  onClick={handleNextQuestion}
                  disabled={loadingQuestion}
                  style={{
                    marginTop: '14px',
                    alignSelf: 'flex-end',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {askedQuestions.length >= MAX_QUESTIONS ? 'Submit Answer & Finish Interview' : 'Submit & Next Question'} <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '20px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#38bdf8' }}>
                Screening Guidance:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#cbd5e1' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>7 screening questions total</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Based on job requirements</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Instant review dashboard at end</span>
                </li>
              </ul>
            </div>

            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '20px' }}>
              Groq Llama 3.3 Evaluation Engine
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}