// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: true
    });
  `;
  document.head.appendChild(script2);
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url,
    page_title: document.title,
    page_location: window.location.href
  });
};

// Track custom events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track engagement events
export const trackEngagement = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, {
    engagement_time_msec: parameters.engagement_time || 0,
    ...parameters
  });
};

// Track scroll depth
export const trackScrollDepth = (percentage: number) => {
  trackEvent('scroll', 'engagement', `${percentage}%`, percentage);
};

// Track time on page
export const trackTimeOnPage = (seconds: number) => {
  trackEvent('time_on_page', 'engagement', 'seconds', seconds);
};

// Track clicks on specific elements
export const trackClick = (elementType: string, elementId?: string, elementText?: string) => {
  trackEvent('click', 'interaction', `${elementType}${elementId ? `_${elementId}` : ''}`, 1);
  
  // Send additional click data
  window.gtag('event', 'element_click', {
    element_type: elementType,
    element_id: elementId || 'unknown',
    element_text: elementText || 'unknown',
    click_timestamp: new Date().toISOString()
  });
};

// Track form interactions
export const trackFormInteraction = (formName: string, action: 'start' | 'submit' | 'abandon') => {
  trackEvent(`form_${action}`, 'form', formName);
};

// Track user session data
export const trackSessionData = () => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const sessionData = {
    referrer: document.referrer || 'direct',
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    session_start: new Date().toISOString()
  };
  
  window.gtag('event', 'session_start', sessionData);
  
  // Store session start time for duration tracking
  sessionStorage.setItem('session_start', Date.now().toString());
};

// Track session end and duration
export const trackSessionEnd = () => {
  const sessionStart = sessionStorage.getItem('session_start');
  if (sessionStart) {
    const duration = Math.round((Date.now() - parseInt(sessionStart)) / 1000);
    trackTimeOnPage(duration);
    
    window.gtag('event', 'session_end', {
      session_duration: duration,
      session_end: new Date().toISOString()
    });
  }
};

// Track search queries if applicable
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  window.gtag('event', 'search', {
    search_term: searchTerm,
    results_count: resultsCount || 0
  });
};

// Track business-specific events
export const trackBusinessEvent = (eventType: 'quote_request' | 'contact_form' | 'service_inquiry' | 'phone_click', details: Record<string, any> = {}) => {
  window.gtag('event', eventType, {
    event_category: 'business_conversion',
    ...details
  });
};