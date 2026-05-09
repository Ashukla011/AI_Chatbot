import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const { user, token, logout } = useContext(AuthContext);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join('');
      if (event.results[0].isFinal) {
        setInput((current) => `${current}${text}`.trim());
      } else {
        setInput((current) => `${current}${text}`.trim());
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error('Unexpected history format', data);
      }
    } catch (err) {
      console.error('History fetch failed', err);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1];
        setImage({ mimeType: file.type, data: base64, preview: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setImage(null);
    resetFileInput();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !image) || loading) return;

    const userMsg = { role: 'user', content: input, image };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setImage(null);
    resetFileInput();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: input,
          image: image ? { mimeType: image.mimeType, data: image.data } : undefined,
        }),
      });

      const responseText = await res.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseErr) {
        console.error('Response JSON parse failed', parseErr, responseText);
      }

      if (res.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.content || 'No answer returned.' }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message || `Error ${res.status}: ${res.statusText}` }]);
      }
    } catch (err) {
      console.error('Send message failed', err);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error. Please check your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div>
          <h3 style={{ margin: 0 }}>AI Assistant</h3>
          <small style={{ color: 'var(--text-dim)' }}>Online</small>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{user}</span>
          <button onClick={logout} className="btn" style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }}>
            Logout
          </button>
        </div>
      </header>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
              {msg.image && (
                <img
                  className="message-image"
                  src={msg.image.preview ? msg.image.preview : `data:${msg.image.mimeType};base64,${msg.image.data}`}
                  alt="Uploaded"
                />
              )}
            </div>
            {msg.role === 'assistant' && msg.content && (
              <button className="copy-btn" onClick={() => copyToClipboard(msg.content)} title="Copy message">
                📋
              </button>
            )}
          </div>
        ))}
        {loading && <div className="message assistant">Typing...</div>}
        <div ref={chatEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={sendMessage}>
        <div className="chat-controls">
          <label className="file-label">
            📷
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} />
          </label>
          <button type="button" className={`mic-btn ${isRecording ? 'recording' : ''}`} onClick={toggleRecording}>
            {isRecording ? '🎙️ Stop' : '🎙️ Voice'}
          </button>
        </div>
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="send-btn">
          Send
        </button>
      </form>
      {image && (
        <div className="image-preview-wrap">
          <img src={image.preview} alt="Preview" className="image-preview" />
          <button type="button" className="remove-image-btn" onClick={removeImage}>
            Remove image
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
