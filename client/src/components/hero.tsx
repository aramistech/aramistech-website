import { Award, CheckCircle, Calendar, Phone } from "lucide-react";
import { useContactForm } from "@/hooks/use-contact-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackClick, trackBusinessEvent, trackFormInteraction } from "@/lib/analytics";

export default function Hero() {
  const { 
    quickQuoteForm, 
    submitQuickQuote, 
    isQuickQuoteLoading 
  } = useContactForm();

  const scrollToContact = () => {
    trackClick('cta_button', 'hero_contact', 'Get Free Consultation');
    trackBusinessEvent('quote_request', { source: 'hero_cta' });
    
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickQuoteSubmit = (data: any) => {
    trackFormInteraction('quick_quote', 'submit');
    trackBusinessEvent('quote_request', { 
      source: 'hero_quick_form',
      company: data.company,
      needs: data.needs 
    });
    submitQuickQuote(data);
  };

  const handlePhoneClick = () => {
    trackClick('phone_number', 'hero_phone', '(561) 419-7800');
    trackBusinessEvent('phone_click', { source: 'hero' });
  };

  return (
    <section className="bg-gradient-to-br from-primary-blue to-secondary-blue text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="lg:pr-8">
            <div className="mb-6">
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
                <Award className="inline-block w-4 h-4 mr-2" />
                27+ Years of Excellence
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Professional IT Solutions That Keep Your Business Running
            </h1>
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              Family-owned IT company serving South Florida businesses with reliable computer repairs, network maintenance, cloud solutions, and custom servers. Get peace of mind with our expert technology support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={scrollToContact}
                className="bg-white text-primary-blue px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center flex-1 sm:flex-none sm:w-64"
              >
                <Calendar className="inline-block w-4 h-4 mr-2" />
                Schedule Free Consultation
              </button>
              <a 
                href="tel:(305) 814-4461" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-blue transition-colors text-center flex flex-col items-center justify-center min-h-[4rem] flex-1 sm:flex-none sm:w-64"
              >
                <div className="flex items-center text-base">
                  <Phone className="inline-block w-4 h-4 mr-2" />
                  Call Now
                </div>
                <div className="text-sm font-normal">
                  (305) 814-4461
                </div>
              </a>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
                <span>Family-Owned & Operated</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
                <span>South Florida Local</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Professional IT team working with technology" 
              className="rounded-xl shadow-2xl w-full h-auto"
            />
            
            {/* Quick Contact Form Overlay */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-lg shadow-xl max-w-sm hidden lg:block">
              <h3 className="text-lg font-semibold text-professional-gray mb-4">Get Quick Quote</h3>
              <form onSubmit={quickQuoteForm.handleSubmit(submitQuickQuote)} className="space-y-3">
                <Input
                  {...quickQuoteForm.register("name")}
                  placeholder="Your Name"
                  className="text-professional-gray text-sm"
                />
                <Input
                  {...quickQuoteForm.register("email")}
                  type="email"
                  placeholder="Email Address"
                  className="text-professional-gray text-sm"
                />
                <Input
                  {...quickQuoteForm.register("phone")}
                  type="tel"
                  placeholder="Phone Number"
                  className="text-professional-gray text-sm"
                />
                <Button 
                  type="submit" 
                  disabled={isQuickQuoteLoading}
                  className="w-full bg-primary-blue text-white hover:bg-secondary-blue"
                >
                  {isQuickQuoteLoading ? "Submitting..." : "Get Free Quote"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
