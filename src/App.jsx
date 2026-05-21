import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './components/Navbar'
import FloatingSupport from './components/FloatingSupport'
import Home from './pages/Home'
import Login from './pages/Login'
import Courses from './pages/Courses'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Register from './pages/Register'
import Lectures from './pages/Lectures'
import LessonView from './pages/LessonView'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageCourses from './pages/admin/ManageCourses'
import ManagePurchases from './pages/admin/ManagePurchases'
import ManageLessons from './pages/admin/ManageLessons'
import ManageNotifications from './pages/admin/ManageNotifications'
import ManageSettings from './pages/admin/ManageSettings'
import ManageQuizSubmissions from './pages/admin/ManageQuizSubmissions'

function App() {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Handle theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle language and RTL/LTR changes
  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="app-container">
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        toggleLanguage={toggleLanguage} 
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/register" element={<Register />} />
          <Route path="/course/:courseId" element={<Lectures />} />
          <Route path="/course/:courseId/lesson/:lessonId" element={<LessonView />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/courses" element={<AdminRoute><ManageCourses /></AdminRoute>} />
          <Route path="/admin/courses/:courseId/lessons" element={<AdminRoute><ManageLessons /></AdminRoute>} />
          <Route path="/admin/purchases" element={<AdminRoute><ManagePurchases /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><ManageNotifications /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><ManageSettings /></AdminRoute>} />
          <Route path="/admin/quiz-submissions" element={<AdminRoute><ManageQuizSubmissions /></AdminRoute>} />
        </Routes>
      </main>
      <FloatingSupport />
    </div>
  )
}

export default App
