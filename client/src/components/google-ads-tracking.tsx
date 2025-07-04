import { useEffect } from 'react';

export function GoogleAdsTracking() {
  useEffect(() => {
    // Initialize Google Ads tracking
    const initGoogleAds = () => {
      // Only initialize if not already loaded
      if (typeof window !== 'undefined' && 'gtag' in window && window.gtag) {
        console.log('Google Ads tracking already initialized');
        return;
      }

      // Add Google Ads script to the head
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-11006693669';
      document.head.appendChild(script);

      // Initialize gtag function and configure Google Ads
      const configScript = document.createElement('script');
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-11006693669');
      `;
      document.head.appendChild(configScript);

      console.log('Google Ads tracking initialized');
    };

    initGoogleAds();
  }, []);

  return null; // This component doesn't render anything
}

// Function to track conversions
export const trackConversion = (conversionLabel?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const conversionData: any = {
      'send_to': 'AW-11006693669' + (conversionLabel ? `/${conversionLabel}` : ''),
    };

    if (value) {
      conversionData.value = value;
      conversionData.currency = 'USD';
    }

    window.gtag('event', 'conversion', conversionData);
    console.log('Conversion tracked:', conversionData);
  }
};

// Function to track phone call clicks
export const trackPhoneClick = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': 'AW-11006693669/phone_call',
      'value': 40.0,
      'currency': 'USD'
    });
    console.log('Phone call conversion tracked');
  }
};

// Extend the window object to include gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}