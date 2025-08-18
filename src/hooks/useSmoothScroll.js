import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { smoothScrollToTop } from '../utils/smoothScroll';

export const useSmoothScrollOnRouteChange = () => {
  const location = useLocation();

  useEffect(() => {
    // Add a small delay to ensure the page has rendered
    const timer = setTimeout(() => {
      smoothScrollToTop(600);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);
};

export const useSmoothScrollToSection = () => {
  const scrollToSection = (sectionId, offset = 100) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const targetY = element.offsetTop - offset;
      const startY = window.pageYOffset;
      const difference = targetY - startY;
      const startTime = performance.now();
      const duration = 1000;

      const step = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const easeInOutCubic = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        window.scrollTo(0, startY + difference * easeInOutCubic);
        
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      
      requestAnimationFrame(step);
    }
  };

  return { scrollToSection };
};
