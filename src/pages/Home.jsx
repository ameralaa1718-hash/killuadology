import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, Target, ArrowLeft, ArrowRight } from 'lucide-react';
import doctorImg from '../assets/dr_killua.jpg';
import './Home.css';

const Home = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="home-page">
      <div className="hero-section container">
        <div className="hero-container">
          <div className="hero-text">
            <h1 className="hero-title text-gradient" style={{ fontWeight: 800 }}>
              Dr. Aya Medical Academy
            </h1>
            <p className="hero-subtitle">
              Professional medical courses, high-quality resources, and a clear path to academic success.
            </p>
            <div className="hero-cta">
              <Link to="/courses" className="btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1.1rem', borderRadius: '12px' }}>
                <span>{isAr ? 'تصفح الكليات' : 'Browse Faculties'}</span>
                {isAr ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
              </Link>
            </div>
          </div>
          
          <div className="hero-image-wrapper">
            <img 
              src={doctorImg} 
              alt="Dr. Killua - Killuadology" 
              className="hero-image" 
            />
          </div>
        </div>
      </div>

      <div className="features-section container">
        <div className="feature-card glass-card">
          <Activity className="feature-icon" size={40} />
          <div className="feature-text">
            <h3>{isAr ? 'تقدم مستمر' : 'Continuous Progress'}</h3>
            <p>{isAr ? 'اختبارات وتقييم دوري' : 'Regular tests & evaluations'}</p>
          </div>
        </div>
        
        <div className="feature-card glass-card">
          <Target className="feature-icon" size={40} />
          <div className="feature-text">
            <h3>{isAr ? 'محتوى منظم' : 'Structured Content'}</h3>
            <p>{isAr ? 'وفهم أسرع للمعلومة' : 'Faster understanding of concepts'}</p>
          </div>
        </div>

        <div className="feature-card glass-card">
          <BookOpen className="feature-icon" size={40} />
          <div className="feature-text">
            <h3>{isAr ? 'شرح مبسط' : 'Simplified Explanations'}</h3>
            <p>{isAr ? 'بأعلى جودة ومقاييس علمية' : 'Highest quality academic standards'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
