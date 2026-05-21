import { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, Stethoscope, User, Settings, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme, toggleLanguage }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <span>Killuadology</span>
          <Stethoscope className="logo-icon" size={24} />
        </Link>
        
        {/* Desktop Links */}
        <div className="navbar-links">
          <NavLink to="/" className="nav-link" end>{t('home')}</NavLink>
          <NavLink to="/courses" className="nav-link">{t('courses')}</NavLink>
          <NavLink to="/notifications" className="nav-link">{t('notifications')}</NavLink>
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions-desktop">
          <button onClick={toggleLanguage} className="icon-btn" aria-label="Toggle Language">
            <Globe size={20} />
            <span className="lang-text">{i18n.language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
          
          <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn-primary login-btn" style={{backgroundColor: '#8b5cf6'}}>
                  <Settings size={18} />
                  {i18n.language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                </Link>
              )}
              <Link to="/profile" className="nav-link" style={{fontWeight: 600}}>
                {user.fullName.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn-primary login-btn" style={{backgroundColor: '#ef4444'}}>
                {t('logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary login-btn">
              <User size={18} />
              {t('login')}
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="mobile-menu-toggle icon-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Mobile Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-drawer glass-card animate-fade-in">
          <div className="mobile-drawer-links">
            <NavLink to="/" className="mobile-nav-link" onClick={closeMobileMenu} end>{t('home')}</NavLink>
            <NavLink to="/courses" className="mobile-nav-link" onClick={closeMobileMenu}>{t('courses')}</NavLink>
            <NavLink to="/notifications" className="mobile-nav-link" onClick={closeMobileMenu}>{t('notifications')}</NavLink>
          </div>
          
          <div className="mobile-drawer-divider"></div>
          
          <div className="mobile-drawer-actions">
            <div className="mobile-action-row">
              <button onClick={toggleLanguage} className="icon-btn" aria-label="Toggle Language">
                <Globe size={20} />
                <span className="lang-text">{i18n.language === 'ar' ? 'English' : 'عربي'}</span>
              </button>
              
              <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle Theme">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                <span>{theme === 'dark' ? (i18n.language === 'ar' ? 'وضع النهار' : 'Light Mode') : (i18n.language === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}</span>
              </button>
            </div>

            {user ? (
              <div className="mobile-user-section">
                <Link to="/profile" className="mobile-nav-link profile-link" onClick={closeMobileMenu} style={{fontWeight: 600, textAlign: 'center'}}>
                  👤 {user.fullName}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="btn-primary mobile-btn-full" onClick={closeMobileMenu} style={{backgroundColor: '#8b5cf6', width: '100%'}}>
                    <Settings size={18} />
                    {i18n.language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-primary mobile-btn-full" style={{backgroundColor: '#ef4444', width: '100%'}}>
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary mobile-btn-full" onClick={closeMobileMenu} style={{width: '100%'}}>
                <User size={18} />
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
