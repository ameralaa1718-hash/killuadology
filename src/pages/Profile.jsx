import { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Video, LogOut, BookOpen } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'courses', 'favorites'
  
  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [password, setPassword] = useState('');

  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhoneNumber(user.phoneNumber);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'courses') {
      fetchMyCourses();
    }
  }, [activeTab]);

  const fetchMyCourses = async () => {
    try {
      setLoadingCourses(true);
      const { data } = await axios.get('/api/auth/my-courses');
      setMyCourses(data);
      setLoadingCourses(false);
    } catch (error) {
      console.error(error);
      setLoadingCourses(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    
    const updatedData = { fullName, email, phoneNumber };
    if (password) {
      updatedData.password = password;
    }

    const success = await updateUser(updatedData);
    if (success) {
      setSuccessMsg(t('update_success') || 'تم تحديث البيانات بنجاح');
      setPassword('');
    } else {
      setErrorMsg(t('update_failed') || 'فشل في التحديث');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null; // Wait for redirect

  return (
    <div className="profile-page container">
      <div className="profile-header">
        <h2>
          {activeTab === 'personal' && t('personal_data')}
          {activeTab === 'courses' && t('my_courses')}
        </h2>
      </div>
      <div className="profile-layout">
        <aside className="profile-sidebar glass-card">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <UserIcon size={20} />
              <span>{t('personal_data')}</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <Video size={20} />
              <span>{t('my_courses')}</span>
            </button>

            
            <div className="nav-divider"></div>
            
            <button className="nav-item logout-link" onClick={handleLogout}>
              <LogOut size={20} />
              <span>{t('logout')}</span>
            </button>
          </nav>
        </aside>

        <main className="profile-content">
          <div className="profile-card glass-card">
            
            {/* Personal Data Tab */}
            {activeTab === 'personal' && (
              <>
                <div className="profile-avatar-section">
                  <div className="avatar-circle">
                    <span>{user.fullName.charAt(0).toUpperCase()}</span>
                  </div>
                  <h3>{user.fullName}</h3>
                  <p className="subtitle">{user.email}</p>
                </div>

                <div className="profile-form-section">
                  {successMsg && <div className="success-message" style={{color: '#10b981', marginBottom: '1rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '4px'}}>{successMsg}</div>}
                  {errorMsg && <div className="error-message" style={{color: '#ef4444', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px'}}>{errorMsg}</div>}
                  
                  <form className="profile-form" onSubmit={handleUpdate}>
                    <div className="form-group">
                      <label className="label">{t('full_name')}</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="label">{t('email')}</label>
                      <input 
                        type="email" 
                        className="input-field" 
                        value={email}
                        dir="ltr"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="label">{t('phone_number')}</label>
                      <input 
                        type="tel" 
                        className="input-field" 
                        value={phoneNumber}
                        dir="ltr"
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="label">{t('password')} (اتركه فارغاً إذا لم ترد تغييره)</label>
                      <input 
                        type="password" 
                        className="input-field" 
                        placeholder="........"
                        dir="ltr"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <div className="form-submit-full">
                      <button type="submit" className="btn-primary update-btn">
                        تحديث البيانات
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {/* My Courses Tab */}
            {activeTab === 'courses' && (
              <div className="tab-content">
                {loadingCourses ? (
                  <p style={{textAlign: 'center', padding: '2rem'}}>{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
                ) : myCourses.length > 0 ? (
                  <div className="courses-grid">
                    {myCourses.map((course) => (
                      <Link key={course._id} to={`/course/${course._id}`} className="course-card">
                        <div className="course-card-content">
                          <div className="course-card-header">
                            <span className="course-badge">{isAr ? `الترم ${course.semester}` : `Semester ${course.semester}`}</span>
                            {course.faculty && <span className="faculty-badge">{course.faculty.toUpperCase()}</span>}
                          </div>
                          <h3>{course.title}</h3>
                          <p className="course-desc">{course.description ? `${course.description.substring(0, 100)}...` : ''}</p>
                        </div>
                        <div className="course-card-footer">
                          <span className="learn-btn">
                            {isAr ? 'ابدأ التعلم' : 'Start Learning'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <BookOpen size={48} style={{opacity: 0.5}} />
                    <p>{isAr ? 'أنت لست مشتركاً في أي كورس حالياً.' : 'You are not enrolled in any courses yet.'}</p>
                    <Link to="/courses" className="btn-primary empty-state-btn">
                      {isAr ? 'تصفح الكورسات المتاحة' : 'Browse Available Courses'}
                    </Link>
                  </div>
                )}
              </div>
            )}



          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
