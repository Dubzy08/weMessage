import { useState, useRef, useEffect } from "react";
import './Messenger.css';
import socket from './socket.js';
import formatMessage from '../utils/messages.js';
import { useNavigate } from "react-router-dom";
const COLORS = ["#e77c5e", "#5b8ef4", "#a85ef4", "#3ecf8e", "#f4b25b", "#f45b8e"];

function AvatarEl({ name, size = 46, colorIdx = 0 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const bg = COLORS[colorIdx % COLORS.length];
  return (
    <div className="avatar-img" style={{ width: size, height: size, background: bg, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

const CONVERSATIONS = [
  { id: 1, name: "Sofia Laurent", online: true, preview: "Sounds good! See you then 👍", time: "2m", unread: 2 },
  { id: 2, name: "James Park", online: true, preview: "Did you see the game last night?", time: "14m", unread: 0 },
  { id: 3, name: "Ari & Friends", online: false, preview: "Maya: lmaooo no way", time: "1h", unread: 5, group: true },
  { id: 4, name: "Yuki Tanaka", online: false, preview: "Let me know when you're free", time: "3h", unread: 0 },
  { id: 5, name: "Dev Team", online: false, preview: "PR is ready for review", time: "Yesterday", unread: 0, group: true },
  { id: 6, name: "Camille Dubois", online: true, preview: "Thanks! 😊", time: "Mon", unread: 0 },
];

export default function Messenger() {
  const [activeConvo, setActiveConvo] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    socket.connect();

    socket.on('message', message => {
      console.log(message);
      outputMessage(message);
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = formatMessage("me", input.trim())

    // Emit a message to the server
    socket.emit('chatMessage', newMsg);
    setInput("");
  };

  useEffect(() => {
    if(token === "undefined")
      navigate('/login');
  }, [token, navigate])

  const outputMessage = (message) => {
    setMessages(
      prev => [...prev, message]
    );
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filtered = CONVERSATIONS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const active = CONVERSATIONS[activeConvo];

  // Group consecutive messages from same sender
  const grouped = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    return {
      ...msg,
      isFirst: !prev || prev.from !== msg.from,
      isLast: !next || next.from !== msg.from,
    };
  });

  return (
    <>
      <div className="app">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h1>Messages</h1>
            <div className="search-bar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="convo-list">
            {filtered.map((c, i) => (
              <div key={c.id} className={`convo-item ${activeConvo === i ? "active" : ""}`} onClick={() => setActiveConvo(i)}>
                <div className="avatar">
                  <AvatarEl name={c.name} size={46} colorIdx={i} />
                  <div className={`avatar-dot ${c.online ? "online" : "offline"}`} />
                </div>
                <div className="convo-info">
                  <div className="convo-top">
                    <span className="convo-name">{c.name}</span>
                    <span className="convo-time">{c.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span className="convo-preview">{c.preview}</span>
                    {c.unread > 0 && <span className="unread-badge">{c.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT */}
        <div className="chat-area">
          <div className="chat-header">
            <div className="avatar">
              <AvatarEl name={active.name} size={40} colorIdx={activeConvo} />
              <div className={`avatar-dot ${active.online ? "online" : "offline"}`} style={{ borderColor: 'var(--bg)' }} />
            </div>
            <div className="chat-header-info">
              <div className="chat-header-name">{active.name}</div>
              <div className={`chat-header-status ${active.online ? "" : "offline"}`}>
                {active.online ? "Active now" : "Offline"}
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn" title="Voice call">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z" />
                </svg>
              </button>
              <button className="icon-btn" title="Video call">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </button>
              <button className="icon-btn" title="Info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </button>
            </div>
          </div>

          <div className="messages-container">
            <div className="date-divider"><span>TODAY</span></div>

            {grouped.map((msg) => (
              <div key={msg.id} className="msg-group">
                <div className={`msg-row ${msg.from}`}>
                  {msg.from === "them" ? (
                    <div className={`msg-avatar ${!msg.isLast ? "hidden" : ""}`}>
                      <AvatarEl name={active.name} size={28} colorIdx={activeConvo} />
                    </div>
                  ) : msg.from !== "me" ? (
                    <div className="msg-avatar">
                      <AvatarEl name={msg.from} size={28} colorIdx={5} />
                    </div>
                  ) : null}
                  <div className="msg-element">
                    <div className={`bubble ${msg.from} ${msg.isFirst ? `first-${msg.from}` : ""} ${msg.isLast ? `last-${msg.from}` : ""}`}>
                      {msg.text}
                    </div>
                    {msg.reaction && (
                      <div><span className="reaction">{msg.reaction}</span></div>
                    )}
                  </div>
                </div>
                {msg.isLast && (
                  <div className="msg-time" style={{ paddingLeft: msg.from === "them" ? 44 : 0, textAlign: msg.from === "me" ? "right" : "left" }}>
                    {msg.time}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="msg-row them">
                <div className="msg-avatar">
                  <AvatarEl name={active.name} size={28} colorIdx={activeConvo} />
                </div>
                <div className="bubble them" style={{ padding: '12px 16px' }}>
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <div className="input-wrapper">
              <button className="attach-btn" title="Attach file">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <textarea
                className="msg-input"
                placeholder={`Message ${active.name.split(" ")[0]}...`}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                style={{ height: 'auto' }}
              />
              <div className="input-actions">
                <button className="emoji-btn" title="Emoji">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </button>
              </div>
            </div>
            <button className="send-btn" onClick={handleSend} disabled={!input.trim()} title="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
