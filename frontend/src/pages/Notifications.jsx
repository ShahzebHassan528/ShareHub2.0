import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notification.api';
import { useToast } from '../contexts/ToastContext';
import NotificationItem from '../components/notifications/NotificationItem';
import './Notifications.css';

const Notifications = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications(filter === 'unread');
      setNotifications(data.notifications || []);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load notifications';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
        
        // Update local state
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await markAllAsRead();
      
      // Update all notifications to read
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to mark all as read';
      showToast(errorMsg, 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="container">
          <h1>Notifications</h1>
          <div className="notifications-loading">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="container">
          <h1>Notifications</h1>
          <div className="notifications-error">
            <div className="error-icon">⚠️</div>
            <h2>Failed to Load Notifications</h2>
            <p>{error}</p>
            <button onClick={fetchNotifications} className="btn-retry">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="container">
          <div className="page-header">
            <h1>Notifications</h1>
          </div>
          <div className="notifications-empty">
            <div className="empty-icon">🔔</div>
            <h2>No Notifications</h2>
            <p>
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <p className="page-subtitle">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          <div className="header-actions">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn-mark-all"
                disabled={markingAll}
              >
                {markingAll ? 'Marking...' : 'Mark All as Read'}
              </button>
            )}
          </div>
        </div>

        <div className="notifications-list">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
