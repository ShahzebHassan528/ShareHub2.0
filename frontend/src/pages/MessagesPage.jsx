/**
 * Messages Page
 * Inbox — lists all conversations for the logged-in user
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserChats } from '../api/message.api';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
  }),
};

const MessagesPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const data = await getUserChats();
      setChats(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: '700px' }}>
        <h2 className="mb-4"><i className="bi bi-chat-dots me-2"></i>Messages</h2>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4" style={{ maxWidth: '700px' }}>
        <h2 className="mb-4"><i className="bi bi-chat-dots me-2"></i>Messages</h2>
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle me-2"></i>{error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchChats}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="container py-4" style={{ maxWidth: '700px' }} initial="hidden" animate="visible" variants={fadeUp}>
      <h2 className="mb-1"><i className="bi bi-chat-dots me-2"></i>Messages</h2>
      <p className="text-muted mb-4">Your conversations</p>

      {chats.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <i className="bi bi-chat-square-text fs-1 text-muted mb-3 d-block"></i>
          <h5 className="text-muted">No conversations yet</h5>
          <p className="text-muted">Start a conversation by messaging a seller from a product page.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          {chats.map((chat, i) => (
            <Link
              key={chat.user?.id}
              to={`/messages/${chat.user?.id}`}
              className={`text-decoration-none text-dark d-flex align-items-center px-4 py-3 ${i < chats.length - 1 ? 'border-bottom' : ''}`}
              style={{ transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white me-3 flex-shrink-0"
                style={{ width: 44, height: 44, fontSize: 18 }}
              >
                {chat.user?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">{chat.user?.full_name}</span>
                  {chat.last_message_time && (
                    <small className="text-muted">
                      {new Date(chat.last_message_time).toLocaleDateString()}
                    </small>
                  )}
                </div>
                <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.875rem' }}>
                  {chat.last_message || 'No messages yet'}
                </p>
              </div>
              {chat.unread_count > 0 && (
                <span className="badge bg-primary rounded-pill ms-2">{chat.unread_count}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MessagesPage;
