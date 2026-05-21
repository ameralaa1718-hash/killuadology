import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "welcome": "Welcome",
            "login_to_access": "Login to access your account",
            "email": "Email",
            "password": "Password",
            "forgot_password": "Forgot Password?",
            "remember_me": "Remember me",
            "login": "Login",
            "or": "OR",
            "no_account": "Don't have an account?",
            "create_account": "Create account",
            "home": "Home",
            "courses": "Courses",
            "contact_us": "Contact Us",
            "notifications": "Notifications",
            "search_cases": "Search cases...",
            "clinical_cases_hub": "Clinical Cases Hub",
            "choose_discipline": "Choose your discipline to explore real-world scenarios.",
            "internal_medicine": "Internal Medicine",
            "surgery": "Surgery",
            "pharmacology": "Pharmacology",
            "materials": "Faculties",
            "personal_data": "Personal Data",
            "my_courses": "My Courses",
            "purchases": "Purchases",
            "favorites": "Favorites",
            "settings": "Settings",
            "logout": "Logout",
            "full_name": "Full Name",
            "phone_number": "Phone Number",
            "change_picture": "Change Picture",
            "already_have_account": "Already have an account?",
            "register_subtitle": "Join our medical learning platform"
        }
    },
    ar: {
        translation: {
            "welcome": "مرحباً",
            "login_to_access": "سجل دخول للوصول إلى حسابك",
            "email": "البريد الإلكتروني",
            "password": "كلمة المرور",
            "forgot_password": "هل نسيت كلمة المرور؟",
            "remember_me": "تذكرني",
            "login": "تسجيل الدخول",
            "or": "أو",
            "no_account": "ليس لديك حساب؟",
            "create_account": "إنشاء حساب",
            "home": "الرئيسية",
            "courses": "الكورسات",
            "contact_us": "تواصل معنا",
            "notifications": "الإشعارات",
            "search_cases": "ابحث عن الحالات...",
            "clinical_cases_hub": "مركز الحالات السريرية",
            "choose_discipline": "اختر تخصصك لاستكشاف سيناريوهات العالم الحقيقي.",
            "internal_medicine": "الباطنة العامة",
            "surgery": "الجراحة",
            "pharmacology": "الفارماكولوجي",
            "materials": "الكليات",
            "personal_data": "البيانات الشخصية",
            "my_courses": "كورساتي",
            "purchases": "المشتريات",
            "favorites": "المفضلة",
            "settings": "الإعدادات",
            "logout": "تسجيل الخروج",
            "full_name": "الإسم الكامل",
            "phone_number": "رقم الهاتف",
            "change_picture": "تغيير الصورة",
            "already_have_account": "لديك حساب بالفعل؟",
            "register_subtitle": "انضم إلى منصتنا الطبية للتعلم"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "ar", // Default to Arabic
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
