import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, PlayCircle, FileText, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import './Lectures.css'; // Reuse styles

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

  // 1. Watermark Random Position
  useEffect(() => {
    if (isTampered || !lesson?.bunnyVideoId) return;

    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 75) + 10; // 10% to 85%
      const left = Math.floor(Math.random() * 55) + 10; // 10% to 65%
      setWatermarkPos({ top: `${top}%`, left: `${left}%` });
    }, 8000); // changes every 8 seconds

    return () => clearInterval(interval);
  }, [lesson, isTampered]);

  // 2. Disable Right Click & Inspect shortcuts
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      // Disable F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+Shift+I, J, C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+U
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 3. Tab Visibility & Focus detection
  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    
    const handleBlur = () => {
      // If the page or any element (like the iframe) is in fullscreen mode,
      // going fullscreen triggers a window blur. We must ignore it.
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      if (!isFullscreen) {
        setIsFocused(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsFocused(false);
      } else {
        setIsFocused(true);
      }
    };

    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      if (isFullscreen) {
        setIsFocused(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen to fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // 4. Anti-Tampering Observer
  useEffect(() => {
    if (isTampered || !lesson?.bunnyVideoId) return;

    const watermarkEl = document.getElementById('video-watermark');
    const containerEl = document.getElementById('video-container');

    if (!watermarkEl || !containerEl) return;

    const callback = (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          const watermarkStillExists = document.getElementById('video-watermark');
          if (!watermarkStillExists) {
            setIsTampered(true);
            break;
          }
        } else if (mutation.type === 'attributes') {
          const el = document.getElementById('video-watermark');
          if (el) {
            const style = window.getComputedStyle(el);
            if (
              style.display === 'none' ||
              style.visibility === 'hidden' ||
              parseFloat(style.opacity) < 0.05 ||
              style.position !== 'absolute' ||
              style.pointerEvents !== 'none'
            ) {
              setIsTampered(true);
              break;
            }
          }
        }
      }
    };

    const observer = new MutationObserver(callback);
    
    observer.observe(containerEl, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class', 'hidden']
    });

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lesson, isTampered]);

  useEffect(() => {
    if (authLoading) return;
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
    fetchData();
  }, [courseId, lessonId, user, navigate, authLoading]);

  if (loading || authLoading) return <div style={{ textAlign: 'center', padding: '6rem' }}>جاري التحميل...</div>;
  if (!lesson) return null;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to={`/course/${courseId}`} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1rem' }}>
          <ArrowRight size={18} /> العودة للمحاضرات
        </Link>
        <h1>{lesson.title}</h1>
        {lesson.description && <p style={{ color: 'var(--text-secondary)' }}>{lesson.description}</p>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('video')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px',
            background: activeTab === 'video' ? 'var(--accent-glow)' : 'transparent',
            border: activeTab === 'video' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'video' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
          }}
        >
          <PlayCircle size={20} /> فيديو المحاضرة
        </button>
        <button 
          onClick={() => setActiveTab('files')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px',
            background: activeTab === 'files' ? 'var(--accent-glow)' : 'transparent',
            border: activeTab === 'files' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'files' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
          }}
        >
          <FileText size={20} /> الملفات والمذكرات
        </button>
        {lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0 && (
          <button 
            onClick={() => setActiveTab('quiz')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px',
              background: activeTab === 'quiz' ? 'var(--accent-glow)' : 'transparent',
              border: activeTab === 'quiz' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'quiz' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
            }}
          >
            <ClipboardList size={20} /> اختبار المحاضرة
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="glass-card" style={{ padding: '2rem', minHeight: '400px' }}>
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
            ) : lesson.bunnyVideoId ? (
              <div 
                id="video-container" 
                style={{ 
                  position: 'relative', 
                  paddingTop: '56.25%', 
                  overflow: 'hidden', 
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#000'
                }}
              >
                {/* Blur Overlay when tab is inactive / blurred */}
                {!isFocused && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    textAlign: 'center',
                    padding: '1rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsFocused(true)}
                  >
                    <PlayCircle size={48} style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>تم إيقاف الفيديو مؤقتاً</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>يرجى الضغط هنا أو العودة للصفحة لاستكمال المشاهدة</p>
                  </div>
                )}

                <iframe 
                  src={`https://iframe.mediadelivery.net/embed/${lesson.bunnyLibraryId || import.meta.env.VITE_BUNNY_LIBRARY_ID || 'YOUR_LIBRARY_ID'}/${lesson.bunnyVideoId}?autoplay=false`}
                  loading="lazy" 
                  style={{ 
                    border: 'none', 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '8px',
                    filter: !isFocused ? 'blur(12px)' : 'none',
                    transition: 'filter 0.3s ease'
                  }} 
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;" 
                  allowFullScreen
                ></iframe>

                {/* Floating Watermark */}
                {user && (
                  <div 
                    id="video-watermark" 
                    style={{
                      position: 'absolute',
                      top: watermarkPos.top,
                      left: watermarkPos.left,
                      color: 'rgba(255, 255, 255, 0.22)',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      zIndex: 10,
                      fontSize: '0.95rem',
                      fontWeight: 'bold',
                      direction: 'ltr',
                      transition: 'top 1.2s ease-in-out, left 1.2s ease-in-out',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🔒 {user.fullName} - {user.phoneNumber || user.email}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                <PlayCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h3>لا يوجد فيديو مرفوع لهذه المحاضرة حالياً</h3>
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div>
            {lesson.pdfUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FileText size={32} color="var(--accent-primary)" />
                  <div>
                    <h3 style={{ margin: 0 }}>مذكرة المحاضرة (PDF)</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>اضغط للتحميل أو العرض</p>
                  </div>
                </div>
                <a href={lesson.pdfUrl.startsWith('http') ? lesson.pdfUrl : `${axios.defaults.baseURL || 'http://localhost:5000'}${lesson.pdfUrl}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
                  فتح الملف
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h3>لا توجد ملفات مرفقة بهذه المحاضرة حالياً</h3>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quiz' && lesson.quiz && (
          <div>
            {mySubmission ? (
              /* Results View */
              <div className="glass-card" style={{ maxWidth: '600px', margin: '1.5rem auto', padding: '2.5rem 2rem', textAlign: 'center', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: mySubmission.percentage >= 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: mySubmission.percentage >= 50 ? '#10b981' : '#ef4444', marginBottom: '1.5rem' }}>
                  <CheckCircle2 size={48} />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>تم تسليم اختبار المحاضرة بنجاح!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 0 2rem 0' }}>لقد قمت بإتمام هذا التقييم مسبقاً، وإليك النتيجة المحققة:</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                  <div style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '130px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>الدرجة المحققة</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{mySubmission.score} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {mySubmission.totalQuestions}</span></div>
                  </div>
                  <div style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '130px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>النسبة المئوية</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: mySubmission.percentage >= 50 ? '#10b981' : '#ef4444' }}>%{mySubmission.percentage}</div>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  🔒 هذا التقييم معتمد ومغلق تلقائياً. لا يمكن إعادة تقديم الإجابات. بالتوفيق دائماً!
                </div>
              </div>
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
                  </p>
                </div>

                {quizError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 600 }}>
                    <AlertCircle size={20} />
                    <span>{quizError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {lesson.quiz.questions.map((q, qIdx) => (
                    <div key={q._id || qIdx} className="glass-card" style={{ padding: '1.75rem 2rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1.25rem 0', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', background: 'var(--accent-glow)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: '50%', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>{qIdx + 1}</span>
                        <span>{q.questionText}</span>
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          return (
                            <div 
                              key={optIdx} 
                              onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem', 
                                padding: '1rem 1.25rem', 
                                borderRadius: '10px', 
                                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', 
                                background: isSelected ? 'var(--accent-glow)' : 'rgba(255,255,255,0.01)', 
                                cursor: 'pointer', 
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                              }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '20px', 
                                height: '20px', 
                                borderRadius: '50%', 
                                border: isSelected ? '2px solid var(--accent-primary)' : '2px solid var(--text-secondary)',
                                background: 'transparent',
                                flexShrink: 0 
                              }}>
                                {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-primary)' }} />}
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
                      } catch (err) {
                        setQuizError(err.response?.data?.message || 'فشل في تسليم الاختبار. يرجى المحاولة مرة أخرى.');
                      } finally {
                        setSubmittingQuiz(false);
                      }
                    }}
                    className="btn-primary"
                    disabled={submittingQuiz || Object.keys(selectedAnswers).length < lesson.quiz.questions.length}
                    style={{ padding: '0.8rem 2rem', fontSize: '1.05rem', fontWeight: 600 }}
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
