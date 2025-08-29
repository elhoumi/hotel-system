// Translations for the application
const translations = {
    fr: {
        // Header
        "hotelName": "Hôtel Argana",
        "notifications": "Notifications",
        "profile": "Profil",
        
        // Department buttons
        "makeRequest": "Faire une demande",
        "access": "Accéder",
        
        // Departments
        "centralKitchen": "Cuisine Centrale",
        "pantry": "Garde-Manger",
        "breakfast": "Petit Déjeuner (PDJ)",
        "snackBar": "Snack Bar",
        "barWindsor": "Bar Windsor",
        "spagos": "Spagos",
        "milleEtUneNuits": "Mille et une Nuits",
        "pastry": "Pâtisserie / Croissanterie",
        "housekeeping": "Étages / Ménage",
        "cafeteria": "Cafétéria",
        "cellar": "Cave",
        "reception": "Réception",
        "accounting": "Comptabilité",
        "administration": "Administration",
        "management": "Direction",
        
        // Footer
        "allRequests": "Toutes les demandes",
        "history": "Historique",
        "logout": "Se déconnecter",
        
        // Notifications
        "notificationsTitle": "Notifications",
        "markAllAsRead": "Marquer tout comme lu",
        "viewAll": "Voir tout",
        "noNotifications": "Aucune notification",
        "centralKitchenRequest": "Nouvelle demande de Cuisine Centrale",
        "ingredientsRequest": "Demande d'ingrédients en attente d'approbation",
        "requestApproved": "Demande approuvée",
        "housekeepingRequest": "Votre demande pour Étages/Ménage a été approuvée",
        "inventoryUpdate": "Mise à jour d'inventaire",
        "cellarInventory": "L'inventaire de la Cave a été mis à jour",
        
        // PWA Install
        "installApp": "Installez l'application",
        "installAppDesc": "Pour un accès rapide même hors ligne",
        "install": "Installer",
        "later": "Plus tard",
        
        // Modal
        "department": "Département",
        "requestForm": "Formulaire de demande",
        "requestType": "Type de demande",
        "urgency": "Urgence",
        "normal": "Normale",
        "urgent": "Urgente",
        "description": "Description",
        "recentRequests": "Demandes récentes",
        "pending": "En attente",
        "approved": "Approuvée",
        "rejected": "Rejetée",
        
        // Misc
        "offline": "Hors ligne",
        "online": "En ligne",
        "close": "Fermer",
        "submit": "Soumettre",
        "cancel": "Annuler",
        "loading": "Chargement...",
        "error": "Erreur",
        "success": "Succès"
    },
    ar: {
        // Header
        "hotelName": "فندق أركانة",
        "notifications": "الإشعارات",
        "profile": "الملف الشخصي",
        
        // Department buttons
        "makeRequest": "تقديم طلب",
        "access": "الدخول",
        
        // Departments
        "centralKitchen": "المطبخ المركزي",
        "pantry": "المخزن",
        "breakfast": "الفطور",
        "snackBar": "سناك بار",
        "barWindsor": "بار ويندسور",
        "spagos": "سباغوس",
        "milleEtUneNuits": "ألف ليلة وليلة",
        "pastry": "المعجنات / الكرواسان",
        "housekeeping": "الطوابق / التنظيف",
        "cafeteria": "الكافيتيريا",
        "cellar": "القبو",
        "reception": "الاستقبال",
        "accounting": "المحاسبة",
        "administration": "الإدارة",
        "management": "المديرية",
        
        // Footer
        "allRequests": "جميع الطلبات",
        "history": "السجل",
        "logout": "تسجيل الخروج",
        
        // Notifications
        "notificationsTitle": "الإشعارات",
        "markAllAsRead": "تعليم الكل كمقروء",
        "viewAll": "عرض الكل",
        "noNotifications": "لا توجد إشعارات",
        "centralKitchenRequest": "طلب جديد من المطبخ المركزي",
        "ingredientsRequest": "طلب مكونات في انتظار الموافقة",
        "requestApproved": "تمت الموافقة على الطلب",
        "housekeepingRequest": "تمت الموافقة على طلبك للطوابق/التنظيف",
        "inventoryUpdate": "تحديث المخزون",
        "cellarInventory": "تم تحديث مخزون القبو",
        
        // PWA Install
        "installApp": "تثبيت التطبيق",
        "installAppDesc": "للوصول السريع حتى بدون إنترنت",
        "install": "تثبيت",
        "later": "لاحقًا",
        
        // Modal
        "department": "القسم",
        "requestForm": "نموذج الطلب",
        "requestType": "نوع الطلب",
        "urgency": "الأولوية",
        "normal": "عادية",
        "urgent": "عاجلة",
        "description": "الوصف",
        "recentRequests": "الطلبات الأخيرة",
        "pending": "قيد الانتظار",
        "approved": "تمت الموافقة",
        "rejected": "مرفوض",
        
        // Misc
        "offline": "غير متصل",
        "online": "متصل",
        "close": "إغلاق",
        "submit": "إرسال",
        "cancel": "إلغاء",
        "loading": "جاري التحميل...",
        "error": "خطأ",
        "success": "تم بنجاح"
    }
};

// Default language
let currentLanguage = 'fr';

// Function to get a translated string
function t(key) {
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }
    // Fallback to French if translation not found
    if (translations.fr[key]) {
        return translations.fr[key];
    }
    // Return the key if no translation found
    return key;
}

// Function to change the language
function changeLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        updatePageTranslations();
        // Update direction for Arabic
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
            document.body.classList.add('rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', 'fr');
            document.body.classList.remove('rtl');
        }
        
        // Update active language button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// Function to update all translations on the page
function updatePageTranslations() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // Update all buttons with data-i18n-btn attribute
    document.querySelectorAll('[data-i18n-btn]').forEach(button => {
        const key = button.getAttribute('data-i18n-btn');
        button.textContent = t(key);
    });
    
    // Update all placeholders with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(input => {
        const key = input.getAttribute('data-i18n-placeholder');
        input.placeholder = t(key);
    });
    
    // Update all titles with data-i18n-title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key);
    });
}

// Initialize language from localStorage or browser preference
function initializeLanguage() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
        changeLanguage(savedLanguage);
    } else {
        // Check browser language preference
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'ar' && translations.ar) {
            changeLanguage('ar');
        }
        // Default is already 'fr'
    }
}

// Export the functions and variables
window.t = t;
window.changeLanguage = changeLanguage;
window.initializeLanguage = initializeLanguage;
window.currentLanguage = currentLanguage;