import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      accepted: 'status-accepted',
      rejected: 'status-rejected',
      completed: 'status-completed',
      active: 'status-active',
      inactive: 'status-inactive',
      cancelled: 'status-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'status-default';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: '⏳',
      accepted: '✓',
      rejected: '✗',
      completed: '✓',
      active: '●',
      inactive: '○',
      cancelled: '⊗'
    };
    return iconMap[status?.toLowerCase()] || '●';
  };

  if (!status) return null;

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      <span className="status-icon">{getStatusIcon(status)}</span>
      <span className="status-text">{status}</span>
    </span>
  );
};

export default StatusBadge;
