import React, { useState } from 'react';
import SetupPage from './pages/SetupPage';

import InterviewPage from './pages/InterviewPage';

export default function App() {
  const [sessionId, setSessionId] = useState(null);

  return (
    <div>
      {!sessionId ? (
        <SetupPage onSessionCreated={(id) => setSessionId(id)} />
      ) : (
        <InterviewPage sessionId={sessionId} />
      )}
    </div>
  );
}