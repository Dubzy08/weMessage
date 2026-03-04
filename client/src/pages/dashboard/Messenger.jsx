import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from './socket.js';
import formatMessage from '../utils/messages.js';
import SearchBar from "./SearchBar.jsx";
import './Messenger.css';

const COLORS = ["#e77c5e", "#5b8ef4", "#a85ef4", "#3ecf8e", "#f4b25b", "#f45b8e"];

function AvatarEl({ name, size = 46, color = "#0083ae" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const bg = color;
  return (
    <div className="avatar-img" style={{ width: size, height: size, background: bg, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

export default function Messenger() {
  const [conversations, setConversations] = useState([])
  const [activeConvo, setActiveConvo] = useState();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const apiUrl = import.meta.env.VITE_WEMESSAGE_API_URL;
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const activeUser = JSON.parse(sessionStorage.getItem('user'));
  const previousConvo = useRef(null);

  useEffect(() => {
    if (!token || token === "undefined")
      navigate('/login');
  }, [token, navigate])

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetch(`${apiUrl}/messages/conversations/${activeUser.id}`)
        const dbConvos = await res.json();
        const namedConvos = dbConvos.map((c, i) => ({
          ...c,
          name: c.isGroup 
            ? c.groupName 
            : c.participantData?.find(p => p._id !== activeUser.id)?.name || "Unknown",
          color: COLORS[i % COLORS.length],
          online: false,
        }));
        setConversations(namedConvos);
        setActiveConvo(namedConvos[0]?._id);
      } catch (error) {
        console.error('Failed to load conversations:', error);
        setConversations(null)
        setActiveConvo(null);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [activeUser?.id])
 
  useEffect(() => {
    
    socket.connect();
    
    socket.on('message', message => {
      console.log(message);
    });
    
    socket.on('chatMessage', message =>{
      outputMessage(message);
    });
    
    return () => {
      socket.off('message');
      socket.off('chatMessage');
    };
  }, []);
  
  const outputMessage = (message) => {
    setMessages(
      prev => [...prev, message]
    );
  }

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch(`${apiUrl}/messages/messages/${activeConvo}`);
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    if (activeConvo) {
      if (previousConvo.current) {
          socket.emit('leaveRoom', previousConvo.current);
      }
      socket.emit('joinRoom', activeConvo);
      previousConvo.current = activeConvo;
      loadMessages();
    }
  }, [activeConvo]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = formatMessage(activeConvo, activeUser.id, input.trim());

    // Emit a message to the server
    outputMessage(newMsg);
    socket.emit('chatMessage', newMsg);
    setInput("");
  };

  const getConvoName = (convo, activeUser) => {
    if (convo.isGroup) return convo.groupName;
    const other = convo.participantData?.find(p => p._id !== activeUser);
    return other?.name || "Unknown";
  }

  const calculateUnreadTime = (convo) => {
    // Implement time between message sent and current time
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleActiveConvo = (convo) => {
    setActiveConvo(convo._id);
  }

  const handleStartConvo = async (user) => {
        try {
            const res = await fetch(`${apiUrl}/messages/conversations/dm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId_a: activeUser.id, userId_b: user._id })
            });
            const convo = await res.json();
            setSearch('');
            setSearchResults([]);
            setActiveConvo(convo._id);
        } catch (error) {
            console.error('Failed to start conversation:', error);
        }
    };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    socket.disconnect();
    navigate('/login');
  }

  const active = conversations.find(c => c._id === activeConvo);

  // Group consecutive messages from same sender
  const grouped = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    
    const sameGroupPrev = prev && prev.from === msg.from && 
    (new Date(msg.time) - new Date(prev.time)) < 5 * 60 * 1000;

    const sameGroupNext = next && next.from === msg.from && 
      (new Date(next.time) - new Date(msg.time)) < 5 * 60 * 1000;

    return {
      ...msg,
      isFirst: !sameGroupPrev,
      isLast: !sameGroupNext,
    };
  });

  if (loading) return <div className="app"><div className="loading">Loading...</div></div>;
  return (
    <>
      <div className="app">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h1>Messages</h1>
              <div style={{ position: 'relative' }}>
                <button className="icon-btn" onClick={() => setShowSettings(prev => !prev)} title="Settings">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
                {showSettings && (
                  <div className="settings-dropdown">
                    <button className="settings-item logout" onClick={handleLogout}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
            <SearchBar onSelectUser={handleStartConvo}/>
          </div>

          <div className="convo-list">
            {conversations.map((c, i) => (
              <div key={c._id} className={`convo-item ${activeConvo === c.id ? "active" : ""}`} onClick={() => handleActiveConvo(c)}>
                <div className="avatar">
                  <AvatarEl name={getConvoName(c, activeUser.id)} size={46} color={c.color} />
                  <div className={`avatar-dot ${c.online ? "online" : "offline"}`} />
                </div>
                <div className="convo-info">
                  <div className="convo-top">
                    <span className="convo-name">{getConvoName(c, activeUser.id)}</span>
                    <span className="convo-time">{c.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span className="convo-preview">{c.lastMessage?.text || c.preview}</span>
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
              <AvatarEl name={active.name} size={40} color={active.color} />
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

            {grouped.map((msg) => {
              const isMe = msg.from === activeUser.id;

              return (
                <div key={msg.id} className="msg-group">
                  <div className={`msg-row ${isMe ? "me" : "them"}`}>

                    {/* Avatar: only for others, only on last bubble */}
                    {!isMe && (
                      <div className={`msg-avatar ${!msg.isLast ? "hidden" : ""}`}>
                        <AvatarEl name={active.name} size={28} colorIdx={activeConvo} />
                      </div>
                    )}

                    <div className="msg-element">
                      <div className={`bubble ${isMe ? "me" : ""} ${msg.isFirst ? `first-${isMe ? "me" : "them"}` : ""} ${msg.isLast ? `last-${isMe ? "me" : "them"}` : ""}`}>
                        {msg.text}
                      </div>
                      {msg.reaction && (
                        <div><span className="reaction">{msg.reaction}</span></div>
                      )}
                    </div>

                  </div>

                  {msg.isLast && (
                    <div className="msg-time" style={{
                      paddingLeft: !isMe ? 44 : 0,
                      textAlign: isMe ? "right" : "left"
                    }}>
                      {new Date(msg.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<span> </span>
                      {new Date(msg.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  )}
                </div>
              );
            })}

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

export { Messenger, AvatarEl }