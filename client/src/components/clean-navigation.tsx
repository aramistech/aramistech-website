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

export default function CleanNavigation() {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch menu items
  const { data: menuData } = useQuery({
    queryKey: ['/api/menu-items'],
  });

  const menuItems = menuData?.menuItems || [];
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

  const handleMenuClick = (item: MenuItem) => {
    if (item.href) {
      if (item.href.startsWith('#')) {
        scrollToSection(item.href.substring(1));
      } else if (item.href.startsWith('http')) {
        window.open(item.href, '_blank');
      } else {
        window.location.href = item.href;
      }
    }
    setActiveDropdown(null);
    setIsMenuOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="frosted-glass-nav rounded-2xl">
        <div className="flex justify-between items-center px-8 py-4">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/api/media/4/file" 
              alt="AramisTech Logo" 
              className="h-16 w-auto"
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {mainMenuItems.map((item: MenuItem) => {
              const subItems = getSubMenuItems(item.id);
              const hasSubItems = subItems.length > 0;

              if (hasSubItems) {
                return (
                  <div key={item.id} className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                      className="menu-item-clean flex items-center gap-1"
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {activeDropdown === item.id && (
                      <div className="absolute top-full left-0 mt-2 w-56 dropdown-clean rounded-lg py-2 z-50">
                        {subItems.map((subItem: MenuItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleMenuClick(subItem)}
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:text-aramis-orange hover:bg-gray-50 transition-colors"
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
                  onClick={() => handleMenuClick(item)}
                  className="menu-item-clean"
                >
                  {item.label}
                </button>
              );
            })}

            {/* CTA Button */}
            <Link href="/it-consultation">
              <button className="bg-aramis-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl ml-4">
                Free Consultation
              </button>
            </Link>
          </div>

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
              {mainMenuItems.map((item: MenuItem) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-aramis-orange transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
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
  );
}