import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import axios from 'axios';
import './Courses.css';

// Palette of beautiful gradient colors for subject headers
const SUBJECT_PALETTES = [
  { from: '#1d4ed8', to: '#3b82f6', shadow: 'rgba(59,130,246,0.3)' },
  { from: '#7c3aed', to: '#a78bfa', shadow: 'rgba(139,92,246,0.3)' },
  { from: '#065f46', to: '#10b981', shadow: 'rgba(16,185,129,0.3)' },
  { from: '#b45309', to: '#f59e0b', shadow: 'rgba(245,158,11,0.3)' },
  { from: '#be123c', to: '#f43f5e', shadow: 'rgba(244,63,94,0.3)' },
  { from: '#0e7490', to: '#06b6d4', shadow: 'rgba(6,182,212,0.3)' },
  { from: '#9a3412', to: '#f97316', shadow: 'rgba(249,115,22,0.3)' },
  { from: '#4d7c0f', to: '#84cc16', shadow: 'rgba(132,204,22,0.3)' },
];

const FACULTIES = [
  {
    id: 'buc',
    nameAr: 'جامعة بدر بالقاهرة',
    nameEn: 'Badr University in Cairo',
    abbr: 'BUC',
    theme: {
      from: '#0052D4',
      to: '#4364F7',
      text: '#ffffff',
      shadow: 'rgba(67, 100, 247, 0.4)'
    },
    icon: (
      <svg viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
        <path d="M50 15 a35 35 0 0 1 0 70 a35 35 0 0 1 0 -70" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M25 50 h50 M50 25 v50" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
        <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="50" cy="50" rx="12" ry="35" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'aastmt',
    nameAr: 'الأكاديمية العربية (AASTMT)',
    nameEn: 'Arab Academy for Science & Technology',
    abbr: 'AASTMT',
    theme: {
      from: '#1f4037',
      to: '#99f2c8',
      text: '#ffffff',
      shadow: 'rgba(153, 242, 200, 0.3)'
    },
    icon: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="50" cy="50" r="45" strokeWidth="2" opacity="0.3" />
        <path d="M50 20 v50 M35 45 h30 M30 65 c5 10 35 10 40 0" />
        <path d="M50 70 l-6-10 h12z" fill="currentColor" />
        <circle cx="50" cy="20" r="5" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'premed',
    nameAr: 'الكورس التمهيدي الطبي (Premed)',
    nameEn: 'Premedical Preparation Course',
    abbr: 'PREMED',
    theme: {
      from: '#FF416C',
      to: '#FF4B2B',
      text: '#ffffff',
      shadow: 'rgba(255, 75, 43, 0.4)'
    },
    icon: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="50" cy="50" r="45" strokeWidth="2" opacity="0.3" />
        <path d="M50 20 v60 M40 32 c10-5 10-5 20 0 M40 45 c10-5 10-5 20 0 M40 58 c10-5 10-5 20 0" strokeLinecap="round" />
        <path d="M42 35 c5-10 11-10 16 0 c5 10-11 15-16 25 c-5 10 11 10 16 0" strokeWidth="2" strokeLinecap="round" />
        <path d="M58 35 c-5-10-11-10-16 0 c-5 10 11 15 16 25 c5 10-11 10-16 0" strokeWidth="2" strokeLinecap="round" />
        <path d="M50 25 c-15-15-25 0-5 5 c15-5 25-20 5-5" fill="currentColor" opacity="0.7" />
      </svg>
    )
  },
  {
    id: 'bsu',
    nameAr: 'جامعة بني سويف',
    nameEn: 'Beni-Suef University',
    abbr: 'BSU',
    theme: {
      from: '#2a5298',
      to: '#1e3c72',
      text: '#ffffff',
      shadow: 'rgba(42, 82, 152, 0.4)'
    },
    icon: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="50" cy="50" r="45" strokeWidth="2" opacity="0.3" />
        <path d="M25 65 c15 5 35-5 50 0 M20 72 c20 5 40-5 60 0" strokeWidth="2" opacity="0.7" />
        <path d="M45 25 v40 M45 28 l20 18 h-20" fill="currentColor" strokeLinejoin="round" />
        <path d="M35 63 h25 l-3 5 h-19z" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'fbsu',
    nameAr: 'جامعة فهد بن سلطان',
    nameEn: 'Fahad Bin Sultan University',
    abbr: 'FBSU',
    theme: {
      from: '#11998e',
      to: '#38ef7d',
      text: '#ffffff',
      shadow: 'rgba(56, 239, 125, 0.4)'
    },
    icon: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="50" cy="50" r="45" strokeWidth="2" opacity="0.3" />
        <circle cx="50" cy="50" r="30" strokeWidth="1.5" opacity="0.5" />
        <path d="M50 25 l4 10 l10 2 l-8 8 l3 11 l-9-6 l-9 6 l3-11 l-8-8 l10-2z" fill="currentColor" />
        <ellipse cx="50" cy="50" rx="42" ry="10" transform="rotate(-20 50 50)" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'bnu',
    nameAr: 'جامعة بنها الأهلية',
    nameEn: 'Benha National University',
    abbr: 'BNU',
    theme: {
      from: '#00c6ff',
      to: '#0072ff',
      text: '#ffffff',
      shadow: 'rgba(0, 114, 255, 0.4)'
    },
    icon: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="50" cy="50" r="45" strokeWidth="2" opacity="0.3" />
        <path d="M30 30 v40 h15 c10 0 10-15 0-15 c10 0 10-25 0-25 h-15z" strokeLinejoin="round" />
        <path d="M55 70 v-40 l15 25 v-25" />
        <path d="M78 30 v25 c0 10 12 10 12 0 v-25" />
      </svg>
    )
  }
];

const SEMESTERS = [
  { val: 1, ar: 'الترم الأول', en: '1st Semester' },
  { val: 2, ar: 'الترم الثاني', en: '2nd Semester' },
  { val: 3, ar: 'الترم الثالث', en: '3rd Semester' },
  { val: 4, ar: 'الترم الرابع', en: '4th Semester' },
  { val: 5, ar: 'الترم الخامس', en: '5th Semester' },
  { val: 6, ar: 'الترم السادس', en: '6th Semester' },
  { val: 7, ar: 'الترم السابع', en: '7th Semester' },
  { val: 8, ar: 'الترم الثامن', en: '8th Semester' },
  { val: 9, ar: 'الترم التاسع', en: '9th Semester' },
  { val: 10, ar: 'الترم العاشر', en: '10th Semester' }
];

const Courses = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user, loading: authLoading } = useContext(AuthContext);
  const [myPurchases, setMyPurchases] = useState([]);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const facultyId = searchParams.get('faculty');
  const semesterVal = searchParams.get('semester');

  const [subjects, setSubjects] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setMyPurchases([]);
      return;
    }
    const fetchPurchases = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/purchases/my-purchases', config);
        setMyPurchases(data);
      } catch (err) {
        console.error('Error fetching purchases:', err);
      }
    };
    fetchPurchases();
  }, [user, authLoading]);

  const selectedFaculty = FACULTIES.find(f => f.id === facultyId);
  const selectedSemester = SEMESTERS.find(s => s.val === Number(semesterVal));

  useEffect(() => {
    if (!facultyId || !semesterVal) {
      setSubjects({});
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/courses/subjects?faculty=${facultyId}&semester=${semesterVal}`);
        setSubjects(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setLoading(false);
      }
    };
    fetchCourses();
  }, [facultyId, semesterVal]);

  const selectFaculty = (id) => {
    setSearchParams({ faculty: id });
  };

  const selectSemester = (val) => {
    setSearchParams({ faculty: facultyId, semester: val.toString() });
  };

  const goBackToFaculties = () => {
    setSearchParams({});
  };

  const goBackToSemesters = () => {
    setSearchParams({ faculty: facultyId });
  };

  const hasCourses = Object.keys(subjects).length > 0;

  // 1. Render Faculty Selection View
  if (!facultyId) {
    return (
      <div className="courses-page">
        <div className="courses-header container">
          <h1>{t('materials')}</h1>
          <p className="subtitle">
            {isAr ? 'اختر الكلية أو الجامعة لعرض الأترام الدراسية والمواد' : 'Choose a college/university to explore study modules.'}
          </p>
        </div>

        <div className="faculties-grid container">
          {FACULTIES.map(fac => (
            <div 
              key={fac.id} 
              className="faculty-card glass-card"
              onClick={() => selectFaculty(fac.id)}
              style={{
                '--hover-glow': fac.theme.shadow,
                '--gradient-from': fac.theme.from,
                '--gradient-to': fac.theme.to
              }}
            >
              <div className="faculty-card-glow" />
              <div className="faculty-icon-wrapper" style={{ background: `linear-gradient(135deg, ${fac.theme.from}22, ${fac.theme.to}22)`, color: fac.theme.to }}>
                {fac.icon}
              </div>
              <span className="faculty-abbr" style={{ color: fac.theme.to }}>{fac.abbr}</span>
              <h3>{isAr ? fac.nameAr : fac.nameEn}</h3>
              <div className="faculty-action-btn">
                <span>{isAr ? 'عرض الفصول' : 'View Semesters'}</span>
                {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Render Semester Selection View
  if (!semesterVal) {
    return (
      <div className="courses-page">
        <div className="courses-header container">
          <button onClick={goBackToFaculties} className="back-btn glass-card">
            {isAr ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            <span>{isAr ? 'العودة للكليات' : 'Back to Faculties'}</span>
          </button>
          
          <h1 className="faculty-title">{isAr ? selectedFaculty?.nameAr : selectedFaculty?.nameEn}</h1>
          <p className="subtitle">
            {isAr ? 'اختر الفصل الدراسي (الترم) للوصول إلى الكورسات والمحاضرات' : 'Select a semester to view available courses.'}
          </p>
        </div>

        <div className="semesters-selection-grid container">
          {SEMESTERS.map(sem => (
            <div 
              key={sem.val} 
              className="semester-selection-card glass-card"
              onClick={() => selectSemester(sem.val)}
            >
              <div className="sem-number">{sem.val}</div>
              <div className="sem-info">
                <h3>{isAr ? sem.ar : sem.en}</h3>
                <p>{isAr ? `تصفح مواد الترم ${sem.val}` : `Explore courses for Sem ${sem.val}`}</p>
              </div>
              <div className="sem-arrow">
                {isAr ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Render Courses grouped by Subject View
  return (
    <div className="courses-page">
      <div className="courses-header container">
        <button onClick={goBackToSemesters} className="back-btn glass-card">
          {isAr ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          <span>{isAr ? 'العودة لاختيار الترم' : 'Back to Semesters'}</span>
        </button>

        <div className="breadcrumb-nav">
          <span onClick={goBackToFaculties} className="breadcrumb-link">{isAr ? selectedFaculty?.nameAr : selectedFaculty?.nameEn}</span>
          <span className="breadcrumb-separator">/</span>
          <span onClick={goBackToSemesters} className="breadcrumb-link">{isAr ? selectedSemester?.ar : selectedSemester?.en}</span>
        </div>

        <h1 className="faculty-title">
          {isAr ? `${selectedFaculty?.abbr} - ${selectedSemester?.ar}` : `${selectedFaculty?.abbr} - ${selectedSemester?.en}`}
        </h1>
        <p className="subtitle">{t('choose_discipline')}</p>
      </div>

      {loading || authLoading ? (
        <div className="courses-grid container">
          {[1, 2].map(i => (
            <div key={i} className="course-card" style={{ opacity: 0.4, animation: 'pulse 1.5s infinite' }}>
              <div style={{ height: '60px', background: 'var(--border-color)', borderRadius: '8px' }} />
            </div>
          ))}
        </div>
      ) : !hasCourses ? (
        <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem', color: 'var(--text-secondary)' }}>
          <div className="empty-courses-icon glass-card" style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <GraduationCap size={48} style={{ color: 'var(--text-secondary)', opacity: 0.6 }} />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>لا توجد كورسات مضافة في هذا الترم بعد</p>
          <p style={{ fontSize: '0.95rem', marginTop: '0.5rem', opacity: 0.8 }}>تفضل بزيارة لوحة التحكم كمعلم لإضافة وتفعيل الكورسات والمحاضرات هنا.</p>
          <button onClick={goBackToSemesters} className="btn-secondary" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {isAr ? 'العودة لاختيار ترم آخر' : 'Back to Semesters'}
          </button>
        </div>
      ) : (
        <div className="subjects-container container animate-fade-in">
          {Object.entries(subjects).map(([subjectName, coursesList], idx) => {
            const palette = SUBJECT_PALETTES[idx % SUBJECT_PALETTES.length];
            return (
              <div key={subjectName} className="subject-section">
                <div className="subject-header" style={{
                  background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
                  boxShadow: `0 4px 20px ${palette.shadow}`
                }}>
                  <h2>{subjectName}</h2>
                  <span>{coursesList.length} {coursesList.length === 1 ? 'كورس' : 'كورسات'}</span>
                </div>
                <div className="semesters-inline-grid">
                  {coursesList.map(course => {
                    const isCoursePurchased = myPurchases.some(p => p.course?._id === course._id && p.status === 'approved');
                    const isSubjectPurchased = myPurchases.some(p => 
                      p.subject === course.subject && 
                      p.faculty === course.faculty && 
                      p.semester === course.semester && 
                      p.status === 'approved'
                    );
                    const isAdmin = user && user.role === 'admin';
                    const hasAccess = user && (isAdmin || isCoursePurchased || isSubjectPurchased);

                    return (
                      <Link key={course._id} to={`/course/${course._id}`} className="semester-inline-card glass-card">
                        <div className="semester-badge pharm" style={{ background: `${palette.from}25`, color: palette.to }}>{course.semester} sem</div>
                        <h3>{course.title}</h3>
                        <p>{course.description.substring(0, 80)}...</p>
                        <div className="course-price">
                          {course.price === 0
                            ? <span className="badge-free">{isAr ? 'مجاني' : 'Free'}</span>
                            : isAdmin
                              ? <span className="badge-admin" style={{color: '#3b82f6', fontWeight: 'bold'}}>{isAr ? '🔧 لوحة المسؤول' : '🔧 Admin Mode'}</span>
                              : hasAccess
                                ? <span className="badge-purchased" style={{color: '#10b981', fontWeight: 'bold'}}>{isAr ? '✅ تم الشراء' : '✅ Purchased'}</span>
                                : <span className="badge-price" style={{display: 'inline-flex', alignItems: 'center', gap: '4px', direction: 'rtl'}}><span>{course.price}</span><span>{isAr ? 'جنيه' : 'EGP'}</span></span>
                          }
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;
