import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit2, Eye, EyeOff, BookOpen, Trash2 } from 'lucide-react';
import '../admin/AdminDashboard.css';
import '../admin/AdminModal.css';

const emptyForm = {
  title: '',
  description: '',
  subject: '',
  semester: 1,
  faculty: 'buc',
  price: 0,
  isPublished: false
};

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get('/api/admin/courses');
      setCourses(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setShowForm(true);
    setMsg('');
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description,
      subject: course.subject,
      semester: course.semester,
      faculty: course.faculty || 'buc',
      price: course.price,
      isPublished: course.isPublished
    });
    setShowForm(true);
    setMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCourse) {
        await axios.put(`/api/admin/courses/${editingCourse._id}`, form);
        setMsg('✅ تم تحديث الكورس بنجاح');
      } else {
        await axios.post('/api/admin/courses', form);
        setMsg('✅ تم إنشاء الكورس بنجاح');
      }
      await fetchCourses();
      setSaving(false);
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      setMsg('❌ حدث خطأ: ' + (err.response?.data?.message || err.message));
      setSaving(false);
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      await axios.put(`/api/admin/courses/${course._id}`, { isPublished: !course.isPublished });
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`هل تريد حذف كورس "${course.title}" وجميع محاضراته؟`)) return;
    try {
      await axios.delete(`/api/admin/courses/${course._id}`);
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <h1>إدارة الكورسات</h1>
        <p className="subtitle">أضف وعدّل ونشر الكورسات على المنصة</p>
      </div>

      {/* Add Course Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <h2>{editingCourse ? 'تعديل كورس' : 'إضافة كورس جديد'}</h2>
            
            {msg && <p style={{ marginBottom: '1rem', color: msg.startsWith('✅') ? '#10b981' : '#ef4444' }}>{msg}</p>}
            
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-group">
                <label className="label">عنوان الكورس</label>
                <input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="label">الوصف</label>
                <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">الكلية / الجامعة</label>
                  <select className="input-field" value={form.faculty} onChange={e => setForm({...form, faculty: e.target.value})} required>
                    <option value="buc">جامعة بدر بالقاهرة (BUC)</option>
                    <option value="aastmt">الأكاديمية العربية (AASTMT)</option>
                    <option value="premed">الكورس التمهيدي الطبي (Premed)</option>
                    <option value="bsu">جامعة بني سويف (BSU)</option>
                    <option value="fbsu">جامعة فهد بن سلطان (FBSU)</option>
                    <option value="bnu">جامعة بنها الأهلية (BNU)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">الترم (Semester)</label>
                  <input type="number" min={1} max={10} className="input-field" value={form.semester} onChange={e => setForm({...form, semester: +e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">المادة (القسم)</label>
                <input type="text" className="input-field" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="مثال: الباطنة العامة" required />
              </div>
              <div className="form-group">
                <label className="label">السعر (جنيه) - اكتب 0 للمجاني</label>
                <input type="number" min={0} className="input-field" value={form.price} onChange={e => setForm({...form, price: +e.target.value})} />
              </div>
              <div className="form-check">
                <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} />
                <label htmlFor="isPublished">نشر الكورس (ليظهر للطلاب)</label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses Table */}
      <div className="admin-table-section glass-card" style={{ padding: '2rem' }}>
        <div className="table-header">
          <h2>قائمة الكورسات ({courses.length})</h2>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} /> إضافة كورس جديد
          </button>
        </div>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>جاري التحميل...</p>
        ) : courses.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>لا توجد كورسات بعد. أضف أول كورس!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>عنوان الكورس</th>
                  <th>الكلية</th>
                  <th>المادة</th>
                  <th>الترم</th>
                  <th>السعر</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id}>
                    <td style={{ fontWeight: 600 }}>{course.title}</td>
                    <td style={{ textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)' }}>{course.faculty || 'buc'}</td>
                    <td>{course.subject}</td>
                    <td>{course.semester} sem</td>
                    <td>{course.price === 0 ? <span className="badge badge-info">مجاني</span> : `${course.price} جنيه`}</td>
                    <td>
                      <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`}>
                        {course.isPublished ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link
                          to={`/admin/courses/${course._id}/lessons`}
                          className="btn-primary"
                          style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', fontSize: '0.85rem' }}
                          title="إدارة المحاضرات"
                        >
                          <BookOpen size={15} /> محاضرات
                        </Link>
                        <button onClick={() => handleOpenEdit(course)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem' }} title="تعديل">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleTogglePublish(course)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem' }} title={course.isPublished ? 'إخفاء' : 'نشر'}>
                          {course.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => handleDelete(course)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', color: '#ef4444', borderColor: '#ef4444' }} title="حذف">
                          <Trash2 size={16} />
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

export default ManageCourses;
