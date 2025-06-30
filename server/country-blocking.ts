import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

interface IPGeolocationResponse {
  country: string;
  countryCode: string;
  status?: string;
  message?: string;
}

// Free IP geolocation services
const IP_GEOLOCATION_SERVICES = [
  {
    name: 'ip-api.com',
    url: (ip: string) => `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode`,
    parseResponse: (data: any): IPGeolocationResponse => ({
      country: data.country || 'Unknown',
      countryCode: data.countryCode || 'XX',
      status: data.status,
      message: data.message
    })
  },
  {
    name: 'ipinfo.io',
    url: (ip: string) => `https://ipinfo.io/${ip}/json`,
    parseResponse: (data: any): IPGeolocationResponse => ({
      country: data.country || 'Unknown',
      countryCode: data.country || 'XX'
    })
  },
  {
    name: 'ipwhois.app',
    url: (ip: string) => `http://free.ipwhois.io/json/${ip}`,
    parseResponse: (data: any): IPGeolocationResponse => ({
      country: data.country || 'Unknown',
      countryCode: data.country_code || 'XX'
    })
  }
];

// Cache for IP geolocation results (simple in-memory cache)
const ipCache = new Map<string, { result: IPGeolocationResponse; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getIPGeolocation(ip: string): Promise<IPGeolocationResponse> {
  // Check cache first
  const cached = ipCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  // Try each service until one works
  for (const service of IP_GEOLOCATION_SERVICES) {
    try {
      const response = await fetch(service.url(ip), {
        timeout: 5000, // 5 second timeout
        headers: {
          'User-Agent': 'AramisTech-CountryBlocking/1.0'
        }
      });

      if (!response.ok) {
        continue; // Try next service
      }

      const data = await response.json();
      const result = service.parseResponse(data);

      // Check if the service returned an error
      if (result.status === 'fail') {
        continue; // Try next service
      }

      // Cache the result
      ipCache.set(ip, { result, timestamp: Date.now() });
      
      return result;
    } catch (error) {
      console.warn(`IP geolocation service ${service.name} failed for IP ${ip}:`, error);
      continue; // Try next service
    }
  }

  // If all services fail, return unknown
  return {
    country: 'Unknown',
    countryCode: 'XX'
  };
}

function getClientIP(req: Request): string {
  // Check various headers for the real IP address
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare
  
  if (typeof forwarded === 'string') {
    // X-Forwarded-For can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (typeof realIP === 'string') {
    return realIP;
  }
  
  if (typeof cfConnectingIP === 'string') {
    return cfConnectingIP;
  }
  
  // Fallback to remote address
  return req.socket.remoteAddress || req.ip || '127.0.0.1';
}

function isLocalIP(ip: string): boolean {
  // Check for localhost, private networks, etc.
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.') ||
    ip === '::ffff:127.0.0.1'
  );
}

function renderBlockedPage(settings: any): string {
  const {
    messageTitle = "Service Not Available",
    blockMessage = "This service is not available in your region.",
    fontSize = "text-lg",
    fontColor = "#374151",
    backgroundColor = "#f9fafb",
    borderColor = "#e5e7eb",
    showContactInfo = true,
    contactMessage = "If you believe this is an error, please contact us."
  } = settings;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${messageTitle} - AramisTech</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
      </style>
    </head>
    <body class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full mx-4">
        <div 
          class="p-8 rounded-lg border-2 text-center ${fontSize}"
          style="
            color: ${fontColor};
            background-color: ${backgroundColor};
            border-color: ${borderColor};
          "
        >
          <div class="mb-6">
            <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.315 14.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h1 class="text-xl font-bold mb-4">${messageTitle}</h1>
            <p class="mb-4">${blockMessage}</p>
            ${showContactInfo ? `<p class="text-sm opacity-80">${contactMessage}</p>` : ''}
          </div>
          
          <div class="border-t pt-6 text-sm opacity-70">
            <p>AramisTech - Professional IT Solutions</p>
            <p class="mt-2">
              <a href="mailto:info@aramistech.com" class="text-blue-600 hover:text-blue-800">
                info@aramistech.com
              </a>
              <span class="mx-2">•</span>
              <a href="tel:3058144461" class="text-blue-600 hover:text-blue-800">
                (305) 814-4461
              </a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function countryBlockingMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get country blocking settings
    const settings = await storage.getCountryBlockingSettings();
    
    // If country blocking is disabled, continue
    if (!settings || !settings.isEnabled) {
      return next();
    }

    // Get client IP
    const clientIP = getClientIP(req);
    
    // Skip blocking for local/development IPs
    if (isLocalIP(clientIP)) {
      return next();
    }

    // Get IP geolocation
    const geoData = await getIPGeolocation(clientIP);
    
    // Get blocked countries
    const blockedCountries = await storage.getBlockedCountries();
    
    // Check if country is blocked
    const isBlocked = blockedCountries.some(
      country => country.countryCode.toLowerCase() === geoData.countryCode.toLowerCase()
    );
    
    if (isBlocked) {
      // Log the blocked access attempt
      console.log(`Blocked access from ${geoData.country} (${geoData.countryCode}) - IP: ${clientIP}`);
      
      // Return the blocked page
      const blockedPageHTML = renderBlockedPage(settings);
      return res.status(403).send(blockedPageHTML);
    }
    
    // Country is not blocked, continue
    next();
    
  } catch (error) {
    console.error('Country blocking middleware error:', error);
    // On error, allow access (fail open)
    next();
  }
}

export { getIPGeolocation, getClientIP };