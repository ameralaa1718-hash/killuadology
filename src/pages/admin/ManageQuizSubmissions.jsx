import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ClipboardList, AlertCircle, Award } from 'lucide-react';
import './AdminDashboard.css';

const ManageQuizSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get('/api/admin/quiz-submissions');
      setSubmissions(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'خطأ أثناء جلب نتائج الاختبارات');
      setLoading(false);
    }
  };

  const filtered = submissions.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    
    const studentName = s.student?.fullName?.toLowerCase() || '';
    const studentPhone = s.student?.phoneNumber || '';
    const studentEmail = s.student?.email?.toLowerCase() || '';
    const courseTitle = s.course?.title?.toLowerCase() || '';
    const lessonTitle = s.lesson?.title?.toLowerCase() || '';
    
    return studentName.includes(q) || 
           studentPhone.includes(q) || 
           studentEmail.includes(q) || 
           courseTitle.includes(q) || 
           lessonTitle.includes(q);
  });

  return (
    <div className="admin-page container animate-fade-in">
      <div className="admin-header">
        <h1>سجل درجات الاختبارات</h1>
        <p className="subtitle">عرض وتتبع درجات الطلاب وبياناتهم التفصيلية لكل اختبار تقييمي للمحاضرات</p>
      </div>

      <div className="search-bar-wrapper" style={{ marginBottom: '2rem' }}>
        <div className="search-input-container">
          <Search size={18} className="search-icon" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="input-field search-input"
            style={{ paddingRight: '2.75rem', paddingLeft: '1rem', width: '100%', boxSizing: 'border-box' }}
            placeholder="ابحث باسم الطالب، رقم الهاتف، البريد، الكورس، أو عنوان المحاضرة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-section glass-card" style={{ padding: '2rem' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>جاري تحميل نتائج الاختبارات...</p>
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <ClipboardList size={56} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>لا توجد نتائج اختبارات متطابقة مع بحثك.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>الطالب</th>
                  <th>رقم الهاتف</th>
                  <th>الكورس والمحاضرة</th>
                  <th style={{ textAlign: 'center' }}>الدرجة</th>
                  <th style={{ textAlign: 'center' }}>النسبة المئوية</th>
                  <th>تاريخ التسليم</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const passed = s.percentage >= 50;
                  return (
                    <tr key={s._id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                          <span style={{ fontWeight: 600 }}>{s.student?.fullName || 'طالب محذوف'}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.student?.email || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ direction: 'ltr', display: 'inline-block', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                          {s.student?.phoneNumber || '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{s.course?.title || 'كورس محذوف'}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>المحاضرة: {s.lesson?.title || 'محاضرة محذوفة'}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                          <Award size={16} color="var(--accent-primary)" />
                          <span>{s.score}</span>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>/ {s.totalQuestions}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span 
                          className="badge" 
                          style={{
                            backgroundColor: passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                            color: passed ? '#10b981' : '#ef4444',
                            fontWeight: 700
                          }}
                        >
                          %{s.percentage}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(s.createdAt).toLocaleString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageQuizSubmissions;
