// src/App.tsx
import { useState, useEffect } from 'react';
import './App.css';

interface ApiResponse {
  message: string;
}

function App() {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            console.error('Response:', text);
            throw new Error(`HTTP ${res.status}`);
          });
        }
        return res.json() as Promise<ApiResponse>;
      })
      .then((data) => setMessage(data.message))
      .catch((err) => console.error('Error:', err));
  }, []);

  return (
    <div className="App">
      <h1>Vite + Netlify Functions</h1>
      <p>{message || 'Loading...'}</p>
    </div>
  );
}

export default App;