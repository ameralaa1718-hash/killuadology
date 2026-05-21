import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Plus, Trash2, Calendar } from 'lucide-react';
import '../admin/AdminDashboard.css';

const ManageNotifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('/api/notifications');
      setNotifications(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    try {
      setSubmitting(true);
      setFeedback({ type: '', msg: '' });
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      await axios.post('/api/notifications', { title, message }, config);
      
      setFeedback({ type: 'success', msg: 'تم إرسال الإشعار بنجاح!' });
      setTitle('');
      setMessage('');
      fetchNotifications();
    } catch (err) {
      setFeedback({ type: 'error', msg: 'حدث خطأ أثناء إرسال الإشعار.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/notifications/${id}`, config);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('فشل في حذف الإشعار');
    }
  };

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <h1>إدارة الإشعارات</h1>
        <p className="subtitle">إرسال إعلانات ورسائل لجميع الطلاب</p>
      </div>

      <div className="manage-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Create Form */}
        <div className="glass-card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Plus size={20} /> إضافة إشعار جديد
          </h2>
          
          {feedback.msg && (
            <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', backgroundColor: feedback.type === 'success' ? '#10b98120' : '#ef444420', color: feedback.type === 'success' ? '#10b981' : '#ef4444' }}>
              {feedback.msg}
            </div>
          )}

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>عنوان الإشعار</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="input-field" 
                placeholder="مثال: تحديث هام في الكورس" 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>محتوى الرسالة</label>
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className="input-field" 
                rows="5" 
                placeholder="اكتب الرسالة هنا لتظهر لجميع الطلاب..." 
                required 
              ></textarea>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'جاري الإرسال...' : 'إرسال الإشعار'}
            </button>
          </form>
        </div>

        {/* Notifications List */}
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>الإشعارات السابقة</h2>
          {loading ? (
            <p>جاري التحميل...</p>
          ) : notifications.length === 0 ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>لا توجد إشعارات سابقة.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.map((notif) => (
                <div key={notif._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{notif.title}</h3>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>{notif.message}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} />
                      {new Date(notif.createdAt).toLocaleString('ar-EG')}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDelete(notif._id)} 
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                    title="حذف الإشعار"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageNotifications;
