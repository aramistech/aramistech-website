import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useContactForm } from "@/hooks/use-contact-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trackClick, trackBusinessEvent, trackFormInteraction } from "@/lib/analytics";

export default function Contact() {
  const { 
    contactForm, 
    submitContact, 
    isContactLoading,
    setFormValue
  } = useContactForm();

  return (
    <section id="contact" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary-blue font-semibold text-lg">// Get Started Today</span>
          <h2 className="text-4xl font-bold text-professional-gray mb-6 mt-4">Request Your Free Consultation</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch and discover how we can help optimize your business technology. We aim to respond within 2 hours during business hours.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 text-professional-gray">Tell Us About Your IT Needs</h3>
            <form onSubmit={contactForm.handleSubmit(submitContact)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm font-medium text-professional-gray mb-2">First Name *</Label>
                  <Input 
                    {...contactForm.register("firstName")}
                    required 
                    className="focus:ring-2 focus:ring-primary-blue focus:border-transparent" 
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-professional-gray mb-2">Last Name *</Label>
                  <Input 
                    {...contactForm.register("lastName")}
                    required 
                    className="focus:ring-2 focus:ring-primary-blue focus:border-transparent" 
                  />
                </div>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-professional-gray mb-2">Company Name *</Label>
                <Input 
                  {...contactForm.register("company")}
                  required 
                  className="focus:ring-2 focus:ring-primary-blue focus:border-transparent" 
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm font-medium text-professional-gray mb-2">Email Address *</Label>
                  <Input 
                    {...contactForm.register("email")}
                    type="email" 
                    required 
                    className="focus:ring-2 focus:ring-primary-blue focus:border-transparent" 
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-professional-gray mb-2">Phone Number *</Label>
                  <Input 
                    {...contactForm.register("phone")}
                    type="tel" 
                    required 
                    className="focus:ring-2 focus:ring-primary-blue focus:border-transparent" 
                  />
                </div>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-professional-gray mb-2">Services Needed</Label>
                <Select onValueChange={(value) => setFormValue("service", value)}>
                  <SelectTrigger className="focus:ring-2 focus:ring-primary-blue focus:border-transparent">
                    <SelectValue placeholder="Select a service..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workstation">Workstation Maintenance</SelectItem>
                    <SelectItem value="fileserver">File Server Maintenance</SelectItem>
                    <SelectItem value="activedirectory">Active Directory</SelectItem>
                    <SelectItem value="exchange">Exchange/Google Workspace</SelectItem>
                    <SelectItem value="synology">Synology NAS</SelectItem>
                    <SelectItem value="support">Phone Support</SelectItem>
                    <SelectItem value="consultation">General IT Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-professional-gray mb-2">Number of Employees</Label>
                <Select onValueChange={(value) => setFormValue("employees", value)}>
                  <SelectTrigger className="focus:ring-2 focus:ring-primary-blue focus:border-transparent">
                    <SelectValue placeholder="Select range..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-25">11-25 employees</SelectItem>
                    <SelectItem value="26-50">26-50 employees</SelectItem>
                    <SelectItem value="51-100">51-100 employees</SelectItem>
                    <SelectItem value="100+">100+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-professional-gray mb-2">Current IT Challenges</Label>
                <Textarea 
                  {...contactForm.register("challenges")}
                  rows={4} 
                  className="focus:ring-2 focus:ring-primary-blue focus:border-transparent" 
                  placeholder="Tell us about your current IT challenges or goals..." 
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-professional-gray mb-2">Preferred Contact Time</Label>
                <RadioGroup onValueChange={(value) => setFormValue("contactTime", value)}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="morning" id="morning" />
                      <Label htmlFor="morning" className="text-sm">Morning (9am-12pm)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="afternoon" id="afternoon" />
                      <Label htmlFor="afternoon" className="text-sm">Afternoon (12pm-6pm)</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                type="submit" 
                disabled={isContactLoading}
                className="w-full bg-primary-blue text-white py-4 hover:bg-secondary-blue"
                onClick={() => {
                  trackFormInteraction('contact_form', 'submit');
                  trackBusinessEvent('contact_form', { source: 'main_contact_form' });
                }}
              >
                <i className="fas fa-paper-plane mr-2"></i>
                {isContactLoading ? "Submitting..." : "Request Free Consultation"}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                By submitting this form, you agree to our privacy policy. We'll never share your information.
              </p>
            </form>
          </div>
          
          {/* Contact Information */}
          <div>
            <div className="bg-primary-blue text-white p-8 rounded-xl mb-8">
              <h3 className="text-2xl font-semibold mb-6">Get In Touch Directly</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="w-6 h-6 mr-4 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Call Us</h4>
                    <p className="text-blue-100">Monday - Friday: 9am to 6pm</p>
                    <a 
                      href="tel:(305) 814-4461" 
                      className="text-lg font-semibold hover:text-blue-200 transition-colors"
                      onClick={() => {
                        trackClick('phone_number', 'contact_phone', '(305) 814-4461');
                        trackBusinessEvent('phone_click', { source: 'contact_section' });
                      }}
                    >
                      (305) 814-4461
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="w-6 h-6 mr-4 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Email Us</h4>
                    <p className="text-blue-100">Response within 2 hours</p>
                    <a 
                      href="mailto:sales@aramistech.com" 
                      className="text-lg font-semibold hover:text-blue-200 transition-colors"
                      onClick={() => {
                        trackClick('email_link', 'contact_email', 'sales@aramistech.com');
                        trackBusinessEvent('contact_form', { source: 'email_link' });
                      }}
                    >
                      sales@aramistech.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 mr-4 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Service Area</h4>
                    <p className="text-blue-100">Proudly serving South Florida</p>
                    <p className="text-lg font-semibold">Miami & Broward Counties</p>
                  </div>
                </div>
              </div>
            </div>
            
            <img 
              src="/api/media/27/file" 
              alt="South Florida skyline" 
              className="rounded-xl shadow-lg w-full h-64 object-cover"
            />
            
            <div className="mt-8 p-6 bg-light-gray rounded-xl">
              <h4 className="font-semibold text-lg mb-4 text-professional-gray">Emergency Support Available</h4>
              <p className="text-gray-600 mb-4">Critical IT issues can't wait. Contact us for urgent technical support outside regular business hours.</p>
              <a href="tel:(305) 814-4461" className="inline-flex items-center text-primary-blue font-semibold hover:text-secondary-blue transition-colors">
                <Phone className="w-4 h-4 mr-2" />
                Emergency Hotline: (305) 814-4461
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
