import { Facebook, Linkedin, Twitter, Phone, Mail, MapPin, Clock, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';

import AramisTechFooterLogo from "@assets/AramisTechFooterLogo.png";

interface FooterLink {
  id: number;
  section: string;
  label: string;
  url: string;
  isActive: boolean;
  orderIndex: number;
  target: string;
}

export default function Footer() {
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);

  const { data: footerLinksData } = useQuery({
    queryKey: ['/api/footer-links'],
  });

  const footerLinks = (footerLinksData as any)?.links || [];

  // Group links by section and normalize case
  const groupedLinks = footerLinks.reduce((acc: Record<string, FooterLink[]>, link: FooterLink) => {
    // Normalize section names to handle case variations
    const normalizedSection = link.section.toLowerCase();
    const displaySection = normalizedSection.charAt(0).toUpperCase() + normalizedSection.slice(1);
    
    if (!acc[displaySection]) {
      acc[displaySection] = [];
    }
    acc[displaySection].push(link);
    return acc;
  }, {});

  useEffect(() => {
    const dismissed = localStorage.getItem('criticalWarningDismissed');
    if (dismissed === 'true') {
      setIsWarningDismissed(true);
    }
  }, []);

  const enableWarning = () => {
    localStorage.removeItem('criticalWarningDismissed');
    setIsWarningDismissed(false);
    window.location.reload();
  };

  return (
    <footer className="bg-professional-gray text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img 
              src="/api/media/4/file" 
              alt="AramisTech Logo" 
              className="h-16 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-gray-300 mb-4 text-sm">
              Family-owned IT company with 27+ years of experience serving South Florida businesses.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-primary-blue p-2 rounded-lg hover:bg-secondary-blue transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="bg-primary-blue p-2 rounded-lg hover:bg-secondary-blue transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="bg-primary-blue p-2 rounded-lg hover:bg-secondary-blue transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              {(groupedLinks['Services'] || [])
                .sort((a: FooterLink, b: FooterLink) => a.orderIndex - b.orderIndex)
                .map((link: FooterLink) => (
                  <li key={link.id}>
                    <a 
                      href={link.url} 
                      target={link.target}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              {(groupedLinks['Support'] || [])
                .sort((a: FooterLink, b: FooterLink) => a.orderIndex - b.orderIndex)
                .map((link: FooterLink) => (
                  <li key={link.id}>
                    <a 
                      href={link.url} 
                      target={link.target}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center">
                <Phone className="w-3 h-3 mr-2" />
                <a href="tel:(305) 814-4461" className="hover:text-white transition-colors">(305) 814-4461</a>
              </li>
              <li className="flex items-center">
                <Mail className="w-3 h-3 mr-2" />
                <a href="mailto:sales@aramistech.com" className="hover:text-white transition-colors">sales@aramistech.com</a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-3 h-3 mr-2 mt-0.5" />
                <span>Miami & Broward Counties, FL</span>
              </li>
              <li className="flex items-start">
                <Clock className="w-3 h-3 mr-2 mt-0.5" />
                <span>Mon-Fri: 9am-6pm</span>
              </li>
            </ul>

            {/* Google Review Section */}
            <div className="mt-6 pt-6 border-t border-gray-600">
              <h5 className="text-md font-semibold mb-3 text-aramis-orange">Leave us a Google Review</h5>
              <p className="text-gray-300 text-xs mb-3">It Really Helps Us Out, Thank You!</p>
              
              <div className="flex items-center space-x-3">
                {/* QR Code */}
                <div className="bg-white p-2 rounded-lg">
                  <img 
                    src="/attached_assets/googlereviewqrcodearamistech-2_1751463228978.png" 
                    alt="Google Review QR Code" 
                    className="w-16 h-16"
                  />
                </div>
                
                {/* Review Link */}
                <div className="flex-1">
                  <a 
                    href="https://g.page/r/CYN7HOtqQGRlEAI/review"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary-blue hover:bg-secondary-blue text-white text-xs px-3 py-2 rounded-lg transition-colors duration-200 text-center w-full"
                  >
                    Click to Review
                  </a>
                  <p className="text-gray-400 text-xs mt-1 text-center">or scan QR code</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-600 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center md:space-x-4">
              <p className="text-gray-400 text-sm">
                &copy; 2024 AramisTech Corp. All rights reserved. | Privacy Policy | Terms of Service
              </p>
              {isWarningDismissed && (
                <button
                  onClick={enableWarning}
                  className="text-red-600 hover:text-red-700 text-xs flex items-center space-x-1 mt-2 md:mt-0 transition-colors"
                  title="Re-enable security alerts"
                >
                  <Shield className="w-3 h-3" />
                  <span>Security alerts</span>
                </button>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">
              Proudly serving South Florida for 27+ years
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
