import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, PlayCircle, FileText, ClipboardList, CheckCircle2, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { detectVideoInfo } from './admin/ManageLessons';
import './Lectures.css'; // Reuse styles
import './LessonView.css';

const LessonView = () => {
  const { courseId, lessonId } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('video'); // 'video', 'files', 'quiz'
  const [watermarkPos, setWatermarkPos] = useState({ top: '20%', left: '30%' });
  const [isTampered, setIsTampered] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const observerRef = useRef(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizError, setQuizError] = useState('');

  const fetchData = async () => {
    try {
      setSelectedAnswers({});
      setQuizError('');
      const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
      
      // Fetch course details
      const coursesRes = await axios.get('/api/courses');
      const foundCourse = coursesRes.data.find(c => c._id === courseId);
      setCourse(foundCourse);

      // Fetch lessons and find the specific one
      const lessonsRes = await axios.get(`/api/courses/${courseId}/lessons`, config);
      const foundLesson = lessonsRes.data.find(l => l._id === lessonId);
      
      if (foundLesson && foundLesson.hasAccess) {
        setLesson(foundLesson);
        
        // If lesson is locked by quiz, force active tab to quiz
        if (foundLesson.isLockedByQuiz) {
          setActiveTab('quiz');
        }

        // Check for quiz submission if quiz exists
        if (foundLesson.quiz && foundLesson.quiz.questions && foundLesson.quiz.questions.length > 0) {
          try {
            const subRes = await axios.get(`/api/courses/${courseId}/lessons/${lessonId}/quiz/my-submission`, config);
            setMySubmission(subRes.data);
          } catch (e) {
            console.error("Error loading quiz submission:", e);
          }
        } else {
          setMySubmission(null);
        }
      } else {
        // Lesson not found or no access
        navigate(`/course/${courseId}`);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      navigate(`/course/${courseId}`);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [courseId, lessonId, user, navigate, authLoading]);

  if (loading || authLoading) return <div style={{ textAlign: 'center', padding: '6rem' }}>جاري التحميل...</div>;
  if (!lesson) return null;

  return (
    <div className="container lesson-view-container">
      {/* Header */}
      <div className="lesson-header" style={{ marginBottom: '2rem' }}>
        <Link to={`/course/${courseId}`} className="back-link">
          <ArrowRight size={18} /> العودة للمحاضرات
        </Link>
        <h1>{lesson.title}</h1>
        {lesson.description && <p>{lesson.description}</p>}
      </div>

      {/* Prerequisite Quiz Lock Notice */}
      {lesson.isLockedByQuiz && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.2rem 1.5rem',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          marginBottom: '2rem',
          color: '#f87171'
        }}>
          <Lock size={32} style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: '#ef4444' }}>
              🔒 هذه المحاضرة محمية باختبار إلزامي
            </h4>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              يجب عليك الإجابة على الكويز أدناه والحصول على نسبة <strong>%{lesson.quiz?.passPercentage || 50}</strong> على الأقل لفتح فيديو المحاضرة والملفات المرفقة.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-segmented-control">
        <button 
          onClick={() => {
            if (!lesson.isLockedByQuiz) setActiveTab('video');
          }}
          disabled={lesson.isLockedByQuiz}
          style={{ opacity: lesson.isLockedByQuiz ? 0.5 : 1, cursor: lesson.isLockedByQuiz ? 'not-allowed' : 'pointer' }}
          className={`tab-segmented-button ${activeTab === 'video' ? 'active' : ''}`}
        >
          {lesson.isLockedByQuiz ? <Lock size={18} /> : <PlayCircle size={20} />} فيديو المحاضرة
        </button>
        <button 
          onClick={() => {
            if (!lesson.isLockedByQuiz) setActiveTab('files');
          }}
          disabled={lesson.isLockedByQuiz}
          style={{ opacity: lesson.isLockedByQuiz ? 0.5 : 1, cursor: lesson.isLockedByQuiz ? 'not-allowed' : 'pointer' }}
          className={`tab-segmented-button ${activeTab === 'files' ? 'active' : ''}`}
        >
          {lesson.isLockedByQuiz ? <Lock size={18} /> : <FileText size={20} />} الملفات والمذكرات
        </button>
        {lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0 && (
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`tab-segmented-button ${activeTab === 'quiz' ? 'active' : ''}`}
          >
            <ClipboardList size={20} /> اختبار المحاضرة
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="content-glass-panel">
        {activeTab === 'video' && (
          <div>
            {isTampered ? (
              <div style={{
                padding: '3rem 2rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px dashed #ef4444',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#ef4444'
              }}>
                <h3 style={{ margin: 0, marginBottom: '1rem' }}>⚠️ تنبيه أمني</h3>
                <p style={{ margin: 0 }}>تم الكشف عن محاولة تعديل مكونات الصفحة أو إخفاء العلامة المائية. تم إيقاف الفيديو لأسباب تتعلق بحماية حقوق الملكية الفكرية.</p>
              </div>
            ) : (() => {
              const vInfo = detectVideoInfo(lesson);
              const rawUrl = vInfo.url;
              const vType = vInfo.type;

              const bunnyLibId = lesson.bunnyLibraryId || import.meta.env.VITE_BUNNY_LIBRARY_ID;
              const hasValidBunnyLib = bunnyLibId && bunnyLibId !== 'YOUR_LIBRARY_ID';

              // 1. Bunny Stream (Only if valid Bunny ID & Library exist)
              if (vType === 'bunny' && vInfo.isBunny && vInfo.bunnyId && hasValidBunnyLib) {
                return (
                  <div id="video-container" className="video-cinema-frame">
                    <iframe 
                      src={`https://iframe.mediadelivery.net/embed/${bunnyLibId}/${vInfo.bunnyId}?autoplay=false`}
                      loading="lazy" 
                      style={{ 
                        border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                        borderRadius: '8px'
                      }} 
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;" 
                      allowFullScreen
                    ></iframe>
                    {user && (
                      <div 
                        id="video-watermark" 
                        style={{
                          position: 'absolute', top: watermarkPos.top, left: watermarkPos.left,
                          color: 'rgba(255, 255, 255, 0.22)', textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
                          pointerEvents: 'none', userSelect: 'none', zIndex: 10, fontSize: '0.95rem',
                          fontWeight: 'bold', direction: 'ltr', transition: 'top 1.2s ease-in-out, left 1.2s ease-in-out',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        🔒 {user.fullName} - {user.phoneNumber || user.email}
                      </div>
                    )}
                  </div>
                );
              }

              // 2. YouTube Video (Supports Watch, Shorts, Embed, Short URLs)
              if (vType === 'youtube' && rawUrl) {
                let embedUrl = rawUrl;
                const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
                if (match && match[1]) {
                  embedUrl = `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&controls=1`;
                }
                return (
                  <div 
                    className="video-cinema-frame" 
                    style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}
                  >
                    <iframe 
                      src={embedUrl}
                      loading="lazy"
                      style={{ 
                        border: 'none', 
                        position: 'absolute', 
                        top: '-60px', 
                        left: 0, 
                        width: '100%', 
                        height: 'calc(100% + 75px)', 
                        borderRadius: '8px' 
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                    {/* Top Click Shield: Protects top cropped boundary */}
                    <div 
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '50px',
                        zIndex: 5, cursor: 'default'
                      }}
                      onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                    />
                    {/* Bottom-Left Shield: Covers "Watch on YouTube" button */}
                    <div 
                      style={{
                        position: 'absolute', bottom: 0, left: 0, width: '160px', height: '45px',
                        zIndex: 5, cursor: 'default'
                      }}
                      onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                    />
                    {/* Bottom-Right Shield: Covers YouTube logo */}
                    <div 
                      style={{
                        position: 'absolute', bottom: 0, right: 0, width: '110px', height: '45px',
                        zIndex: 5, cursor: 'default'
                      }}
                      onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                    />
                    {user && (
                      <div 
                        id="video-watermark" 
                        style={{
                          position: 'absolute', top: watermarkPos.top, left: watermarkPos.left,
                          color: 'rgba(255, 255, 255, 0.25)', textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                          pointerEvents: 'none', userSelect: 'none', zIndex: 10, fontSize: '0.95rem',
                          fontWeight: 'bold', direction: 'ltr', transition: 'top 1.2s ease-in-out, left 1.2s ease-in-out',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        🔒 {user.fullName} - {user.phoneNumber || user.email}
                      </div>
                    )}
                  </div>
                );
              }

              // 3. Google Drive Video
              if (vType === 'drive' && rawUrl) {
                let previewUrl = rawUrl;
                if (rawUrl.includes('/view')) {
                  previewUrl = rawUrl.replace('/view', '/preview');
                }
                return (
                  <div className="video-cinema-frame">
                    <iframe 
                      src={previewUrl}
                      style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
                      allow="autoplay"
                      allowFullScreen
                    ></iframe>
                    {user && (
                      <div 
                        id="video-watermark" 
                        style={{
                          position: 'absolute', top: watermarkPos.top, left: watermarkPos.left,
                          color: 'rgba(255, 255, 255, 0.25)', textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                          pointerEvents: 'none', userSelect: 'none', zIndex: 10, fontSize: '0.95rem',
                          fontWeight: 'bold', direction: 'ltr', transition: 'top 1.2s ease-in-out, left 1.2s ease-in-out',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        🔒 {user.fullName} - {user.phoneNumber || user.email}
                      </div>
                    )}
                  </div>
                );
              }

              // 4. Telegram Video
              if (vType === 'telegram' && rawUrl) {
                const isPrivate = rawUrl.includes('/c/');
                const cleanUrl = rawUrl.split('?')[0];
                const embedUrl = cleanUrl.endsWith('?embed=1') ? cleanUrl : `${cleanUrl}?embed=1`;

                if (isPrivate) {
                  return (
                    <div style={{
                      padding: '3.5rem 2rem',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.03) 100%)',
                      borderRadius: '16px',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      textAlign: 'center',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                      maxWidth: '650px',
                      margin: '1rem auto'
                    }}>
                      <div style={{
                        width: '72px', height: '72px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.25rem auto',
                        color: '#3b82f6',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                      }}>
                        <span style={{ fontSize: '2rem' }}>✈️</span>
                      </div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        فيديو المحاضرة على قناة تليجرام
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: '1.6' }}>
                        هذا الفيديو مرفوع على قناة تليجرام خاصة. اضغط على الزر أدناه لمشاهدة الفيديو مباشرة عبر تطبيق تليجرام:
                      </p>
                      <a 
                        href={rawUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-primary" 
                        style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '0.6rem', 
                          padding: '0.85rem 2rem', fontSize: '1.05rem', textDecoration: 'none',
                          borderRadius: '50px', backgroundColor: '#229ED9', color: '#ffffff',
                          boxShadow: '0 4px 15px rgba(34, 158, 217, 0.4)', fontWeight: 600
                        }}
                      >
                        <span>مشاهدة الفيديو في تطبيق Telegram ✈️</span>
                      </a>
                    </div>
                  );
                }

                return (
                  <div>
                    <div className="video-cinema-frame" style={{ marginBottom: '1.5rem', minHeight: '380px' }}>
                      <iframe 
                        src={embedUrl}
                        loading="lazy"
                        style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
                        allowFullScreen
                      ></iframe>
                      {user && (
                        <div 
                          id="video-watermark" 
                          style={{
                            position: 'absolute', top: watermarkPos.top, left: watermarkPos.left,
                            color: 'rgba(255, 255, 255, 0.25)', textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                            pointerEvents: 'none', userSelect: 'none', zIndex: 10, fontSize: '0.95rem',
                            fontWeight: 'bold', direction: 'ltr', transition: 'top 1.2s ease-in-out, left 1.2s ease-in-out',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          🔒 {user.fullName} - {user.phoneNumber || user.email}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <a href={rawUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', backgroundColor: '#229ED9', color: '#fff' }}>
                        <span>فتح الفيديو في تطبيق Telegram ✈️</span>
                      </a>
                    </div>
                  </div>
                );
              }

              // 5. External Video (MP4 / Direct Embed)
              if (vType === 'external' && rawUrl) {
                const isDirectVideo = rawUrl.endsWith('.mp4') || rawUrl.endsWith('.webm') || rawUrl.endsWith('.ogg');
                return (
                  <div className="video-cinema-frame">
                    {isDirectVideo ? (
                      <video 
                        src={rawUrl} 
                        controls 
                        controlsList="nodownload"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
                      />
                    ) : (
                      <iframe 
                        src={rawUrl}
                        style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
                        allowFullScreen
                      ></iframe>
                    )}
                    {user && (
                      <div 
                        id="video-watermark" 
                        style={{
                          position: 'absolute', top: watermarkPos.top, left: watermarkPos.left,
                          color: 'rgba(255, 255, 255, 0.25)', textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                          pointerEvents: 'none', userSelect: 'none', zIndex: 10, fontSize: '0.95rem',
                          fontWeight: 'bold', direction: 'ltr', transition: 'top 1.2s ease-in-out, left 1.2s ease-in-out',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        🔒 {user.fullName} - {user.phoneNumber || user.email}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                  <PlayCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <h3>لا يوجد فيديو مرفوع لهذه المحاضرة حالياً</h3>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'files' && (
          <div>
            {(() => {
              const fUrl = lesson.fileUrl || lesson.pdfUrl;
              const isDrive = lesson.fileType === 'drive' || (fUrl && fUrl.includes('drive.google.com'));

              if (!fUrl) {
                return (
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h3>لا توجد ملفات مرفقة بهذه المحاضرة حالياً</h3>
                  </div>
                );
              }

              if (isDrive) {
                let previewUrl = fUrl;
                if (fUrl.includes('/view')) {
                  previewUrl = fUrl.replace('/view', '/preview');
                }
                return (
                  <div>
                    <div className="pdf-download-card" style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        <div className="pdf-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                          <FileText size={28} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>ملف Google Drive</h3>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>اضغط للفتح المباشر في جوجل درايف</p>
                        </div>
                      </div>
                      <a href={fUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
                        فتح في Google Drive 📁
                      </a>
                    </div>

                    <div style={{ height: '550px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <iframe 
                        src={previewUrl} 
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="autoplay"
                      ></iframe>
                    </div>
                  </div>
                );
              }

              return (
                <div className="pdf-download-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <div className="pdf-icon-wrapper">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem' }}>مذكرة / ملف المحاضرة</h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>اضغط للتحميل أو عرض الملف</p>
                    </div>
                  </div>
                  <a href={fUrl.startsWith('http') ? fUrl : fUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
                    فتح الملف
                  </a>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'quiz' && lesson.quiz && (
          <div>
            {mySubmission ? (
              /* Results View */
              (() => {
                const reqPass = lesson.quiz?.passPercentage || 50;
                const passed = mySubmission.percentage >= reqPass;
                return (
                  <div className="glass-card" style={{ maxWidth: '600px', margin: '1.5rem auto', padding: '2.5rem 2rem', textAlign: 'center', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: passed ? '#10b981' : '#ef4444', marginBottom: '1.5rem' }}>
                      {passed ? <CheckCircle2 size={48} /> : <AlertCircle size={48} />}
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                      {passed ? '🎉 مبروك! لقد اجتزت الاختبار بنجاح' : '❌ للأسف لم تتخطَّ درجة النجاح المطلوبة'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 0 2rem 0' }}>
                      {passed 
                        ? 'تم فتح فيديو المحاضرة والملفات المرفقة بنجاح!' 
                        : `درجة النجاح المطلوبة لفتح المحاضرة هي %${reqPass}. يمكنك إعادة المحاولة حتى تنجح.`}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                      <div style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '130px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>الدرجة المحققة</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{mySubmission.score} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {mySubmission.totalQuestions}</span></div>
                      </div>
                      <div style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '130px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>النسبة المئوية</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: passed ? '#10b981' : '#ef4444' }}>%{mySubmission.percentage}</div>
                      </div>
                    </div>

                    {passed ? (
                      <button 
                        onClick={() => setActiveTab('video')} 
                        className="btn-primary" 
                        style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem', fontWeight: 600, borderRadius: '12px' }}
                      >
                        <PlayCircle size={20} style={{ marginLeft: '0.5rem' }} /> مشاهدة المحاضرة الآن
                      </button>
                    ) : (
                      <button 
                        onClick={() => { setMySubmission(null); setSelectedAnswers({}); setQuizError(''); }} 
                        className="btn-primary" 
                        style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem', fontWeight: 600, borderRadius: '12px', backgroundColor: '#ef4444' }}
                      >
                        <RefreshCw size={20} style={{ marginLeft: '0.5rem' }} /> إعادة الاختبار الآن
                      </button>
                    )}
                  </div>
                );
              })()
            ) : (
              /* Quiz Question Form */
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', margin: 0 }}>
                    <ClipboardList size={24} />
                    {lesson.quiz.title || `اختبار تقييمي للمحاضرة: ${lesson.title}`}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
                    الرجاء قراءة كل سؤال بعناية وتحديد الإجابة الأكثر ملاءمة. يجب الإجابة عن كافة الأسئلة لتتمكن من تسليم الاختبار.
                    {lesson.quiz.isRequired && (
                      <strong style={{ display: 'block', marginTop: '0.4rem', color: '#f87171' }}>
                        🔒 كويز إلزامي: يتطلب الحصول على نسبة %{lesson.quiz.passPercentage || 50} على الأقل لفتح المحاضرة.
                      </strong>
                    )}
                  </p>
                </div>

                {quizError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 600 }}>
                    <AlertCircle size={20} />
                    <span>{quizError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {lesson.quiz.questions.map((q, qIdx) => (
                    <div key={q._id || qIdx} className="quiz-question-box">
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 1.5rem 0', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        <span className="quiz-badge">{qIdx + 1}</span>
                        <span>{q.questionText}</span>
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          return (
                            <div 
                              key={optIdx} 
                              onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                              className={`quiz-option-button ${isSelected ? 'selected' : ''}`}
                            >
                              <div className="radio-circle">
                                {isSelected && <div className="radio-dot" />}
                              </div>
                              <span style={{ fontSize: '0.95rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer and Submit */}
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '3rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    ✅ تم الإجابة عن <strong style={{ color: 'var(--text-primary)' }}>{Object.keys(selectedAnswers).length}</strong> من أصل <strong style={{ color: 'var(--text-primary)' }}>{lesson.quiz.questions.length}</strong> أسئلة
                  </div>
                  <button
                    onClick={async () => {
                      if (Object.keys(selectedAnswers).length < lesson.quiz.questions.length) {
                        setQuizError('يرجى الإجابة عن جميع الأسئلة المطروحة أولاً قبل تسليم الاختبار.');
                        return;
                      }
                      setQuizError('');
                      setSubmittingQuiz(true);
                      try {
                        const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
                        const formattedAnswers = Object.entries(selectedAnswers).map(([qIdx, optIdx]) => ({
                          questionIndex: Number(qIdx),
                          selectedOption: optIdx
                        }));
                        const { data } = await axios.post(`/api/courses/${courseId}/lessons/${lessonId}/quiz/submit`, { answers: formattedAnswers }, config);
                        setMySubmission(data);
                        if (data.passed) {
                          await fetchData();
                          setActiveTab('video');
                        }
                      } catch (err) {
                        setQuizError(err.response?.data?.message || 'فشل في تسليم الاختبار. يرجى المحاولة مرة أخرى.');
                      } finally {
                        setSubmittingQuiz(false);
                      }
                    }}
                    className="btn-primary"
                    disabled={submittingQuiz || Object.keys(selectedAnswers).length < lesson.quiz.questions.length}
                    style={{ padding: '0.8rem 2.5rem', fontSize: '1.05rem', fontWeight: 600, borderRadius: '12px' }}
                  >
                    {submittingQuiz ? 'جاري تصحيح وتسليم الإجابات...' : 'تسليم الاختبار ورؤية النتيجة'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonView;
