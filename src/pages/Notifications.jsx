import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Bell, Calendar } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get('/api/notifications');
        setNotifications(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications.');
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="notifications-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Bell size={28} color="var(--primary-color)" />
        <h1 style={{ margin: 0 }}>{t('notifications')}</h1>
      </div>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : notifications.length === 0 ? (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Bell size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>لا توجد إشعارات</h3>
          <p style={{ color: 'var(--text-secondary)' }}>ستظهر هنا أي رسائل أو إعلانات هامة من الإدارة.</p>
        </div>
      ) : (
        <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((notif) => (
            <div key={notif._id} className="notification-card glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{notif.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={14} />
                  {new Date(notif.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{notif.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
