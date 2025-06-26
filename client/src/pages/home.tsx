import DynamicHeader from "@/components/dynamic-header";
import Hero from "@/components/hero";
import TrustIndicators from "@/components/trust-indicators";
import Services from "@/components/services";
import About from "@/components/about";
import Team from "@/components/team";
import Process from "@/components/process";
import Industries from "@/components/industries";
import Testimonials from "@/components/testimonials";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import ExitIntentPopup from "@/components/exit-intent-popup";

export default function Home() {
  return (
    <div className="min-h-screen">
      <DynamicHeader />
      <Hero />
      <TrustIndicators />
      <Services />
      
      {/* Middle CTA Section */}
      <section className="py-16 bg-primary-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Transform Your IT Infrastructure?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Get a free consultation and discover how our 27+ years of expertise can optimize your business technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="bg-white text-primary-blue px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              <i className="fas fa-calendar-check mr-2"></i>Schedule Free Consultation
            </a>
            <a href="tel:(305) 814-4461" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-blue transition-colors">
              <i className="fas fa-phone mr-2"></i>Call Now: (305) 814-4461
            </a>
          </div>
        </div>
      </section>
      
      <About />
      <Team />
      <Process />
      <Industries />
      <Testimonials />
      <Contact />
      <Footer />
      <ExitIntentPopup />
    </div>
  );
}
