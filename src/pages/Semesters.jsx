import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import './Semesters.css';

const Semesters = () => {
  const { t } = useTranslation();
  const { courseId } = useParams();
  
  // Format course name for display (e.g., 'internal-medicine' -> 'Internal Medicine')
  const courseName = courseId.replace('-', '_');

  const semesters = [1, 2, 3, 4, 5, 6];

  return (
    <div className="semesters-page container">
      <div className="page-header">
        <h1>{t(courseName) !== courseName ? t(courseName) : courseId.replace('-', ' ').toUpperCase()}</h1>
        <p className="subtitle">Choose a semester to view lectures</p>
      </div>

      <div className="semesters-grid">
        {semesters.map((num) => (
          <Link 
            key={num} 
            to={`/course/${courseId}/semester/${num}`} 
            className="semester-card glass-card"
          >
            <div className="semester-icon-wrapper">
              <BookOpen size={32} />
            </div>
            <h2>Semester {num}</h2>
            <p>12 Lectures inside</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Semesters;
