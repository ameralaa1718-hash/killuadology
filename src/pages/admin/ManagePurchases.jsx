import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import '../admin/AdminDashboard.css';
import '../admin/AdminModal.css';

const ManagePurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const { data } = await axios.get('/api/admin/purchases');
      setPurchases(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/purchases/${id}`, { status });
      fetchPurchases();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف طلب الشراء هذا بالكامل؟')) return;
    try {
      await axios.delete(`/api/admin/purchases/${id}`);
      fetchPurchases();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const filtered = purchases.filter(p => p.status === filter);

  const statusTabs = [
    { key: 'pending', label: 'قيد المراجعة', icon: <Clock size={16} /> },
    { key: 'approved', label: 'معتمدة', icon: <CheckCircle size={16} /> },
    { key: 'rejected', label: 'مرفوضة', icon: <XCircle size={16} /> },
  ];

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <h1>إدارة المشتريات</h1>
        <p className="subtitle">راجع طلبات الشراء المقدمة من الطلاب واعتمدها أو ارفضها</p>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {statusTabs.map(tab => (
          <button 
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem',
              border: filter === tab.key ? `2px solid var(--accent-primary)` : '2px solid var(--border-color)',
              background: filter === tab.key ? 'var(--accent-glow)' : 'transparent',
              color: filter === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon} {tab.label}
            {' '}
            <span style={{ background: 'var(--input-bg)', borderRadius: '999px', padding: '0 0.5rem', fontSize: '0.8rem' }}>
              {purchases.filter(p => p.status === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="admin-table-section glass-card" style={{ padding: '2rem' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            لا توجد طلبات في هذا القسم
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>اسم الطالب</th>
                  <th>نوع الشراء / التفاصيل</th>
                  <th>طريقة الدفع</th>
                  <th>المبلغ</th>
                  <th>التاريخ</th>
                  <th>إيصال الدفع</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td>{p.student?.fullName || '-'}</td>
                    <td>
                      {p.course ? (
                        <span style={{ fontWeight: 600 }}>كورس: {p.course.title}</span>
                      ) : p.lesson ? (
                        <span style={{ fontWeight: 600 }}>محاضرة: {p.lesson.title}</span>
                      ) : p.subject ? (
                        <span style={{ fontWeight: 600 }}>
                          مادة: {p.subject} (الترم {p.semester} - {(p.faculty || '').toUpperCase()})
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{p.paymentMethod}</td>
                    <td>{p.amountPaid} جنيه</td>
                    <td>{new Date(p.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                      <a href={`${axios.defaults.baseURL || 'http://localhost:5000'}${p.receiptImage}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.4rem 0.75rem', display: 'inline-block', textDecoration: 'none', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        عرض الإيصال
                      </a>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {filter === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateStatus(p._id, 'approved')} style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                              <CheckCircle size={16} /> قبول
                            </button>
                            <button onClick={() => handleUpdateStatus(p._id, 'rejected')} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                              <XCircle size={16} /> رفض
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(p._id)} style={{ background: 'none', color: '#ef4444', border: 'none', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="حذف بالكامل">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePurchases;
