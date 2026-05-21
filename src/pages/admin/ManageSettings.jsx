import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, Save, Settings as SettingsIcon, CreditCard, MessageSquare } from 'lucide-react';
import './AdminDashboard.css';

const ManageSettings = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [vodafoneNumber, setVodafoneNumber] = useState('');
  const [instaPayAccount, setInstaPayAccount] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('/api/admin/settings', config);
        setWhatsappNumber(data.whatsappNumber || '');
        setTelegramUsername(data.telegramUsername || '');
        setVodafoneNumber(data.vodafoneNumber || '');
        setInstaPayAccount(data.instaPayAccount || '');
        setLoading(false);
      } catch (err) {
        console.error(err);
        setMessage({
          type: 'error',
          text: isAr ? '❌ فشل تحميل الإعدادات' : '❌ Failed to load settings'
        });
        setLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user, isAr]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      };

      const { data } = await axios.put('/api/admin/settings', {
        whatsappNumber,
        telegramUsername,
        vodafoneNumber,
        instaPayAccount
      }, config);

      setWhatsappNumber(data.whatsappNumber || '');
      setTelegramUsername(data.telegramUsername || '');
      setVodafoneNumber(data.vodafoneNumber || '');
      setInstaPayAccount(data.instaPayAccount || '');

      setMessage({
        type: 'success',
        text: isAr ? '✅ تم حفظ التعديلات بنجاح' : '✅ Settings saved successfully'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: isAr ? '❌ فشل حفظ التعديلات' : '❌ Failed to save settings'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <Link to="/admin" className="back-btn glass-card" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
          {isAr ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          <span>{isAr ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</span>
        </Link>
        
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SettingsIcon size={32} style={{ color: 'var(--accent-primary)' }} />
          <span>{isAr ? 'إعدادات المنصة' : 'Platform Settings'}</span>
        </h1>
        <p className="subtitle">
          {isAr ? 'تحكم في أرقام الدفع وحسابات التواصل الاجتماعي للمنصة' : 'Manage payment phone numbers and official support links'}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-secondary)' }}>
          {isAr ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {message.text && (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              fontWeight: 600,
              backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: message.type === 'success' ? '#10b981' : '#ef4444',
              border: message.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
            }}>
              {message.text}
            </div>
          )}

          {/* 1. Payment Settings Section */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
              <CreditCard size={22} />
              <span>{isAr ? 'بيانات وطرق الدفع' : 'Payment Information'}</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                  {isAr ? 'رقم فودافون كاش (Vodafone Cash)' : 'Vodafone Cash Number'}
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={vodafoneNumber}
                  onChange={(e) => setVodafoneNumber(e.target.value)}
                  placeholder="مثال: 01012345678"
                  required
                  style={{ width: '100%' }}
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                  {isAr ? 'الرقم الذي سيقوم الطلاب بالتحويل إليه عند اختيار وسيلة فودافون كاش.' : 'The phone number students will send cash transfer to.'}
                </small>
              </div>

              <div className="form-group">
                <label className="label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                  {isAr ? 'حساب أو رابط إنستاباي (InstaPay Username/Address)' : 'InstaPay Username/Address'}
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={instaPayAccount}
                  onChange={(e) => setInstaPayAccount(e.target.value)}
                  placeholder="مثال: username@instapay"
                  required
                  style={{ width: '100%' }}
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                  {isAr ? 'عنوان InstaPay IPA أو رقم الهاتف المرتبط بالحساب الخاص بالمنصة.' : 'The InstaPay address (IPA) or telephone number associated with your platform.'}
                </small>
              </div>
            </div>
          </div>

          {/* 2. Support Settings Section */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
              <MessageSquare size={22} />
              <span>{isAr ? 'روابط وقنوات الدعم الفني' : 'Support Channels'}</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                  {isAr ? 'رقم الواتساب للدعم (رمز الدولة + الرقم بدون أصفار)' : 'WhatsApp Support Number (Country Code + Number without leading zeros)'}
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="مثال: 201012345678"
                  required
                  style={{ width: '100%' }}
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                  {isAr ? 'اكتب الرقم متضمناً كود الدولة بدون علامة (+) أو (00). مثال لمصر: 201012345678.' : 'Include country code without (+) or (00). Example for Egypt: 201012345678.'}
                </small>
              </div>

              <div className="form-group">
                <label className="label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                  {isAr ? 'اسم مستخدم التليجرام للدعم (Telegram Username)' : 'Telegram Username'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: isAr ? 'auto' : '15px', right: isAr ? '15px' : 'auto', color: 'var(--text-secondary)', direction: 'ltr' }}>t.me/</span>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    placeholder="مثال: Username"
                    required
                    style={{ 
                      width: '100%', 
                      paddingLeft: isAr ? '1rem' : '4rem', 
                      paddingRight: isAr ? '4rem' : '1rem',
                      direction: 'ltr' 
                    }}
                  />
                </div>
                <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                  {isAr ? 'اسم مستخدم التليجرام الخاص بك أو بمندوب الدعم (بدون رمز @).' : 'Your Telegram handle or support agent username (without @ symbol).'}
                </small>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2.5rem', fontSize: '1.05rem' }}
            >
              <Save size={20} />
              <span>{saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التعديلات' : 'Save Settings')}</span>
            </button>
          </div>

        </form>
      )}
    </div>
  );
};

export default ManageSettings;
