/**
 * Conversation Page
 * Chat view with a specific user
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getConversation, sendMessage } from '../api/message.api';
import { io } from 'socket.io-client';

const ConversationPage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const passedName = location.state?.userName;

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  // Socket.io real-time connection
  useEffect(() => {
    if (!currentUser?.id) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', currentUser.id);
    });

    socket.on('new_message', (msg) => {
      // Only add if it's from the current conversation partner
      if (
        (msg.sender_id === parseInt(userId) && msg.receiver_id === currentUser.id) ||
        (msg.sender_id === currentUser.id && msg.receiver_id === parseInt(userId))
      ) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?.id, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getConversation(userId);
      const msgs = data.data || [];
      setMessages(msgs);
      // Derive other user name from messages
      const other = msgs.find(m => m.sender_id === parseInt(userId) || m.receiver_id === parseInt(userId));
      if (other) {
        const name = other.sender_id === parseInt(userId)
          ? other.sender?.full_name
          : other.receiver?.full_name;
        setOtherUser({ id: parseInt(userId), full_name: name || `User #${userId}` });
      } else {
        setOtherUser({ id: parseInt(userId), full_name: passedName || `User #${userId}` });
      }
    } catch (err) {
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setSending(true);
      const data = await sendMessage(parseInt(userId), text.trim());
      const newMsg = data.data || data;
      setMessages(prev => [...prev, newMsg]);
      // Emit to receiver via socket
      if (socketRef.current) {
        socketRef.current.emit('send_message', newMsg);
      }
      setText('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: '700px' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: '700px' }}>
      {/* Header */}
      <div className="d-flex align-items-center mb-3">
        <Link to="/messages" className="btn btn-sm btn-outline-secondary me-3">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white me-2 flex-shrink-0"
          style={{ width: 36, height: 36 }}
        >
          {otherUser?.full_name?.[0]?.toUpperCase() || '?'}
        </div>
        <h5 className="mb-0">{otherUser?.full_name}</h5>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          {error}
          <button className="btn-close" onClick={() => setError(null)} />
        </div>
      )}

      {/* Message List */}
      <div
        className="card border-0 shadow-sm p-3 mb-3"
        style={{ minHeight: 400, maxHeight: 500, overflowY: 'auto' }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-chat-square fs-1 d-block mb-2"></i>
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`d-flex mb-3 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-3 ${isMine ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                  style={{ maxWidth: '75%', wordBreak: 'break-word' }}
                >
                  <p className="mb-1" style={{ fontSize: '0.925rem' }}>{msg.message}</p>
                  <small className={`d-block text-end ${isMine ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMine && (
                      <i className={`bi ms-1 ${msg.is_read ? 'bi-check2-all' : 'bi-check2'}`}></i>
                    )}
                  </small>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
          maxLength={5000}
        />
        <button type="submit" className="btn btn-primary px-3" disabled={sending || !text.trim()}>
          {sending
            ? <span className="spinner-border spinner-border-sm" />
            : <i className="bi bi-send"></i>
          }
        </button>
      </form>
    </div>
  );
};

export default ConversationPage;
