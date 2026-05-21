import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AdminModal.css';
import { Plus, Edit2, Trash2, ArrowRight, BookOpen, PlayCircle, FileText, Gift, Lock } from 'lucide-react';
import './AdminDashboard.css';

const emptyForm = {
  title: '',
  description: '',
  order: 1,
  bunnyVideoId: '',
  bunnyLibraryId: '',
  pdfUrl: '',
  isFreePreview: false,
  price: 0,
  quizEnabled: false,
  quiz: {
    title: '',
    questions: []
  }
};

const ManageLessons = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState('');
  const [msg, setMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, lessonsRes] = await Promise.all([
        axios.get('/api/admin/courses'),
        axios.get(`/api/admin/courses/${courseId}/lessons`)
      ]);
      const found = coursesRes.data.find(c => c._id === courseId);
      setCourse(found);
      setLessons(lessonsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setPdfUploadError('يرجى اختيار ملف PDF فقط');
      return;
    }
    
    setPdfUploading(true);
    setPdfUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const { data } = await axios.post('/api/admin/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setForm(prev => ({ ...prev, pdfUrl: data.url }));
    } catch (err) {
      console.error(err);
      setPdfUploadError(err.response?.data?.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
      setPdfUploading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingLesson(null);
    setForm({ ...emptyForm, order: lessons.length + 1 });
    setShowForm(true);
    setMsg('');
  };

  const handleOpenEdit = (lesson) => {
    setEditingLesson(lesson);
    setForm({
      title: lesson.title,
      description: lesson.description || '',
      order: lesson.order,
      bunnyVideoId: lesson.bunnyVideoId || '',
      bunnyLibraryId: lesson.bunnyLibraryId || '',
      pdfUrl: lesson.pdfUrl || '',
      isFreePreview: lesson.isFreePreview,
      price: lesson.price || 0,
      quizEnabled: !!(lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0),
      quiz: lesson.quiz || { title: '', questions: [] }
    });
    setShowForm(true);
    setMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const payload = { ...form };
      if (!payload.quizEnabled) {
        payload.quiz = null;
      }
      delete payload.quizEnabled;

      if (editingLesson) {
        await axios.put(`/api/admin/lessons/${editingLesson._id}`, payload);
        setMsg('✅ تم تحديث المحاضرة بنجاح');
      } else {
        await axios.post(`/api/admin/courses/${courseId}/lessons`, payload);
        setMsg('✅ تم إضافة المحاضرة بنجاح');
      }
      await fetchData();
      setSaving(false);
      setTimeout(() => setShowForm(false), 1200);
    } catch (err) {
      setMsg('❌ خطأ: ' + (err.response?.data?.message || err.message));
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId) => {
    try {
      await axios.delete(`/api/admin/lessons/${lessonId}`);
      setDeleteConfirm(null);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="admin-page container">
        <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-secondary)' }}>
          جاري التحميل...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page container">
      {/* Header */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/admin/courses" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>
            <ArrowRight size={18} />
            رجوع
          </Link>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>
              <BookOpen size={28} style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }} />
              إدارة المحاضرات
            </h1>
            {course && (
              <p className="subtitle" style={{ marginTop: 0 }}>
                كورس: <strong>{course.title}</strong> &mdash; {course.subject} &mdash; ترم {course.semester}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Lesson Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
            <h2>{editingLesson ? 'تعديل محاضرة' : 'إضافة محاضرة جديدة'}</h2>

            {msg && (
              <p style={{ marginBottom: '1rem', color: msg.startsWith('✅') ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {msg}
              </p>
            )}

            <form onSubmit={handleSave} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="label">عنوان المحاضرة *</label>
                  <input
                    className="input-field"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="مثال: محاضرة 1 - مقدمة في الفارماكولوجي"
                    required
                  />
                </div>
                <div className="form-group" style={{ maxWidth: '120px' }}>
                  <label className="label">الترتيب</label>
                  <input
                    type="number" min={1}
                    className="input-field"
                    value={form.order}
                    onChange={e => setForm({ ...form, order: +e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">الوصف (اختياري)</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف مختصر عن محتوى المحاضرة..."
                />
              </div>

              <div className="form-group">
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <PlayCircle size={16} />
                  Bunny Video ID (اختياري الآن)
                </label>
                <input
                  className="input-field"
                  value={form.bunnyVideoId}
                  onChange={e => setForm({ ...form, bunnyVideoId: e.target.value })}
                  placeholder="مثال: a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  dir="ltr"
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  يمكن تعبئته لاحقاً بعد رفع الفيديو على Bunny.net
                </small>
              </div>

              <div className="form-group">
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <PlayCircle size={16} />
                  Bunny Library ID (اختياري)
                </label>
                <input
                  className="input-field"
                  value={form.bunnyLibraryId}
                  onChange={e => setForm({ ...form, bunnyLibraryId: e.target.value })}
                  placeholder="مثال: 123456"
                  dir="ltr"
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  إذا تركت هذا الحقل فارغاً، فسيتم استخدام رقم المكتبة الافتراضي من الإعدادات.
                </small>
              </div>

              <div className="form-group">
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} />
                  رابط ملف PDF أو رفع ملف جديد (اختياري)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    className="input-field"
                    value={form.pdfUrl}
                    onChange={e => setForm({ ...form, pdfUrl: e.target.value })}
                    placeholder="https://... أو سيتم تعبئته تلقائياً عند رفع ملف"
                    dir="ltr"
                    style={{ flex: 1 }}
                  />
                  <label 
                    className="btn-secondary" 
                    style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem', 
                      cursor: 'pointer', padding: '0.6rem 1rem', borderRadius: '8px', 
                      fontSize: '0.9rem', whiteSpace: 'nowrap', border: '1px solid var(--border-color)',
                      margin: 0, justifyContent: 'center'
                    }}
                  >
                    <span>{pdfUploading ? 'جاري الرفع...' : 'رفع ملف PDF'}</span>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={handlePdfUpload} 
                      disabled={pdfUploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                {pdfUploadError && <small style={{ color: '#ef4444', display: 'block', marginTop: '0.2rem' }}>{pdfUploadError}</small>}
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  id="isFreePreview"
                  checked={form.isFreePreview}
                  onChange={e => setForm({ ...form, isFreePreview: e.target.checked })}
                />
                <label htmlFor="isFreePreview">
                  <Gift size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '0.3rem' }} />
                  محاضرة مجانية (يمكن لأي شخص مشاهدتها)
                </label>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="label">سعر المحاضرة المنفردة (جنيه)</label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="مثال: 50 (اتركه 0 لتكون مرتبطة بسعر الكورس بالكامل)"
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  اتركه 0 إذا كانت المحاضرة غير متاحة للبيع المنفرد وتتطلب شراء الكورس بالكامل.
                </small>
              </div>

              {/* Quiz Settings */}
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '2rem', paddingTop: '1.5rem' }}>
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="quizEnabled"
                    checked={form.quizEnabled}
                    onChange={e => setForm({ ...form, quizEnabled: e.target.checked })}
                  />
                  <label htmlFor="quizEnabled" style={{ fontWeight: 'bold', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                    📝 إضافة اختبار (Quiz) لهذه المحاضرة
                  </label>
                </div>

                {form.quizEnabled && (
                  <div className="quiz-editor-section" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                    <div className="form-group">
                      <label className="label">عنوان الاختبار</label>
                      <input
                        className="input-field"
                        value={form.quiz?.title || ''}
                        onChange={e => setForm({
                          ...form,
                          quiz: { ...(form.quiz || { title: '', questions: [] }), title: e.target.value }
                        })}
                        placeholder="مثال: اختبار تقييمي للمحاضرة الأولى"
                      />
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>الأسئلة ({form.quiz?.questions?.length || 0})</span>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', margin: 0 }}
                          onClick={() => {
                            const questions = [...(form.quiz?.questions || [])];
                            questions.push({
                              questionText: '',
                              options: ['', '', '', ''],
                              correctAnswer: 0
                            });
                            setForm({
                              ...form,
                              quiz: { ...(form.quiz || { title: '', questions: [] }), questions }
                            });
                          }}
                        >
                          + إضافة سؤال
                        </button>
                      </h4>

                      {(form.quiz?.questions || []).map((q, qIdx) => (
                        <div key={qIdx} style={{ padding: '1.5rem 1rem 1rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)', position: 'relative' }}>
                          <button
                            type="button"
                            style={{ position: 'absolute', top: '10px', left: '10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            onClick={() => {
                              const questions = [...form.quiz.questions];
                              questions.splice(qIdx, 1);
                              setForm({
                                ...form,
                                quiz: { ...form.quiz, questions }
                              });
                            }}
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="form-group">
                            <label className="label" style={{ fontWeight: 600 }}>السؤال {qIdx + 1} *</label>
                            <input
                              className="input-field"
                              required
                              value={q.questionText}
                              onChange={e => {
                                const questions = [...form.quiz.questions];
                                questions[qIdx].questionText = e.target.value;
                                setForm({ ...form, quiz: { ...form.quiz, questions } });
                              }}
                              placeholder="اكتب نص السؤال هنا..."
                            />
                          </div>

                          <div style={{ marginTop: '1rem' }}>
                            <label className="label" style={{ fontSize: '0.85rem' }}>الاختيارات وتحديد الإجابة الصحيحة *</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <input
                                    type="radio"
                                    name={`correctAnswer-${qIdx}`}
                                    checked={q.correctAnswer === optIdx}
                                    onChange={() => {
                                      const questions = [...form.quiz.questions];
                                      questions[qIdx].correctAnswer = optIdx;
                                      setForm({ ...form, quiz: { ...form.quiz, questions } });
                                    }}
                                    required
                                  />
                                  <input
                                    className="input-field"
                                    required
                                    value={opt}
                                    onChange={e => {
                                      const questions = [...form.quiz.questions];
                                      questions[qIdx].options[optIdx] = e.target.value;
                                      setForm({ ...form, quiz: { ...form.quiz, questions } });
                                    }}
                                    placeholder={`الاختيار ${String.fromCharCode(65 + optIdx)}`}
                                    style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.9rem', margin: 0 }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : editingLesson ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-card glass-card" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#ef4444' }}>⚠️ تأكيد الحذف</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
              هل أنت متأكد من حذف المحاضرة: <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.title}</strong>؟
              <br />هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>إلغاء</button>
              <button
                className="btn-primary"
                style={{ backgroundColor: '#ef4444' }}
                onClick={() => handleDelete(deleteConfirm._id)}
              >
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lessons Table */}
      <div className="admin-table-section glass-card" style={{ padding: '2rem' }}>
        <div className="table-header">
          <h2>قائمة المحاضرات ({lessons.length})</h2>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} /> إضافة محاضرة
          </button>
        </div>

        {lessons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <BookOpen size={56} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>لا توجد محاضرات بعد.</p>
            <p>اضغط "إضافة محاضرة" لإضافة أول محاضرة في هذا الكورس.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>عنوان المحاضرة</th>
                  <th>Bunny Video ID</th>
                  <th>PDF</th>
                  <th>النوع</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson._id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{lesson.order}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600 }}>{lesson.title}</span>
                          {lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0 && (
                            <span className="badge badge-info" style={{ fontSize: '0.75rem', backgroundColor: 'var(--accent-glow)', borderColor: 'var(--accent-primary)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--accent-primary)', padding: '0.1rem 0.5rem' }}>
                              📝 اختبار ({lesson.quiz.questions.length} أسئلة)
                            </span>
                          )}
                        </div>
                        {lesson.description && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem', marginBottom: 0 }}>
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      {lesson.bunnyVideoId ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span className="badge badge-success" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                            Video: {lesson.bunnyVideoId.substring(0, 12)}...
                          </span>
                          {lesson.bunnyLibraryId && (
                            <span className="badge badge-info" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                              Lib: {lesson.bunnyLibraryId}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="badge badge-warning">لم يُرفع بعد</span>
                      )}
                    </td>
                    <td>
                      {lesson.pdfUrl ? (
                        <a href={lesson.pdfUrl.startsWith('http') ? lesson.pdfUrl : `${axios.defaults.baseURL || 'http://localhost:5000'}${lesson.pdfUrl}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                          <FileText size={14} /> عرض
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      {lesson.isFreePreview ? (
                        <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Gift size={12} /> مجاني
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Lock size={12} /> {lesson.price || 0} جنيه
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEdit(lesson)}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.75rem' }}
                          title="تعديل"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(lesson)}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.75rem', color: '#ef4444', borderColor: '#ef4444' }}
                          title="حذف"
                        >
                          <Trash2 size={15} />
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

export default ManageLessons;
