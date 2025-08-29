

(function() {
  
  const THEME_KEY = 'theme';
  const root = document.documentElement;
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  
  const getSystemTheme = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  
  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    
    localStorage.setItem(THEME_KEY, theme);
    
    
    updateThemeIcon(theme);
    
    updateMetaThemeColor(theme);
  };
  
  
  const updateThemeIcon = (theme) => {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    
    const icon = btn.querySelector('i');
    if (!icon) return;
    
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  };
  
  const updateMetaThemeColor = (theme) => {
    if (!metaThemeColor) return;
    
    
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#0b1220' : '#0a4d8c');
  };
  
 
  const toggleTheme = (event) => {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    if ('startViewTransition' in document) {
      animateThemeTransition(newTheme, event);
    } else {
   
      applyTheme(newTheme);
    }
  };
  
  const animateThemeTransition = (newTheme, clickEvent) => {
    const x = clickEvent?.clientX ?? innerWidth / 2;
    const y = clickEvent?.clientY ?? innerHeight / 2;
    
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );
    
    document.startViewTransition(() => applyTheme(newTheme));
    
    try {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 550,
          easing: 'cubic-bezier(.22,.61,.36,1)',
          pseudoElement: '::view-transition-new(theme)'
        }
      );
    } catch (e) {
    }
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      applyTheme(getSystemTheme());
    }
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (!savedTheme && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        applyTheme(e.matches ? 'dark' : 'light');
      });
    }
  });
})();