import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { smoothScrollToTop } from '../../utils/smoothScroll';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleScrollToTop = () => {
    smoothScrollToTop();
  };

  return (
    <button
      onClick={handleScrollToTop}
      className={`fixed bottom-8 right-8 z-40 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-110 hover:from-blue-700 hover:to-blue-800 border border-white/20 backdrop-blur-sm ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  );
};

export default ScrollToTop;
