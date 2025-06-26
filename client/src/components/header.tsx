import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";
import { trackClick } from "@/lib/analytics";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (sectionId: string) => {
    trackClick('navigation_link', sectionId, sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
            <Link href="/windows10-upgrade">
              <button className="text-professional-gray hover:text-aramis-orange transition-colors font-medium">
                Windows 10 Upgrade
              </button>
            </Link>
            <Link href="/customer-portal">
              <button className="text-professional-gray hover:text-aramis-orange transition-colors font-medium">
                Customer Portal
              </button>
            </Link>
            <Link href="/ip-lookup">
              <button className="text-professional-gray hover:text-aramis-orange transition-colors font-medium">
                IP Lookup
              </button>
            </Link>
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
            <Link href="/windows10-upgrade">
              <button className="block w-full text-left py-2 text-professional-gray hover:text-aramis-orange">
                Windows 10 Upgrade
              </button>
            </Link>
            <Link href="/customer-portal">
              <button className="block w-full text-left py-2 text-professional-gray hover:text-aramis-orange">
                Customer Portal
              </button>
            </Link>
            <Link href="/ip-lookup">
              <button className="block w-full text-left py-2 text-professional-gray hover:text-aramis-orange">
                IP Lookup
              </button>
            </Link>
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
