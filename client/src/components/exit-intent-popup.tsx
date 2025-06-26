import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "wouter";

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
}

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

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

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!popup?.isActive || !isVisible) {
    return null;
  }

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent 
        className="max-w-md p-0 overflow-hidden"
        style={{ 
          backgroundColor: popup.backgroundColor,
          color: popup.textColor,
        }}
      >
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 hover:bg-black/10"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>

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
            <Link href={popup.buttonUrl}>
              <Button
                className="w-full py-3 text-lg font-semibold"
                onClick={handleClose}
                style={{
                  backgroundColor: popup.textColor,
                  color: popup.backgroundColor,
                }}
              >
                {popup.buttonText}
              </Button>
            </Link>

            {/* Small dismiss text */}
            <button
              onClick={handleClose}
              className="mt-4 text-xs underline opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: popup.textColor }}
            >
              No thanks, I'll continue browsing
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}