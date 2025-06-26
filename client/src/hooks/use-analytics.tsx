import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackPageView, trackSessionData, trackSessionEnd, trackScrollDepth } from '../lib/analytics';

export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  const scrollTrackedRef = useRef<Set<number>>(new Set());
  
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      trackPageView(location);
      prevLocationRef.current = location;
      // Reset scroll tracking for new page
      scrollTrackedRef.current.clear();
    }
  }, [location]);

  useEffect(() => {
    // Track session start on mount
    trackSessionData();

    // Track scroll depth
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      const roundedScroll = Math.round(scrolled / 25) * 25; // Track in 25% increments
      
      if (roundedScroll >= 25 && !scrollTrackedRef.current.has(roundedScroll)) {
        scrollTrackedRef.current.add(roundedScroll);
        trackScrollDepth(roundedScroll);
      }
    };

    // Track session end on page unload
    const handleBeforeUnload = () => {
      trackSessionEnd();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};