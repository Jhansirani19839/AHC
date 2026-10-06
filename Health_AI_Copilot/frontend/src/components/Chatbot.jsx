import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Send, Bot, User, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import SafeDisclaimer from './SafeDisclaimer';

export default function Chatbot({ patientId, initialQuestion = null }) {
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: lang === 'ta'
        ? 'வணக்கம்! நான் உங்கள் AI Health Copilot. உங்கள் ஆய்வக அறிக்கைகள், மருந்துகள் மற்றும் மருத்துவ காலவரிசையைப் பற்றி என்னிடம் கேட்கலாம். (எ.கா: "என் சமீபத்திய அறிக்கையை விளக்கு", "மாறுபட்ட அளவுகள் எவை?")'
        : 'Hello! I am your AI Health Copilot at Paavai Demo Hospital. You can ask me to explain your latest report, review flagged test values, compare records, or explain in Tamil.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const samplePrompts = [
    { en: 'Explain my latest report in simple language', ta: 'என் சமீபத்திய அறிக்கையை எளிய மொழியில் விளக்கு' },
    { en: 'What does this test value mean?', ta: 'இந்த ஆய்வக மதிப்பின் அர்த்தம் என்ன?' },
    { en: 'Which values are outside the reference range?', ta: 'எந்த அளவுகள் reference range-ஐ விட அதிகமாக உள்ளன?' },
    { en: 'Compare my latest report with my previous report', ta: 'முந்தைய அறிக்கையையும் சமீபத்திய அறிக்கையையும் ஒப்பிடு' },
    { en: 'Explain this report in Tamil', ta: 'இந்த அறிக்கையை தமிழில் விளக்கு' },
    { en: 'What is this prescription for?', ta: 'இந்த மருந்துச் சீட்டு எதற்காக?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuestion) {
      sendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  const sendMessage = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAi(textToSend, patientId, lang);
      const botMessage = {
        sender: 'bot',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: lang === 'ta'
            ? 'மன்னிக்கவும், பதிலை உருவாக்குவதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து சிறிது நேரம் கழித்து முயற்சிக்கவும்.'
            : 'I apologize, but I encountered an error retrieving this explanation. Please consult your physician at Paavai Demo Hospital.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Chatbot Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #1e40af, #0284c7)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              {t('chat')}
            </h3>
            <p style={{ fontSize: '0.72rem', opacity: 0.9, margin: 0 }}>
              {lang === 'ta' ? 'மருத்துவ ஆவண வழிகாட்டி • பாதுகாப்பான AI' : 'Context-Aware Clinical Record Assistant'}
            </p>
          </div>
        </div>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.72rem',
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: '3px 8px',
          borderRadius: '12px'
        }}>
          <Sparkles size={12} />
          {lang === 'ta' ? 'தமிழ் & English' : 'Bilingual Support'}
        </span>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ height: '360px', overflowY: 'auto' }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${m.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '0.72rem', opacity: 0.8 }}>
              {m.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
              <span>{m.sender === 'user' ? 'You' : 'AI Health Copilot'} • {m.timestamp}</span>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.86rem', lineHeight: 1.5 }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble chat-bubble-bot animate-pulse">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {lang === 'ta' ? 'மருத்துவப் பதிவுகளை ஆராய்கிறது...' : 'Consulting health records and applying safety guardrails...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="chat-suggestions">
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', width: '100%' }}>
          {lang === 'ta' ? 'பரிந்துரைக்கப்பட்ட கேள்விகள்:' : 'Suggested Questions:'}
        </span>
        {samplePrompts.map((p, i) => {
          const text = lang === 'ta' ? p.ta : p.en;
          return (
            <button
              key={i}
              className="suggestion-chip"
              onClick={() => sendMessage(text)}
            >
              {text}
            </button>
          );
        })}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="chat-input-bar"
      >
        <input
          type="text"
          className="form-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === 'ta' ? 'மருத்துவ அறிக்கைகள் பற்றி கேளுங்கள்...' : 'Ask about your lab report, medicines, or flagged values...'}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim()}
        >
          <Send size={15} />
          <span>{lang === 'ta' ? 'அனுப்பு' : 'Send'}</span>
        </button>
      </form>

      <div style={{ padding: '8px 16px', background: '#fafafa', borderTop: '1px solid var(--border-light)' }}>
        <SafeDisclaimer compact />
      </div>
    </div>
  );
}
