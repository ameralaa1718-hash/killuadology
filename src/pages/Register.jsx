import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, error, loading, setError } = useContext(AuthContext);
  
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !phoneNumber || !password) {
      setError('Please fill in all fields');
      return;
    }
    const success = await register(fullName, email, phoneNumber, password);
    if (success) {
      navigate('/courses');
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
          <h2>{t('create_account')}</h2>
          <p className="subtitle">{t('register_subtitle')}</p>
        </div>

        {error && <div className="error-message" style={{color: '#ef4444', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px'}}>{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">{t('full_name')}</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Your Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

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
            <label className="label">{t('phone_number')}</label>
            <input 
              type="tel" 
              className="input-field" 
              placeholder="01012345678"
              dir="ltr"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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

          <button type="submit" className="btn-primary login-submit-btn" style={{marginTop: '1rem'}} disabled={loading}>
            {loading ? 'Processing...' : t('create_account')}
          </button>
        </form>

        <div className="register-prompt" style={{ marginTop: '2rem' }}>
          <span>{t('already_have_account')}</span>
          <Link to="/login" className="register-link">{t('login')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
