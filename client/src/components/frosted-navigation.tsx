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
    <header className="sticky top-0" style={{ zIndex: 999999 }}>
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

      {/* Main Navigation - Beautiful Frosted Glass Design */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(249, 115, 22, 0.15) 50%, rgba(147, 51, 234, 0.1) 100%)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Animated Glass Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-gradient-to-r from-orange-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <img 
                src="/api/media/4/file" 
                alt="AramisTech Logo" 
                className="h-12 w-auto filter drop-shadow-lg"
              />
            </div>
            
            {/* Desktop Navigation - Frosted Glass Menu */}
            <nav className="hidden lg:flex items-center space-x-1">
              {mainMenuItems.map((item: MenuItem) => {
                const subItems = getSubMenuItems(item.id);
                const hasSubItems = subItems.length > 0;

                if (hasSubItems) {
                  return (
                    <div key={item.id} className="relative group" ref={dropdownRef}>
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                        className="glass-nav-item flex items-center gap-1"
                        style={{
                          padding: '12px 20px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '50px',
                          color: 'rgba(55, 65, 81, 0.9)',
                          fontWeight: '500',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(249, 115, 22, 0.15)';
                          e.currentTarget.style.color = '#f97316';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.color = 'rgba(55, 65, 81, 0.9)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {activeDropdown === item.id && (
                        <div 
                          className="fixed top-0 left-0 w-full h-full pointer-events-none"
                          style={{ 
                            zIndex: 999999999,
                            position: 'fixed'
                          }}
                        >
                          <div 
                            className="absolute pointer-events-auto"
                            style={{
                              top: '140px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              zIndex: 999999999
                            }}
                          >
                            <div 
                              className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden min-w-[220px] w-max"
                              style={{
                                background: 'rgba(255, 255, 255, 0.98)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                              }}
                            >
                              {subItems.map((subItem: MenuItem, index) => (
                                <button
                                  key={subItem.id}
                                  onClick={() => handleMenuItemClick(subItem)}
                                  className={`block w-full text-left px-6 py-4 text-gray-700 hover:text-aramis-orange hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-300 font-medium text-sm ${
                                    index !== subItems.length - 1 ? 'border-b border-gray-100' : ''
                                  }`}
                                >
                                  {subItem.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button 
                    key={item.id}
                    onClick={() => handleMenuItemClick(item)}
                    className="glass-nav-item"
                    style={{
                      padding: '12px 20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '50px',
                      color: 'rgba(55, 65, 81, 0.9)',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(249, 115, 22, 0.15)';
                      e.currentTarget.style.color = '#f97316';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = 'rgba(55, 65, 81, 0.9)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* CTA Button - Frosted Glass Design */}
            <Link href="/it-consultation">
              <button 
                className="hidden lg:block"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.9) 0%, rgba(251, 146, 60, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(249, 115, 22, 0.6)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 1) 0%, rgba(251, 146, 60, 1) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(249, 115, 22, 0.4)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.9) 0%, rgba(251, 146, 60, 0.9) 100%)';
                }}
              >
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