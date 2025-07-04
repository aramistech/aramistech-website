import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'service';
  schema?: object;
}

export function SEO({
  title,
  description,
  keywords,
  image = 'https://aramistech.com/api/media/4/file',
  url,
  type = 'website',
  schema
}: SEOProps) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | AramisTech - Professional IT Solutions`;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Update description
    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description, true);
      updateMetaTag('twitter:description', description, true);
    }

    // Update keywords
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Update Open Graph tags
    if (title) {
      updateMetaTag('og:title', title, true);
      updateMetaTag('twitter:title', title, true);
    }

    if (url) {
      updateMetaTag('og:url', url, true);
      updateMetaTag('twitter:url', url, true);
      
      // Update canonical link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    updateMetaTag('og:image', image, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('og:type', type, true);

    // Add structured data schema
    if (schema) {
      // Remove existing schema for this page
      const existingSchema = document.querySelector('script[data-page-schema]');
      if (existingSchema) {
        existingSchema.remove();
      }

      // Add new schema
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.setAttribute('data-page-schema', 'true');
      schemaScript.textContent = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    }
  }, [title, description, keywords, image, url, type, schema]);

  return null; // This component doesn't render anything
}

// Pre-defined SEO configurations for common pages
export const SEOConfigs = {
  home: {
    title: 'Professional IT Solutions | 27+ Years Experience | South Florida',
    description: 'Family-owned IT company serving South Florida for 27+ years. Expert computer repairs, network maintenance, cloud solutions & custom servers. Free consultation available.',
    keywords: 'IT support South Florida, computer repair Miami, network maintenance, cloud solutions, cybersecurity, Windows 10 upgrade, IT consulting, managed IT services, family business IT',
    url: 'https://aramistech.com'
  },
  
  windows10: {
    title: 'Windows 10 Upgrade Services | Microsoft Support Ending Oct 2025',
    description: 'Microsoft ends Windows 10 support October 14, 2025. Upgrade to Windows 11 or get extended security updates. Expert migration services by AramisTech.',
    keywords: 'Windows 10 upgrade, Windows 11 migration, Microsoft support ending, security updates, IT upgrade services South Florida',
    url: 'https://aramistech.com/windows10-upgrade'
  },
  
  aiDevelopment: {
    title: 'AI Development Services | Custom AI Solutions | Machine Learning',
    description: 'Professional AI development and machine learning solutions for businesses. Custom AI tools, automation, data analysis, and intelligent systems by AramisTech.',
    keywords: 'AI development, machine learning, artificial intelligence, custom AI solutions, business automation, data analysis, AI consulting South Florida',
    url: 'https://aramistech.com/ai-development'
  },
  
  ipLookup: {
    title: 'IP Address Lookup Tool | Network Diagnostics | Free Online Tool',
    description: 'Free IP address lookup tool. Check your public IP, location, ISP information, and network diagnostics. Professional network tools by AramisTech.',
    keywords: 'IP lookup, IP address tool, network diagnostics, what is my IP, network troubleshooting, IT tools',
    url: 'https://aramistech.com/ip-lookup'
  },
  
  knowledgeBase: {
    title: 'IT Knowledge Base | Troubleshooting Guides | Tech Support Articles',
    description: 'Comprehensive IT knowledge base with troubleshooting guides, cybersecurity tips, and technical solutions. 27+ years of IT expertise at your fingertips.',
    keywords: 'IT knowledge base, troubleshooting guides, tech support, cybersecurity tips, computer help, network solutions, IT articles',
    url: 'https://aramistech.com/knowledge-base'
  },

  googleAds: {
    title: 'Google Ads Campaign Builder | Digital Marketing for IT Services',
    description: 'Complete Google Ads campaign setup for IT services. Professional keywords, targeting, and ad copy optimized for South Florida IT leads and conversions.',
    keywords: 'Google Ads IT services, PPC campaign setup, digital marketing IT, lead generation, South Florida advertising, IT marketing strategy',
    url: 'https://aramistech.com/google-ads-campaign'
  },
  
  servicesOrder: {
    title: 'IT Service Packages | Managed IT Services | Business Solutions',
    description: 'Professional managed IT service packages for businesses. Basic, Professional, and Enterprise plans with 24/7 support, maintenance, and security.',
    keywords: 'managed IT services, IT service packages, business IT support, monthly IT maintenance, enterprise IT solutions',
    url: 'https://aramistech.com/services-order'
  },
  
  serviceCalculator: {
    title: 'IT Service Calculator | Get Instant Quote | Pricing Tool',
    description: 'Calculate your IT service costs instantly. Network setup, cybersecurity, cloud migration, and more. Get accurate pricing from South Florida IT experts.',
    keywords: 'IT service calculator, IT pricing, service quotes, network setup cost, cybersecurity pricing, IT consultation',
    url: 'https://aramistech.com/service-calculator'
  }
};

// Service-specific schemas
export const ServiceSchemas = {
  itSupport: {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "IT Support Services",
    "description": "Comprehensive IT support and managed services for businesses",
    "provider": {
      "@type": "LocalBusiness",
      "name": "AramisTech",
      "telephone": "(305) 814-4461",
      "email": "sales@aramistech.com"
    },
    "serviceType": "IT Support",
    "areaServed": "South Florida"
  },

  computerRepair: {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Computer Repair Services",
    "description": "Professional computer repair and troubleshooting services",
    "provider": {
      "@type": "LocalBusiness",
      "name": "AramisTech",
      "telephone": "(305) 814-4461",
      "email": "sales@aramistech.com"
    },
    "serviceType": "Computer Repair",
    "areaServed": "South Florida"
  },

  windows10Upgrade: {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Windows 10 Upgrade Services",
    "description": "Windows 10 to Windows 11 migration and upgrade services",
    "provider": {
      "@type": "LocalBusiness",
      "name": "AramisTech",
      "telephone": "(305) 814-4461",
      "email": "sales@aramistech.com"
    },
    "serviceType": "Operating System Upgrade",
    "areaServed": "South Florida"
  }
};