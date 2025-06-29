import { Heart, Clock, Shield, Handshake, ArrowRight } from "lucide-react";

export default function About() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="/api/media/26/file" 
              alt="Modern office technology setup" 
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
          
          <div>
            <div className="mb-6">
              <span className="text-primary-blue font-semibold text-lg">// About AramisTech</span>
            </div>
            <h2 className="text-4xl font-bold text-professional-gray mb-6">Providing Professional, Comprehensive Business IT Services</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              In today's digital world, unreliable technology can disrupt business operations, leading to lost productivity, frustration, and costly downtime. Many companies face challenges with IT systems that aren't optimized for their needs or lack adequate support.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              At AramisTech, we offer expert IT solutions tailored to your business. As a family-owned company with 27+ years of experience, we provide reliable services such as computer repairs, network maintenance, secure cloud NAS, and custom-built servers.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <div className="bg-primary-blue/10 p-3 rounded-lg mr-4">
                  <Heart className="w-5 h-5 text-primary-blue" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Family-Owned & Operated</h3>
                  <p className="text-gray-600 text-sm">Personal touch and commitment to every project with dedicated service and support.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary-blue/10 p-3 rounded-lg mr-4">
                  <Clock className="w-5 h-5 text-primary-blue" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Quick Support</h3>
                  <p className="text-gray-600 text-sm">Remote maintenance support to quickly connect and correct issues, minimizing downtime.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary-blue/10 p-3 rounded-lg mr-4">
                  <Shield className="w-5 h-5 text-primary-blue" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Expertise You Can Trust</h3>
                  <p className="text-gray-600 text-sm">27 years of experience delivering reliable, high-quality solutions tailored to your needs.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary-blue/10 p-3 rounded-lg mr-4">
                  <Handshake className="w-5 h-5 text-primary-blue" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Long-Term Support</h3>
                  <p className="text-gray-600 text-sm">Ongoing support to keep your systems running smoothly and securely over time.</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={scrollToContact}
              className="inline-flex items-center bg-primary-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary-blue transition-colors"
            >
              Learn More About Our Approach
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
