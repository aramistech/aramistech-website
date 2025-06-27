import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ExitIntentPopup {
  id: number;
  title: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl?: string;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
}

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isConsultationFormOpen, setIsConsultationFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    services: [] as string[],
    challenges: '',
    urgency: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const { data: popupData } = useQuery<{ success: boolean; popup?: ExitIntentPopup }>({
    queryKey: ["/api/exit-intent-popup"],
  });

  const submitConsultation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/it-consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to submit consultation request');
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      // Reset form data
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        services: [],
        challenges: '',
        urgency: ''
      });
      toast({
        title: "Request Submitted",
        description: "We'll contact you within 2 business hours for your free IT consultation.",
      });
      // Close form after short delay to show success message
      setTimeout(() => {
        setIsConsultationFormOpen(false);
        setIsSuccess(false);
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again or call us directly at (305) 807-7015",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitConsultation.mutate(formData);
  };

  const popup = popupData?.popup;

  useEffect(() => {
    if (!popup?.isActive || hasShown) return;

    let timeoutId: NodeJS.Timeout;
    let isMouseLeaving = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is moving towards the top of the page (exiting)
      if (e.clientY <= 0 && !isMouseLeaving) {
        isMouseLeaving = true;
        timeoutId = setTimeout(() => {
          if (!hasShown) {
            setIsVisible(true);
            setHasShown(true);
          }
        }, 100);
      }
    };

    const handleMouseEnter = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      isMouseLeaving = false;
    };

    // Add event listeners
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Cleanup
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [popup?.isActive, hasShown]);



  if (!popup?.isActive || !isVisible) {
    return null;
  }

  return (
    <>
      <Dialog open={isVisible && !isConsultationFormOpen} onOpenChange={setIsVisible}>
        <DialogContent 
          className="max-w-md p-0 overflow-hidden z-[9999]"
          style={{ 
            backgroundColor: popup.backgroundColor,
            color: popup.textColor,
          }}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">{popup.title}</DialogTitle>
          <DialogDescription className="sr-only">{popup.message}</DialogDescription>
          
          <div className="relative">
            {/* Image */}
            {popup.imageUrl && (
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={popup.imageUrl}
                  alt="Popup"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 text-center">
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: popup.textColor }}
              >
                {popup.title}
              </h2>
              
              <p 
                className="text-base mb-6 leading-relaxed"
                style={{ color: popup.textColor }}
              >
                {popup.message}
              </p>

              {/* Action button */}
              <div 
                className="w-full py-3 text-lg font-semibold cursor-pointer text-center rounded-md hover:opacity-90 transition-opacity"
                onClick={() => {
                  setIsVisible(false);
                  setIsConsultationFormOpen(true);
                }}

                style={{
                  backgroundColor: popup.buttonColor,
                  color: popup.backgroundColor,
                }}
              >
                {popup.buttonText}
              </div>

            {/* Small dismiss text */}
            <button
              onClick={() => setIsVisible(false)}
              className="mt-4 text-xs underline opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: popup.textColor }}
            >
              No thanks, I'll continue browsing
            </button>
          </div>
        </div>
      </DialogContent>
      </Dialog>
      
      {/* IT Consultation Form */}
      <Dialog open={isConsultationFormOpen} onOpenChange={() => setIsConsultationFormOpen(false)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-bold text-blue-900 mb-4">
            Get Your Free IT Consultation
          </DialogTitle>
          <DialogDescription className="text-gray-600 mb-6">
            Tell us about your technology challenges and we'll provide personalized recommendations during your free consultation.
          </DialogDescription>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Smith"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="(305) 555-0123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Your Company Name"
              />
            </div>

            {/* IT Services Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">What IT services do you need? (Select all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Network Setup",
                  "Cybersecurity",
                  "Cloud Migration",
                  "IT Support",
                  "Hardware Setup",
                  "Software Installation",
                  "Data Backup",
                  "VoIP Systems",
                  "Remote Work Setup",
                  "Server Management",
                  "Email Setup",
                  "Printer Support"
                ].map((service) => (
                  <label key={service} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Current Challenges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Describe your current IT challenges *</label>
              <textarea
                required
                rows={4}
                value={formData.challenges}
                onChange={(e) => handleInputChange('challenges', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Tell us about your technology problems, slow systems, security concerns, or other IT issues..."
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How urgent is your need?</label>
              <select 
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select urgency level</option>
                <option value="immediate">Immediate - Systems down</option>
                <option value="urgent">Urgent - Within 24 hours</option>
                <option value="soon">Soon - Within a week</option>
                <option value="planned">Planned - Within a month</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitConsultation.isPending}
                className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitConsultation.isPending ? 'Submitting...' : 'Request Free Consultation'}
              </button>
              <button
                type="button"
                onClick={() => setIsConsultationFormOpen(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}