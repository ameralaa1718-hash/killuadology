import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Users, BookOpen, ShoppingCart, TrendingUp, Plus, Search, X, Settings, Award } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalPurchases: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  // Student management states
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Password management states
  const [editingUser, setEditingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/admin/stats');
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const { data } = await axios.get('/api/admin/users');
      setUsers(data);
      setUsersLoading(false);
    } catch (err) {
      setUsersError(err.response?.data?.message || err.message);
      setUsersLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg(isAr ? '❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل' : '❌ Password must be at least 6 characters');
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg('');
    try {
      const { data } = await axios.put(`/api/admin/users/${editingUser._id}/password`, { newPassword });
      setPasswordMsg(`✅ ${isAr ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully'}`);
      setNewPassword('');
      setTimeout(() => {
        setEditingUser(null);
        setPasswordMsg('');
      }, 2000);
    } catch (err) {
      setPasswordMsg(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteUser = async (userId, userFullName) => {
    const confirmDelete = window.confirm(
      isAr 
        ? `هل أنت متأكد من رغبتك في حذف حساب الطالب "${userFullName}" نهائياً؟` 
        : `Are you sure you want to permanently delete user "${userFullName}"?`
    );
    if (!confirmDelete) return;

    try {
      const { data } = await axios.delete(`/api/admin/users/${userId}`);
      alert(isAr ? '✅ تم حذف الحساب بنجاح' : `✅ ${data.message}`);
      // Refresh the users list
      fetchUsers();
      // Refetch stats to update "Total Students" count
      const { data: statsData } = await axios.get('/api/admin/stats');
      setStats(statsData);
    } catch (err) {
      alert(isAr ? `❌ فشل حذف الحساب: ${err.response?.data?.message || err.message}` : `❌ Failed to delete: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenUsers = () => {
    setShowUsersModal(true);
    fetchUsers();
  };

  const statCards = [
    { 
      label: isAr ? 'إجمالي الطلاب' : 'Total Students', 
      value: stats.totalUsers, 
      icon: <Users size={28} />, 
      color: '#3b82f6',
      onClick: handleOpenUsers 
    },
    { 
      label: isAr ? 'الكورسات المتاحة' : 'Available Courses', 
      value: stats.totalCourses, 
      icon: <BookOpen size={28} />, 
      color: '#10b981' 
    },
    { 
      label: isAr ? 'المشتريات المعتمدة' : 'Approved Purchases', 
      value: stats.totalPurchases, 
      icon: <ShoppingCart size={28} />, 
      color: '#f59e0b' 
    },
    { 
      label: isAr ? 'إجمالي الإيرادات (جنيه)' : 'Total Revenue (EGP)', 
      value: stats.revenue.toLocaleString(), 
      icon: <TrendingUp size={28} />, 
      color: '#8b5cf6' 
    },
  ];

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (user.fullName && user.fullName.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.phoneNumber && user.phoneNumber.includes(query))
    );
  });

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <h1>{isAr ? 'لوحة تحكم المعلم' : 'Teacher Dashboard'}</h1>
        <p className="subtitle">{isAr ? 'مرحباً بك! إليك نظرة عامة على منصة Killuadology' : 'Welcome back! Here is your Killuadology platform overview.'}</p>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1,2,3,4].map(i => <div key={i} className="stat-card-skeleton glass-card" />)}
        </div>
      ) : (
        <div className="stats-grid">
          {statCards.map((card, i) => (
            <div 
              key={i} 
              className={`stat-card glass-card ${card.onClick ? 'clickable-stat' : ''}`}
              onClick={card.onClick}
              style={card.onClick ? { cursor: 'pointer' } : {}}
            >
              <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                {card.icon}
              </div>
              <div className="stat-info">
                <span className="stat-value">{card.value}</span>
                <span className="stat-label">{card.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-actions">
        <h2>{isAr ? 'إجراءات سريعة' : 'Quick Actions'}</h2>
        <div className="actions-grid">
          <Link to="/admin/courses" className="action-card glass-card">
            <Plus size={36} />
            <h3>{isAr ? 'إدارة الكورسات' : 'Manage Courses'}</h3>
            <p>{isAr ? 'أضف كورسات جديدة أو عدّل الموجودة' : 'Add new courses or edit existing ones'}</p>
          </Link>
          <Link to="/admin/purchases" className="action-card glass-card">
            <ShoppingCart size={36} />
            <h3>{isAr ? 'إدارة المشتريات' : 'Manage Purchases'}</h3>
            <p>{isAr ? 'راجع طلبات الشراء وأعتمدها أو ارفضها' : 'Review and approve or reject purchase requests'}</p>
          </Link>
          <Link to="/admin/courses" className="action-card glass-card">
            <BookOpen size={36} />
            <h3>{isAr ? 'إدارة المحاضرات' : 'Manage Lectures'}</h3>
            <p>{isAr ? 'اختر كورساً لإضافة أو تعديل محاضراته' : 'Select a course to add or edit its lectures'}</p>
          </Link>
          <Link to="/admin/notifications" className="action-card glass-card">
            <Users size={36} />
            <h3>{isAr ? 'إدارة الإشعارات' : 'Manage Notifications'}</h3>
            <p>{isAr ? 'أرسل رسائل وإعلانات لجميع الطلاب' : 'Send messages and announcements to all students'}</p>
          </Link>
          <Link to="/admin/quiz-submissions" className="action-card glass-card">
            <Award size={36} />
            <h3>{isAr ? 'نتائج الاختبارات' : 'Quiz Results'}</h3>
            <p>{isAr ? 'عرض وتتبع درجات الطلاب وبياناتهم التفصيلية لكل اختبار' : 'View and track student scores and details for each quiz'}</p>
          </Link>
          <Link to="/admin/settings" className="action-card glass-card">
            <Settings size={36} />
            <h3>{isAr ? 'إعدادات المنصة' : 'Platform Settings'}</h3>
            <p>{isAr ? 'تحكم في أرقام الدفع وحسابات الدعم الفني' : 'Manage payment options and social media links'}</p>
          </Link>
        </div>
      </div>

      {/* Students List Modal */}
      {showUsersModal && (
        <div className="admin-modal-overlay" onClick={() => setShowUsersModal(false)}>
          <div className="modal-card glass-card user-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isAr ? 'بيانات الطلاب المسجلين' : 'Registered Students Data'}</h2>
              <button className="close-btn" onClick={() => setShowUsersModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="search-bar-wrapper">
              <div className="search-input-container">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="input-field search-input"
                  placeholder={isAr ? 'ابحث باسم الطالب، البريد الإلكتروني، أو رقم الهاتف...' : 'Search by name, email, or phone...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {usersLoading ? (
              <p className="loading-text">{isAr ? 'جاري تحميل بيانات الطلاب...' : 'Loading students data...'}</p>
            ) : usersError ? (
              <p className="error-text">{usersError}</p>
            ) : filteredUsers.length === 0 ? (
              <p className="empty-text">{isAr ? 'لا يوجد طلاب يطابقون بحثك' : 'No students matching your search'}</p>
            ) : (
              <div className="modal-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{isAr ? 'الاسم' : 'Name'}</th>
                      <th>{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                      <th>{isAr ? 'رقم الهاتف' : 'Phone'}</th>
                      <th>{isAr ? 'تاريخ التسجيل' : 'Registered At'}</th>
                      <th>{isAr ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td style={{ fontWeight: 600 }}>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn-primary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                              onClick={() => { setEditingUser(user); setPasswordMsg(''); }}
                            >
                              {isAr ? 'تغيير كلمة المرور' : 'Reset Password'}
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}
                              onClick={() => handleDeleteUser(user._id, user.fullName)}
                            >
                              {isAr ? 'حذف الحساب' : 'Delete Account'}
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
      )}

      {/* Password Reset Sub-Modal */}
      {editingUser && (
        <div className="admin-modal-overlay password-reset-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-card glass-card password-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isAr ? `تغيير كلمة مرور: ${editingUser.fullName}` : `Reset Password for: ${editingUser.fullName}`}</h3>
              <button className="close-btn" onClick={() => setEditingUser(null)}>
                <X size={18} />
              </button>
            </div>
            
            {passwordMsg && (
              <p style={{ margin: '1rem 0', color: passwordMsg.startsWith('✅') ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {passwordMsg}
              </p>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="label">{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                <input
                  type="password"
                  className="input-field"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={isAr ? 'اكتب 6 أحرف على الأقل...' : 'At least 6 characters...'}
                  required
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>{isAr ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="btn-primary" disabled={passwordSaving}>
                  {passwordSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ كلمة المرور' : 'Save Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
