import { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, error, loading, setError } = useContext(AuthContext);
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings in Login:', err);
      }
    };
    fetchSettings();
  }, []);

  // Formatter helpers for support URLs
  const getWhatsAppUrl = (number) => {
    if (!number) {
      const envUrl = import.meta.env.VITE_WHATSAPP_URL;
      if (envUrl) return envUrl;
      return "https://wa.me/201000000000";
    }
    
    const trimmed = number.trim();
    
    // If it's already a full link
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // If it starts with wa.me
    if (trimmed.startsWith('wa.me/')) {
      return `https://${trimmed}`;
    }
    
    // Clean from non-digits
    let cleaned = trimmed.replace(/\D/g, '');
    
    // Handle Egyptian numbers: 11 digits starting with 0 (e.g., 010..., 011..., 012..., 015...)
    // If it has 11 digits and starts with '0', strip the leading '0' and prepend '20' (Egypt code)
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = '20' + cleaned.substring(1);
    }
    
    return `https://wa.me/${cleaned}`;
  };

  const getTelegramUrl = (username) => {
    if (!username) {
      const envUrl = import.meta.env.VITE_TELEGRAM_URL;
      if (envUrl) return envUrl;
      return "https://t.me/username";
    }
    
    const trimmed = username.trim();
    
    // If it's already a full link
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // If it starts with t.me
    if (trimmed.startsWith('t.me/')) {
      return `https://${trimmed}`;
    }
    
    // Clean starting @
    let cleaned = trimmed;
    if (cleaned.startsWith('@')) {
      cleaned = cleaned.substring(1);
    }
    
    return `https://t.me/${cleaned}`;
  };

  const whatsappUrl = getWhatsAppUrl(settings?.whatsappNumber);
  const telegramUrl = getTelegramUrl(settings?.telegramUsername);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    const success = await login(email, password);
    if (success) {
      navigate('/courses'); // Redirect on success
    }
  };

  return (
    <div className="login-page flex-center">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="login-logo flex-center">
            <span>Killuadology</span>
            <Stethoscope size={24} className="logo-icon" />
          </div>
          <h2>{t('welcome')}</h2>
          <p className="subtitle">{t('login_to_access')}</p>
        </div>

        {error && <div className="error-message" style={{color: '#ef4444', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px'}}>{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">{t('email')}</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="example@gmail.com"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">{t('password')}</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                placeholder="........"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <span>{t('remember_me')}</span>
              <input type="checkbox" />
            </label>
          </div>

          <button type="submit" className="btn-primary login-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : t('login')}
          </button>
        </form>

        <div className="register-prompt" style={{ marginTop: '2rem' }}>
          <span>{t('no_account')}</span>
          <Link to="/register" className="register-link">{t('create_account')}</Link>
        </div>

        {/* Technical Support Section inside Card */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>الدعم الفني والاشتراكات:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="support-link-inline whatsapp-text-btn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.637-1.03-5.112-2.905-6.986-1.875-1.875-4.37-2.907-7.01-2.909-5.439 0-9.868 4.421-9.871 9.867-.002 1.76.461 3.474 1.34 5.003l-.999 3.648 3.757-.985zm11.332-6.52c-.299-.15-1.77-.874-2.043-.974-.275-.1-.475-.15-.675.15-.2.3-.77.974-.944 1.174-.173.2-.347.225-.647.075-.3-.15-1.264-.467-2.41-1.485-.89-.795-1.49-1.777-1.664-2.077-.173-.3-.018-.462.13-.61.135-.135.3-.349.45-.525.15-.175.2-.299.3-.499.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.52-.174-.007-.375-.008-.575-.008-.2 0-.525.075-.8.375-.276.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.224 5.11 4.522.714.309 1.272.494 1.707.633.715.227 1.366.195 1.88.118.574-.085 1.77-.724 2.02-1.399.25-.675.25-1.25.175-1.399-.075-.15-.275-.225-.575-.375z"/>
              </svg>
              <span>واتساب</span>
            </a>
            <a 
              href={telegramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="support-link-inline telegram-text-btn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M11.944 0C5.337 0 0 5.337 0 11.944c0 6.607 5.337 11.944 11.944 11.944 6.607 0 11.944-5.337 11.944-11.944C23.888 5.337 18.551 0 11.944 0zm5.862 8.133l-1.954 9.213c-.145.656-.537.818-1.084.508l-2.983-2.2c-.144-.139-.278-.291-.07-.535l1.977-1.89c.86-.78.188-1.21-.822-.533l-5.105 3.224-2.9-.908c-.63-.197-.643-.63.131-.933l11.34-4.37c.525-.197.984.118.815.695z"/>
              </svg>
              <span>تليجرام</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
