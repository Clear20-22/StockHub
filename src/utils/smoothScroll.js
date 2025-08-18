// Smooth scrolling utility functions
export const smoothScrollTo = (targetY, duration = 1000) => {
  const startY = window.pageYOffset;
  const difference = targetY - startY;
  const startTime = performance.now();

  const step = (timestamp) => {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation (ease-in-out)
    const easeInOutCubic = progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    window.scrollTo(0, startY + difference * easeInOutCubic);
    
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };
  
  requestAnimationFrame(step);
};

export const smoothScrollToElement = (elementId, offset = 80, duration = 1000) => {
  const element = document.getElementById(elementId);
  if (element) {
    const targetY = element.offsetTop - offset;
    smoothScrollTo(targetY, duration);
  }
};

export const smoothScrollToTop = (duration = 800) => {
  smoothScrollTo(0, duration);
};
