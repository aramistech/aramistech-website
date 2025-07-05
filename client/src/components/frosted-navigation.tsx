import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface MenuItem {
  id: number;
  label: string;
  href?: string;
  parentId?: number;
  orderIndex: number;
  isVisible: boolean;
}

interface SecurityAlert {
  id: number;
  isEnabled: boolean;
  desktopIsEnabled: boolean;
  mobileIsEnabled: boolean;
  desktopTitle: string;
  desktopMessage: string;
  desktopLinkText: string;
  desktopLinkUrl: string;
  desktopBackgroundColor: string;
  mobileTitle: string;
  mobileMessage: string;
  mobileButtonText: string;
  mobileButtonUrl: string;
  mobileBackgroundColor: string;
}

export default function FrostedNavigation() {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch menu items and security alert
  const { data: menuData } = useQuery({ queryKey: ['/api/menu-items'] });
  const { data: alertData } = useQuery({ queryKey: ['/api/security-alert'] });

  const menuItems = (menuData as any)?.menuItems || [];
  const alert = (alertData as any)?.alert as SecurityAlert | undefined;
  
  const mainMenuItems = menuItems.filter((item: MenuItem) => !item.parentId && item.isVisible);
  
  const getSubMenuItems = (parentId: number) => {
    return menuItems.filter((item: MenuItem) => item.parentId === parentId && item.isVisible);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.href) {
      if (item.href.startsWith('#')) {
        scrollToSection(item.href.substring(1));
      } else if (item.href.startsWith('http')) {
        window.open(item.href, '_blank');
      } else if (item.href.includes('/download/')) {
        window.location.href = item.href;
      } else {
        window.location.href = item.href;
      }
    }
    setActiveDropdown(null);
    setIsMenuOpen(false);
    setIsMobileDropdownOpen(null);
  };

  return (
    <header className="sticky top-0" style={{ zIndex: 999999, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' }}>
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
      {alert?.isEnabled && alert?.desktopIsEnabled && (
        <div 
          className="critical-warning text-white py-1 relative overflow-hidden"
          style={{ backgroundColor: alert.desktopBackgroundColor }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center text-center">
              <div className="flex items-center space-x-3">
                <span className="critical-badge bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  CRITICAL
                </span>
                <span className="font-semibold text-sm sm:text-base professional-text">
                  {alert.desktopMessage}
                </span>
                <a 
                  href={alert.desktopLinkUrl}
                  className="inline-flex items-center bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-white hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="mr-1">►</span>
                  {alert.desktopLinkText}
                </a>
              </div>
            </div>
          </div>
          
          {/* Animated urgency indicators */}
          <div className="absolute left-0 top-0 w-2 h-full bg-yellow-400 animate-ping"></div>
          <div className="absolute right-0 top-0 w-2 h-full bg-yellow-400 animate-ping"></div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="frosted-glass-nav">
          <div className="menu-container">
            <div className="logo-section">
              <img 
                src="/api/media/4/file" 
                alt="AramisTech Logo" 
                className="logo"
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="nav-links hidden lg:flex">
              {mainMenuItems.map((item: MenuItem) => {
                const subItems = getSubMenuItems(item.id);
                const hasSubItems = subItems.length > 0;

                if (hasSubItems) {
                  return (
                    <div key={item.id} className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                        className="nav-link flex items-center gap-1"
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {activeDropdown === item.id && (
                        <div className="absolute top-full left-0 mt-2 w-auto min-w-56 dropdown-menu py-2" style={{ zIndex: 999999 }}>
                          {subItems.map((subItem: MenuItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => handleMenuItemClick(subItem)}
                              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-aramis-orange hover:bg-gray-50 transition-colors whitespace-nowrap"
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
                    className="nav-link"
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* CTA Button */}
            <Link href="/it-consultation">
              <button className="cta-button hidden lg:block">
                Free Consultation
              </button>
            </Link>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-aramis-orange transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-200">
              <div className="px-4 py-3 space-y-2">
                {mainMenuItems.map((item: MenuItem) => {
                  const subItems = getSubMenuItems(item.id);
                  const hasSubItems = subItems.length > 0;

                  if (hasSubItems) {
                    return (
                      <div key={item.id}>
                        <button
                          onClick={() => setIsMobileDropdownOpen(isMobileDropdownOpen === item.id ? null : item.id)}
                          className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:text-aramis-orange transition-colors font-medium"
                        >
                          {item.label}
                          <ChevronDown className={`w-4 h-4 transition-transform ${isMobileDropdownOpen === item.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isMobileDropdownOpen === item.id && (
                          <div className="pl-6 space-y-1">
                            {subItems.map((subItem: MenuItem) => (
                              <button
                                key={subItem.id}
                                onClick={() => handleMenuItemClick(subItem)}
                                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-aramis-orange transition-colors"
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
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-aramis-orange transition-colors font-medium"
                    >
                      {item.label}
                    </button>
                  );
                })}
                <Link href="/it-consultation">
                  <button className="w-full bg-aramis-orange text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-all font-semibold mt-4">
                    Free Consultation
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}