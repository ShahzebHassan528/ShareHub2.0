import { formatDistanceToNow } from 'date-fns';
import './NotificationItem.css';

const NotificationItem = ({ notification, onClick }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'swap_request':
      case 'swap_accepted':
      case 'swap_rejected':
        return '⇄';
      case 'donation_accepted':
      case 'donation_rejected':
        return '❤️';
      case 'product_moderation':
        return '📦';
      case 'system':
        return '🔔';
      default:
        return '📬';
    }
  };

  const getTypeClass = (type) => {
    if (type?.includes('swap')) return 'type-swap';
    if (type?.includes('donation')) return 'type-donation';
    if (type?.includes('product')) return 'type-product';
    return 'type-system';
  };

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div 
      className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
      onClick={() => onClick(notification)}
    >
      <div className={`notification-icon ${getTypeClass(notification.type)}`}>
        {getIcon(notification.type)}
      </div>
      
      <div className="notification-content">
        <h4 className="notification-title">{notification.title}</h4>
        <p className="notification-message">{notification.message}</p>
        
        {notification.related_entity && (
          <span className="notification-entity">
            {notification.related_entity}
          </span>
        )}
        
        <span className="notification-time">
          {formatTime(notification.created_at)}
        </span>
      </div>
      
      {!notification.is_read && (
        <div className="unread-indicator"></div>
      )}
    </div>
  );
};

export default NotificationItem;
