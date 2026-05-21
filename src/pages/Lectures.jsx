import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PlayCircle, FileText, CheckCircle, Lock, Clock } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import CheckoutModal from '../components/CheckoutModal';
import './Lectures.css';

const FACULTY_NAMES = {
  buc: { ar: 'جامعة بدر (BUC)', en: 'BUC' },
  aastmt: { ar: 'الأكاديمية العربية (AASTMT)', en: 'AASTMT' },
  premed: { ar: 'الكورس التمهيدي الطبي', en: 'Premed' },
  bsu: { ar: 'جامعة بني سويف (BSU)', en: 'BSU' },
  fbsu: { ar: 'جامعة فهد بن سلطان (FBSU)', en: 'FBSU' },
  bnu: { ar: 'جامعة بنها الأهلية (BNU)', en: 'BNU' }
};

const Lectures = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Purchase statuses
  const [myPurchases, setMyPurchases] = useState([]);
  const [purchaseStatus, setPurchaseStatus] = useState(null); // 'pending', 'approved', 'none'
  
  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutType, setCheckoutType] = useState('course'); // 'course' | 'lesson' | 'subject'
  const [checkoutTarget, setCheckoutTarget] = useState(null);

  // Subject grouping
  const [subjectCourses, setSubjectCourses] = useState([]);
  const [subjectPrice, setSubjectPrice] = useState(0);

  const isAdmin = user && user.role === 'admin';

  const fetchData = async () => {
    try {
      const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

      // Fetch all published courses to find the current one
      const coursesRes = await axios.get('/api/courses');
      const found = coursesRes.data.find(c => c._id === courseId);
      setCourse(found);

      if (found) {
        // Find other courses in the same subject
        const related = coursesRes.data.filter(c => 
          c.subject === found.subject && 
          c.faculty === found.faculty && 
          c.semester === found.semester
        );
        setSubjectCourses(related);
        setSubjectPrice(related.reduce((sum, c) => sum + c.price, 0));
      }

      // Fetch lessons for this course (with optionalAuth header if logged in)
      const lessonsRes = await axios.get(`/api/courses/${courseId}/lessons`, config);
      setLessons(lessonsRes.data);
      
      // If logged in, fetch purchase status
      if (user && found) {
        const purchasesRes = await axios.get('/api/purchases/my-purchases', config);
        setMyPurchases(purchasesRes.data);

        // Check if subject is approved
        const approvedSubject = purchasesRes.data.find(p => 
          p.subject === found.subject && 
          p.faculty === found.faculty && 
          p.semester === found.semester && 
          p.status === 'approved'
        );

        // Check course purchase (excluding rejected ones)
        const coursePurchase = purchasesRes.data.find(p => p.course?._id === courseId && p.status !== 'rejected');

        if (approvedSubject) {
          setPurchaseStatus('approved');
        } else if (coursePurchase) {
          setPurchaseStatus(coursePurchase.status);
        } else {
          setPurchaseStatus('none');
        }
      } else {
        setPurchaseStatus('none');
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [courseId, user, authLoading]);

  const handleOpenCheckout = (type, target) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setCheckoutType(type);
    setCheckoutTarget(target);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    fetchData();
  };

  if (loading || authLoading) return (
    <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-secondary)' }}>
      جاري تحميل المحاضرات...
    </div>
  );

  const pendingSubject = myPurchases.find(p => 
    p.subject === course?.subject && 
    p.faculty === course?.faculty && 
    p.semester === course?.semester && 
    p.status === 'pending'
  );

  return (
    <div className="lectures-page container">
      <div className="page-header">
        <div className="breadcrumbs">
          <Link to="/courses">الكورسات</Link>
          {course && (
            <>
              {' / '}
              <Link to={`/courses?faculty=${course.faculty || 'buc'}`}>
                {FACULTY_NAMES[course.faculty || 'buc']?.[isAr ? 'ar' : 'en'] || (course.faculty || 'buc').toUpperCase()}
              </Link>
              {' / '}
              <Link to={`/courses?faculty=${course.faculty || 'buc'}&semester=${course.semester}`}>
                {isAr ? `الترم ${course.semester}` : `Sem ${course.semester}`}
              </Link>
              {' / '}
              <span>{course.title}</span>
            </>
          )}
        </div>
        <h1>{course?.title || 'المحاضرات'}</h1>
        <p className="subtitle">
          {course?.subject} &mdash; {course?.semester} sem
          {course?.price === 0
            ? <span className="badge-free" style={{marginRight: '0.75rem', marginLeft: '0.75rem', display: 'inline-flex', alignItems: 'center'}}>مجاني</span>
            : isAdmin
              ? <span className="badge-admin" style={{marginRight: '0.75rem', marginLeft: '0.75rem', display: 'inline-flex', alignItems: 'center', color: '#3b82f6', fontWeight: 'bold'}}>{isAr ? '🔧 مسؤول' : '🔧 Admin'}</span>
              : purchaseStatus === 'approved'
                ? <span className="badge-purchased" style={{marginRight: '0.75rem', marginLeft: '0.75rem', display: 'inline-flex', alignItems: 'center', color: '#10b981', fontWeight: 'bold'}}>{isAr ? '✅ تم الشراء' : '✅ Purchased'}</span>
                : <span className="badge-price" style={{marginRight: '0.75rem', marginLeft: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', direction: 'rtl'}}><span>{course?.price}</span><span>جنيه</span></span>
          }
        </p>
        
        {course && purchaseStatus !== 'approved' && !isAdmin && (
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {pendingSubject ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}>
                <Clock size={20} /> طلب شراء المادة كاملة قيد المراجعة من الإدارة
              </div>
            ) : purchaseStatus === 'pending' ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}>
                <Clock size={20} /> طلب شراء الكورس قيد المراجعة من الإدارة
              </div>
            ) : purchaseStatus === 'none' && course.price > 0 ? (
              <>
                <button 
                  onClick={() => handleOpenCheckout('course', course)} 
                  className="btn-primary" 
                  style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
                >
                  شراء الكورس الآن لفتح كل الدروس ({course.price} جنيه)
                </button>

                {subjectCourses.length > 1 && subjectPrice > course.price && (
                  <button 
                    onClick={() => handleOpenCheckout('subject', {
                      name: course.subject,
                      faculty: course.faculty,
                      semester: course.semester,
                      price: subjectPrice
                    })} 
                    className="btn-secondary" 
                    style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', background: 'var(--accent-glow)' }}
                  >
                    شراء المادة بالكامل تشمل ({subjectCourses.length} كورسات) بسعر ({subjectPrice} جنيه)
                  </button>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal 
          purchaseType={checkoutType}
          target={checkoutTarget} 
          onClose={() => setShowCheckout(false)} 
          onSuccess={handleCheckoutSuccess} 
        />
      )}

      {lessons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem' }}>لا توجد محاضرات مضافة لهذا الكورس بعد</p>
        </div>
      ) : (
        <div className="lectures-list">
          {lessons.map((lesson, index) => {
            const isLessonApproved = myPurchases.some(p => p.lesson?._id === lesson._id && p.status === 'approved');
            const isLessonPending = myPurchases.some(p => p.lesson?._id === lesson._id && p.status === 'pending');
            const hasAccess = purchaseStatus === 'approved' || isLessonApproved || lesson.isFreePreview || isAdmin;

            return (
              <div key={lesson._id} className="lecture-item glass-card">
                <div className="lecture-info">
                  <div className="lecture-number">{index + 1}</div>
                  <div className="lecture-details">
                    <h3>{lesson.title}</h3>
                    <p>
                      {lesson.isFreePreview 
                        ? '🎁 محاضرة مجانية' 
                        : isAdmin
                          ? <span style={{color: '#3b82f6', fontWeight: 'bold'}}>{isAr ? '🔧 متاح للمسؤول' : '🔧 Admin Access'}</span>
                          : (purchaseStatus === 'approved' || isLessonApproved)
                            ? <span style={{color: '#10b981', fontWeight: 'bold'}}>{isAr ? '✅ تم الشراء' : '✅ Purchased'}</span>
                            : `🔒 السعر المنفرد: ${lesson.price || 50} جنيه`
                      }
                    </p>
                  </div>
                </div>

                <div className="lecture-actions">
                  {hasAccess ? (
                    <button 
                      className="btn-primary" 
                      onClick={() => navigate(`/course/${courseId}/lesson/${lesson._id}`)}
                      style={{ padding: '0.6rem 1.5rem', fontWeight: 600 }}
                    >
                      فتح المحاضرة
                    </button>
                  ) : isLessonPending ? (
                    <button className="btn-secondary" disabled style={{ opacity: 0.8, cursor: 'not-allowed', color: '#f59e0b', borderColor: '#f59e0b' }}>
                      <Clock size={18} />
                      <span>قيد مراجعة الدفع للمحاضرة</span>
                    </button>
                  ) : (
                    <button 
                      className="btn-secondary"
                      onClick={() => handleOpenCheckout('lesson', { _id: lesson._id, title: lesson.title, price: lesson.price || 50 })}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', cursor: 'pointer' }}
                    >
                      <Lock size={16} />
                      <span>شراء المحاضرة ({lesson.price || 50} جنيه)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Lectures;
