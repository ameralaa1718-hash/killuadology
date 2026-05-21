import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, Upload, CheckCircle } from 'lucide-react';
import '../pages/admin/AdminModal.css';

const CheckoutModal = ({ purchaseType = 'course', target, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [paymentMethod, setPaymentMethod] = useState('Vodafone Cash');
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const vodafoneNumber = settings?.vodafoneNumber || "01000000000";
  const instaPayAccount = settings?.instaPayAccount || "killuadology@instapay";

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiptFile) {
      setError('يرجى إرفاق صورة إيصال التحويل');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('amountPaid', target.price);
      formData.append('paymentMethod', paymentMethod);
      formData.append('receipt', receiptFile);

      if (purchaseType === 'course') {
        formData.append('courseId', target._id);
      } else if (purchaseType === 'lesson') {
        formData.append('lessonId', target._id);
      } else if (purchaseType === 'subject') {
        formData.append('subject', target.name);
        formData.append('faculty', target.faculty);
        formData.append('semester', target.semester);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      };

      await axios.post('/api/purchases', formData, config);
      
      setSuccess(true);
      setLoading(false);
      
      // Close after short delay and notify parent
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ maxWidth: '500px', width: '90%' }}>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        <h2 style={{ marginBottom: '0.5rem' }}>
          {purchaseType === 'course' && `شراء كورس: ${target?.title}`}
          {purchaseType === 'lesson' && `شراء محاضرة: ${target?.title}`}
          {purchaseType === 'subject' && `شراء مادة: ${target?.name}`}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          السعر المطلوب: <strong style={{ color: 'var(--primary-color)' }}>{target?.price} جنيه</strong>
        </p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#10b981' }}>تم إرسال طلبك بنجاح!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>ستقوم الإدارة بمراجعة الإيصال وتفعيل محتواك قريباً.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && <div className="error-text" style={{ color: '#ef4444', backgroundColor: '#ef444420', padding: '0.75rem', borderRadius: '4px' }}>{error}</div>}
            
            <div className="form-group">
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>اختر طريقة الدفع</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    value="Vodafone Cash" 
                    checked={paymentMethod === 'Vodafone Cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  ڤودافون كاش
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    value="InstaPay" 
                    checked={paymentMethod === 'InstaPay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  إنستاباي (InstaPay)
                </label>
              </div>
            </div>

            <div className="payment-instructions glass-card" style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              {paymentMethod === 'Vodafone Cash' ? (
                <>
                  <p>يرجى تحويل مبلغ <strong>{target?.price} جنيه</strong> إلى رقم ڤودافون كاش التالي:</p>
                  <h3 style={{ margin: '0.5rem 0', color: 'var(--primary-color)', letterSpacing: '2px' }}>{vodafoneNumber}</h3>
                </>
              ) : (
                <>
                  <p>يرجى تحويل مبلغ <strong>{target?.price} جنيه</strong> إلى حساب إنستاباي التالي:</p>
                  <h3 style={{ margin: '0.5rem 0', color: 'var(--primary-color)' }}>{instaPayAccount}</h3>
                </>
              )}
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>صورة الإيصال (Screenshot)</label>
              <div style={{ 
                border: '2px dashed var(--border-color)', 
                padding: '2rem', 
                textAlign: 'center', 
                borderRadius: '8px',
                cursor: 'pointer' 
              }}>
                <Upload size={32} style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'جاري الإرسال...' : 'إرسال طلب الشراء'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
