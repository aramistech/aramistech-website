import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState<number | null>(null);
  const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);
  const [isMobileSupportOpen, setIsMobileSupportOpen] = useState(false);
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
  const mainMenuItems = menuItems.filter(item => !item.parentId && item.isVisible);
  const getSubMenuItems = (parentId: number) => 
    menuItems.filter(item => item.parentId === parentId && item.isVisible);

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
          
          <div className="hidden lg:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('services')} 
              className="text-professional-gray hover:text-aramis-orange transition-colors font-medium"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="text-professional-gray hover:text-aramis-orange transition-colors font-medium"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('team')} 
              className="text-professional-gray hover:text-aramis-orange transition-colors font-medium"
            >
              Team
            </button>
            <button 
              onClick={() => scrollToSection('industries')} 
              className="text-professional-gray hover:text-aramis-orange transition-colors font-medium"
            >
              Industries
            </button>
            {/* Support Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsSupportDropdownOpen(!isSupportDropdownOpen)}
                className="flex items-center gap-1 text-professional-gray hover:text-aramis-orange transition-colors font-medium"
              >
                Support
                <ChevronDown className={`w-4 h-4 transition-transform ${isSupportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSupportDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link href="/customer-portal">
                    <button 
                      onClick={() => {
                        setIsSupportDropdownOpen(false);
                        setTimeout(() => window.scrollTo(0, 0), 100);
                      }}
                      className="block w-full text-left px-4 py-2 text-professional-gray hover:text-aramis-orange hover:bg-gray-50 transition-colors"
                    >
                      Customer Portal
                    </button>
                  </Link>
                  <Link href="/windows10-upgrade">
                    <button 
                      onClick={() => {
                        setIsSupportDropdownOpen(false);
                        setTimeout(() => window.scrollTo(0, 0), 100);
                      }}
                      className="block w-full text-left px-4 py-2 text-professional-gray hover:text-aramis-orange hover:bg-gray-50 transition-colors"
                    >
                      Windows 10 Upgrade
                    </button>
                  </Link>
                  <Link href="/ip-lookup">
                    <button 
                      onClick={() => {
                        setIsSupportDropdownOpen(false);
                        setTimeout(() => window.scrollTo(0, 0), 100);
                      }}
                      className="block w-full text-left px-4 py-2 text-professional-gray hover:text-aramis-orange hover:bg-gray-50 transition-colors"
                    >
                      IP Lookup Tool
                    </button>
                  </Link>
                  
                  {/* Downloads Section */}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Support Downloads
                    </div>
                    <a 
                      href="https://github.com/rustdesk/rustdesk/releases/download/1.4.0/rustdesk-1.4.0-x86_64.exe"
                      download="rustdesk-1.4.0-x86_64.exe"
                      onClick={() => setIsSupportDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-professional-gray hover:text-aramis-orange hover:bg-gray-50 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🖥️ RustDesk QuickSupport (Windows Only)
                    </a>
                    <a 
                      href="/downloads/network-diagnostic-tool.bat"
                      download="AramisTech-Network-Diagnostic.bat"
                      onClick={() => setIsSupportDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-professional-gray hover:text-aramis-orange hover:bg-gray-50 transition-colors"
                    >
                      📊 Network Diagnostic Tool
                    </a>
                    <a 
                      href="/downloads/system-info-collector.bat"
                      download="AramisTech-System-Info.bat"
                      onClick={() => setIsSupportDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-professional-gray hover:text-aramis-orange hover:bg-gray-50 transition-colors"
                    >
                      💻 System Info Collector
                    </a>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="bg-aramis-orange text-white px-6 py-2 rounded-lg hover:bg-aramis-orange hover:opacity-90 transition-all font-semibold"
            >
              Free Consultation
            </button>
          </div>
          
          <div className="lg:hidden">
            <button onClick={toggleMenu} className="text-professional-gray hover:text-aramis-orange">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <button 
              onClick={() => scrollToSection('services')} 
              className="block w-full text-left py-2 text-professional-gray hover:text-aramis-orange"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="block w-full text-left py-2 text-professional-gray hover:text-aramis-orange"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('team')} 
              className="block w-full text-left py-2 text-professional-gray hover:text-aramis-orange"
            >
              Team
            </button>
            <button 
              onClick={() => scrollToSection('industries')} 
              className="block w-full text-left py-2 text-professional-gray hover:text-aramis-orange"
            >
              Industries
            </button>
            {/* Mobile Support Dropdown */}
            <div>
              <button 
                onClick={() => setIsMobileSupportOpen(!isMobileSupportOpen)}
                className="flex items-center justify-between w-full text-left py-2 text-professional-gray hover:text-aramis-orange"
              >
                Support
                <ChevronDown className={`w-4 h-4 transition-transform ${isMobileSupportOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMobileSupportOpen && (
                <div className="ml-4 space-y-1">
                  <Link href="/customer-portal">
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false); 
                        setIsMobileSupportOpen(false);
                        setTimeout(() => window.scrollTo(0, 0), 100);
                      }}
                      className="block w-full text-left py-2 text-sm text-professional-gray hover:text-aramis-orange"
                    >
                      Customer Portal
                    </button>
                  </Link>
                  <Link href="/windows10-upgrade">
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false); 
                        setIsMobileSupportOpen(false);
                        setTimeout(() => window.scrollTo(0, 0), 100);
                      }}
                      className="block w-full text-left py-2 text-sm text-professional-gray hover:text-aramis-orange"
                    >
                      Windows 10 Upgrade
                    </button>
                  </Link>
                  <Link href="/ip-lookup">
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false); 
                        setIsMobileSupportOpen(false);
                        setTimeout(() => window.scrollTo(0, 0), 100);
                      }}
                      className="block w-full text-left py-2 text-sm text-professional-gray hover:text-aramis-orange"
                    >
                      IP Lookup Tool
                    </button>
                  </Link>
                  
                  {/* Mobile Downloads Section */}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <div className="py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Support Downloads
                    </div>
                    <a 
                      href="https://github.com/rustdesk/rustdesk/releases/download/1.4.0/rustdesk-1.4.0-x86_64.exe"
                      download="rustdesk-1.4.0-x86_64.exe"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsMobileSupportOpen(false);
                      }}
                      className="block w-full text-left py-2 text-sm text-professional-gray hover:text-aramis-orange"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🖥️ RustDesk QuickSupport (Windows Only)
                    </a>
                    <a 
                      href="/downloads/network-diagnostic-tool.bat"
                      download="AramisTech-Network-Diagnostic.bat"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsMobileSupportOpen(false);
                      }}
                      className="block w-full text-left py-2 text-sm text-professional-gray hover:text-aramis-orange"
                    >
                      📊 Network Diagnostic Tool
                    </a>
                    <a 
                      href="/downloads/system-info-collector.bat"
                      download="AramisTech-System-Info.bat"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsMobileSupportOpen(false);
                      }}
                      className="block w-full text-left py-2 text-sm text-professional-gray hover:text-aramis-orange"
                    >
                      💻 System Info Collector
                    </a>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="block w-full text-left py-2 bg-aramis-orange text-white px-4 rounded-lg text-center"
            >
              Free Consultation
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
