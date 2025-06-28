import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, AlertTriangle, Shield, Bell, Zap, AlertCircle, Info } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { trackClick } from "@/lib/analytics";

interface MenuItem {
  id: number;
  label: string;
  href?: string;
  parentId?: number;
  orderIndex: number;
  isVisible: boolean;
}

export default function DynamicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState<number | null>(null);
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useLocation();

  // Check if warning was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('criticalWarningDismissed');
    if (dismissed === 'true') {
      setIsWarningDismissed(true);
    }
  }, []);

  // Handle scroll for header shrinking
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dismissWarning = () => {
    localStorage.setItem('criticalWarningDismissed', 'true');
    setIsWarningDismissed(true);
    setShowMobilePopup(false);
  };

  // Fetch menu items from database
  const { data: menuData } = useQuery({
    queryKey: ['/api/menu-items'],
    queryFn: async () => {
      const res = await fetch('/api/menu-items');
      return res.json();
    },
  });

  // Fetch security alert settings from database
  const { data: alertData } = useQuery({
    queryKey: ['/api/security-alert', 'v2'],
    queryFn: async () => {
      const res = await fetch('/api/security-alert?' + new Date().getTime());
      return res.json();
    },
    staleTime: 0,
    gcTime: 0,
  });

  const menuItems: MenuItem[] = menuData?.menuItems || [];
  const mainMenuItems = menuItems.filter(item => !item.parentId && item.isVisible)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const getSubMenuItems = (parentId: number) => 
    menuItems.filter(item => item.parentId === parentId && item.isVisible)
      .sort((a, b) => a.orderIndex - b.orderIndex);

  // Get security alert settings
  const securityAlert = alertData?.alert;
  const isAlertEnabled = securityAlert?.isEnabled !== false && !isWarningDismissed;

  // Function to get icon component based on iconType
  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'Shield': return <Shield className="w-3 h-3 mr-1" />;
      case 'Bell': return <Bell className="w-3 h-3 mr-1" />;
      case 'Zap': return <Zap className="w-3 h-3 mr-1" />;
      case 'AlertCircle': return <AlertCircle className="w-3 h-3 mr-1" />;
      case 'Info': return <Info className="w-3 h-3 mr-1" />;
      default: return <AlertTriangle className="w-3 h-3 mr-1" />;
    }
  };

  const getMobileIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'Shield': return Shield;
      case 'Bell': return Bell;
      case 'Zap': return Zap;
      case 'AlertCircle': return AlertCircle;
      case 'Info': return Info;
      default: return AlertTriangle;
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    trackClick('navigation_link', sectionId, sectionId);
    
    // If we're not on the home page, navigate there first
    if (location !== '/') {
      setLocation('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // We're already on the home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.href) {
      if (item.href.startsWith('#')) {
        scrollToSection(item.href.substring(1));
      } else if (item.href.startsWith('http://') || item.href.startsWith('https://')) {
        // Handle external URLs by opening in new tab
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else if (item.href.startsWith('/api/download/')) {
        // Handle download links directly
        window.location.href = item.href;
      } else {
        setLocation(item.href);
        setTimeout(() => window.scrollTo(0, 0), 100);
      }
    }
    // If no href (like Support dropdown), just close menus without navigation
    setActiveDropdown(null);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary-blue text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2"></i>Serving Miami & Broward
              </span>
              <span className="hidden sm:flex items-center">
                <i className="fas fa-clock mr-2"></i>Mon-Fri: 9am-6pm
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="tel:(305) 814-4461" className="flex items-center hover:text-blue-200 transition-colors">
                <i className="fas fa-phone mr-2"></i>(305) 814-4461
              </a>
              <a href="mailto:sales@aramistech.com" className="hidden sm:flex items-center hover:text-blue-200 transition-colors">
                <i className="fas fa-envelope mr-2"></i>sales@aramistech.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alert Banner - Desktop */}
      {isAlertEnabled && (
        <div 
          className="hidden sm:block critical-warning text-white py-1 relative overflow-hidden"
          style={{ backgroundColor: securityAlert?.backgroundColor || '#dc2626' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center text-center">
              <div className="flex items-center space-x-3">
                <span 
                  className="critical-badge px-2 py-1 rounded-full text-xs font-bold flex items-center"
                  style={{ 
                    backgroundColor: securityAlert?.backgroundColor || '#dc2626',
                    color: securityAlert?.textColor || 'white'
                  }}
                >
                  {getIconComponent(securityAlert?.iconType || 'AlertTriangle')}
                  CRITICAL
                </span>
                <span 
                  className="font-semibold text-sm sm:text-base professional-text"
                  style={{ color: securityAlert?.textColor || 'white' }}
                >
                  {securityAlert?.title || 'Windows 10 Support Ending - Your Systems Will Become Vulnerable to New Threats'}
                </span>
                <Link 
                  href={securityAlert?.buttonLink || '/windows10-upgrade'}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 border-white hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                  style={{ 
                    backgroundColor: securityAlert?.buttonBackgroundColor || '#ffffff',
                    color: securityAlert?.buttonTextColor || '#000000'
                  }}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <span className="mr-1">►</span>
                  {securityAlert?.buttonText || 'Learn More'}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Animated urgency indicators */}
          <div className="absolute left-0 top-0 w-2 h-full bg-yellow-400 animate-ping"></div>
          <div className="absolute right-0 top-0 w-2 h-full bg-yellow-400 animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>
      )}

      {/* Security Alert Button - Mobile */}
      {isAlertEnabled && (
        <div className="sm:hidden fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
          <div className="relative">
            <button
              onClick={() => setShowMobilePopup(true)}
              className="critical-warning text-white p-3 relative overflow-hidden hover:opacity-90 transition-all duration-300 rounded-l-lg shadow-lg"
              style={{ backgroundColor: securityAlert?.backgroundColor || '#dc2626' }}
            >
              <div className="flex flex-col items-center space-y-1">
                {(() => {
                  const IconComponent = getMobileIconComponent(securityAlert?.iconType || 'AlertTriangle');
                  return <IconComponent className="w-6 h-6 animate-pulse" style={{ color: securityAlert?.textColor || 'white' }} />;
                })()}
                <span 
                  className="font-bold text-xs"
                  style={{ color: securityAlert?.textColor || 'white' }}
                >
                  CRITICAL
                </span>
              </div>
              
              {/* Animated urgency indicators */}
              <div className="absolute top-0 left-0 h-1 w-full bg-yellow-400 animate-ping"></div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-yellow-400 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </button>
            
            {/* Dismiss button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissWarning();
              }}
              className="absolute -top-1 -left-1 bg-black bg-opacity-70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-opacity-90 transition-all"
              title="Hide warning"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Slide-in Panel */}
      {showMobilePopup && (
        <>
          <div className="sm:hidden fixed inset-0 z-[60] bg-black bg-opacity-50" onClick={() => setShowMobilePopup(false)}></div>
          <div className={`sm:hidden fixed right-0 top-0 h-full w-80 z-[70] transform transition-transform duration-300 ease-in-out ${showMobilePopup ? 'translate-x-0' : 'translate-x-full'}`}>
            <div 
              className="critical-warning text-white h-full w-full relative overflow-hidden flex flex-col"
              style={{ backgroundColor: securityAlert?.backgroundColor || '#dc2626' }}
            >
              <div className="p-6">
                <button 
                  onClick={() => setShowMobilePopup(false)}
                  className="absolute top-4 right-4 hover:opacity-75"
                  style={{ color: securityAlert?.textColor || 'white' }}
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex items-center mb-6">
                  {(() => {
                    const IconComponent = getMobileIconComponent(securityAlert?.iconType || 'AlertTriangle');
                    return <IconComponent className="w-8 h-8 mr-3 text-yellow-400" />;
                  })()}
                  <div>
                    <span 
                      className="critical-badge px-2 py-1 rounded-full text-xs font-bold"
                      style={{ 
                        backgroundColor: securityAlert?.backgroundColor || '#dc2626',
                        color: securityAlert?.textColor || 'white' 
                      }}
                    >
                      CRITICAL SECURITY ALERT
                    </span>
                    <h3 
                      className="font-bold text-lg mt-2"
                      style={{ color: securityAlert?.textColor || 'white' }}
                    >
                      {securityAlert?.mobileTitle || 'Windows 10 Support Ending'}
                    </h3>
                  </div>
                </div>
                
                <p 
                  className="text-base mb-6 leading-relaxed"
                  style={{ color: securityAlert?.textColor || 'white' }}
                >
                  {securityAlert?.mobileDescription || 'Your Systems Will Become Vulnerable to New Threats. Microsoft is ending Windows 10 support on October 14, 2025. After this date, your systems will no longer receive security updates, leaving them exposed to new cyber threats.'}
                </p>
                
                <Link 
                  href={securityAlert?.buttonLink || '/windows10-upgrade'}
                  className="inline-flex items-center px-6 py-3 rounded-full text-base font-bold border-2 border-white hover:opacity-90 transition-all duration-300 transform hover:scale-105 w-full justify-center"
                  style={{ 
                    backgroundColor: securityAlert?.buttonBackgroundColor || '#ffffff',
                    color: securityAlert?.buttonTextColor || '#000000'
                  }}
                  onClick={() => {
                    setShowMobilePopup(false);
                    window.scrollTo(0, 0);
                  }}
                >
                  <span className="mr-2">►</span>
                  {securityAlert?.mobileButtonText || 'Get Protected Now'}
                </Link>
              </div>
              
              {/* Animated urgency indicators */}
              <div className="absolute top-0 left-0 h-2 w-full bg-yellow-400 animate-ping"></div>
              <div className="absolute bottom-0 left-0 h-2 w-full bg-yellow-400 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </>
      )}

      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
          <div className="flex items-center">
            <img 
              src="https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png" 
              alt="AramisTech Logo" 
              className={`w-auto transition-all duration-300 ${isScrolled ? 'h-12' : 'h-20'}`}
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {mainMenuItems.map((item) => {
              const subItems = getSubMenuItems(item.id);
              const hasSubItems = subItems.length > 0;

              if (hasSubItems) {
                return (
                  <div key={item.id} className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                      className="flex items-center gap-1 text-professional-gray hover:text-aramis-orange transition-colors font-medium"
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {activeDropdown === item.id && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        {subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleMenuItemClick(subItem)}
                            className="block w-full text-left px-4 py-2 text-professional-gray hover:text-aramis-orange hover:bg-gray-50 transition-colors"
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button 
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className="text-professional-gray hover:text-aramis-orange transition-colors font-medium"
                >
                  {item.label}
                </button>
              );
            })}
            <button 
              onClick={() => scrollToSection('contact')} 
              className="bg-aramis-orange text-white px-6 py-2 rounded-lg hover:bg-aramis-orange hover:opacity-90 transition-all font-semibold"
            >
              Free Consultation
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className={`text-professional-gray hover:text-aramis-orange transition-all duration-300 ${isScrolled ? 'p-1' : 'p-2'}`}
            >
              {isMenuOpen ? 
                <X className={`transition-all duration-300 ${isScrolled ? 'h-5 w-5' : 'h-6 w-6'}`} /> : 
                <Menu className={`transition-all duration-300 ${isScrolled ? 'h-5 w-5' : 'h-6 w-6'}`} />
              }
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {mainMenuItems.map((item) => {
                const subItems = getSubMenuItems(item.id);
                const hasSubItems = subItems.length > 0;

                if (hasSubItems) {
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => setIsMobileDropdownOpen(isMobileDropdownOpen === item.id ? null : item.id)}
                        className="flex items-center justify-between w-full px-3 py-2 text-professional-gray hover:text-aramis-orange transition-colors font-medium"
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isMobileDropdownOpen === item.id ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isMobileDropdownOpen === item.id && (
                        <div className="pl-6 space-y-1">
                          {subItems.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => handleMenuItemClick(subItem)}
                              className="block w-full text-left px-3 py-2 text-professional-gray hover:text-aramis-orange transition-colors"
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item)}
                    className="block w-full text-left px-3 py-2 text-professional-gray hover:text-aramis-orange transition-colors font-medium"
                  >
                    {item.label}
                  </button>
                );
              })}
              <button 
                onClick={() => scrollToSection('contact')} 
                className="w-full mt-4 bg-aramis-orange text-white px-6 py-3 rounded-lg hover:bg-aramis-orange hover:opacity-90 transition-all font-semibold"
              >
                Free Consultation
              </button>
              
              {isWarningDismissed && (
                <button
                  onClick={() => {
                    localStorage.removeItem('criticalWarningDismissed');
                    setIsWarningDismissed(false);
                    setIsMenuOpen(false);
                    window.location.reload();
                  }}
                  className="w-full mt-2 text-red-600 hover:text-red-700 text-sm flex items-center justify-center space-x-2 py-2 transition-colors"
                  title="Re-enable security alerts"
                >
                  <Shield className="w-4 h-4" />
                  <span>Enable Security Alerts</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}