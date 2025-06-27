import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

  // Debug logging for consultation form state
  useEffect(() => {
    console.log("CONSULTATION FORM STATE CHANGED:", isConsultationFormOpen);
  }, [isConsultationFormOpen]);



  const { data: popupData } = useQuery<{ success: boolean; popup?: ExitIntentPopup }>({
    queryKey: ["/api/exit-intent-popup"],
  });

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
      
      {/* IT Consultation Success Dialog */}
      <Dialog open={isConsultationFormOpen} onOpenChange={() => setIsConsultationFormOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-xl font-bold text-blue-900 mb-4">
            Free IT Consultation Requested
          </DialogTitle>
          <DialogDescription className="sr-only">
            IT consultation confirmation dialog
          </DialogDescription>
          <div className="space-y-4">
            <p className="text-gray-700">
              Thank you for your interest! Our IT experts will contact you within 2 business hours to discuss:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Your current technology challenges</li>
              <li>Customized IT solutions for your business</li>
              <li>Pricing and implementation timeline</li>
              <li>How we can improve your operations</li>
            </ul>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                Call us now for immediate assistance: <span className="font-bold">(305) 807-7015</span>
              </p>
            </div>
            <button 
              onClick={() => setIsConsultationFormOpen(false)}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}