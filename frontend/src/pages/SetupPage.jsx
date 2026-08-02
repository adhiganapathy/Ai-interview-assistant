import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Briefcase, ArrowRight, Sparkles, ShieldCheck, CheckCircle } from 'lucide-react';

export default function SetupPage({ onSessionCreated }) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) {
      setError('Please fill in both the Job Title and Job Description.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('job_title', jobTitle);
    formData.append('job_description', jobDescription);
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/sessions/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status === 'success') {
        onSessionCreated(response.data.session_id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to create interview session. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            <Sparkles size={14} /> Next-Gen AI Technical Interviewer
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: '#ffffff' }}>
            Setup Practice Session
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            Configure target role parameters to start your interview practice session.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            fontSize: '13px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Job Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Briefcase size={16} color="#60a5fa" /> Job Title
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Full Stack Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#020617',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Job Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <FileText size={16} color="#60a5fa" /> Job Description
            </label>
            <textarea
              rows={4}
              placeholder="Paste key responsibilities or tech stack..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#020617',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Resume Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Upload size={16} color="#60a5fa" /> Upload Resume (Optional PDF)
            </label>
            <div style={{
              border: '2px dashed #1e293b',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              position: 'relative',
              backgroundColor: 'rgba(2, 6, 23, 0.6)',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%'
                }}
              />
              <Upload size={28} color="#64748b" style={{ margin: '0 auto 8px auto', display: 'block' }} />
              {resumeFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#60a5fa', fontSize: '14px', fontWeight: '500' }}>
                  <CheckCircle size={16} /> {resumeFile.name}
                </div>
              ) : (
                <>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '500', color: '#cbd5e1' }}>Click or drag & drop PDF resume</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>PDF format supported (Max 5MB)</p>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#1e293b' : '#2563eb',
              color: '#ffffff',
              fontWeight: '600',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              marginTop: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? (
              <span>Creating Session...</span>
            ) : (
              <>
                <span>Enter Interview Room</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(30, 41, 59, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <ShieldCheck size={16} color="#10b981" /> Real-time Whisper STT & Llama 3.3 Connected
        </div>

      </div>
    </div>
  );
}