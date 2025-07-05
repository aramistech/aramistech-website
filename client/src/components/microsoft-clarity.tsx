import { useEffect } from 'react';

export function MicrosoftClarity() {
  useEffect(() => {
    // Initialize Microsoft Clarity
    const initClarity = () => {
      // Check if Clarity is already loaded
      if (typeof window !== 'undefined' && 'clarity' in window && window.clarity) {
        console.log('Microsoft Clarity already initialized');
        return;
      }

      // Add Clarity tracking script with your project ID
      const script = document.createElement('script');
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "sa9kl3ndl9");
      `;
      document.head.appendChild(script);

      console.log('Microsoft Clarity tracking initialized');
    };

    initClarity();
  }, []);

  return null; // This component doesn't render anything
}

// Function to track custom events in Clarity
export const trackClarityEvent = (eventName: string, customData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName, customData);
    console.log('Clarity event tracked:', eventName, customData);
  }
};

// Function to identify users in Clarity
export const identifyClarityUser = (userId: string, sessionId?: string) => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('identify', userId, sessionId);
    console.log('Clarity user identified:', userId);
  }
};

// Extend the window object to include clarity
declare global {
  interface Window {
    clarity: (...args: any[]) => void;
  }
}