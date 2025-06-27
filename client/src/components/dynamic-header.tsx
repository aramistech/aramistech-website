import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, AlertTriangle } from "lucide-react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useLocation();

  // Fetch menu items from database
  const { data: menuData } = useQuery({
    queryKey: ['/api/menu-items'],
    queryFn: async () => {
      const res = await fetch('/api/menu-items');
      return res.json();
    },
  });

  const menuItems: MenuItem[] = menuData?.menuItems || [];
  const mainMenuItems = menuItems.filter(item => !item.parentId && item.isVisible)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const getSubMenuItems = (parentId: number) => 
    menuItems.filter(item => item.parentId === parentId && item.isVisible)
      .sort((a, b) => a.orderIndex - b.orderIndex);

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

      {/* Critical Windows 10 Warning Banner */}
      <div className="critical-warning text-white py-3 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-center">
            <div className="flex items-center space-x-3">
              <span className="critical-badge bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                CRITICAL
              </span>
              <span className="font-semibold text-sm sm:text-base professional-text">
                Windows 10 Support Ending - Your Systems Will Become Vulnerable to New Threats
              </span>
              <Link 
                href="/windows10-upgrade" 
                className="hidden sm:inline-flex items-center bg-yellow-400 text-red-800 px-3 py-1 rounded-full text-xs font-bold hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
                onClick={() => window.scrollTo(0, 0)}
              >
                <span className="mr-1">⚡</span>
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
        {/* Animated urgency indicators */}
        <div className="absolute left-0 top-0 w-2 h-full bg-yellow-400 animate-ping"></div>
        <div className="absolute right-0 top-0 w-2 h-full bg-yellow-400 animate-ping" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img 
              src="https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png" 
              alt="AramisTech Logo" 
              className="h-20 w-auto"
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
              className="text-professional-gray hover:text-aramis-orange p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}