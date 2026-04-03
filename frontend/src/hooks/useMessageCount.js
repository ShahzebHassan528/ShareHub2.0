import { useState, useEffect, useCallback } from 'react';
import { getUnreadCount } from '../api/message.api';
import { useAuth } from '../contexts/AuthContext';

export const useMessageCount = () => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) { setUnreadCount(0); return; }
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unread_count || 0);
    } catch {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { unreadCount, refresh: fetchCount };
};

export default useMessageCount;
