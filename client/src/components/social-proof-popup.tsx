import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin } from 'lucide-react';

const SocialProofPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  // Array of social proof messages
  const messages = [
    "A new visitor just booked an appointment",
    "Someone from Miami just requested a quote",
    "A business owner just scheduled a consultation",
    "New client from Broward County booked service",
    "Someone just requested emergency IT support",
    "A visitor from Doral just contacted us"
  ];

  // Array of locations for variety
  const locations = [
    "Miami, FL",
    "Broward County, FL", 
    "Doral, FL",
    "South Florida",
    "Fort Lauderdale, FL",
    "Hialeah, FL"
  ];

  useEffect(() => {
    const showPopup = () => {
      // Select random message and location
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      
      // Customize message with location if it doesn't already include one
      const finalMessage = randomMessage.includes('from') 
        ? randomMessage 
        : `${randomMessage} from ${randomLocation}`;
      
      setCurrentMessage(finalMessage);
      setIsVisible(true);

      // Hide popup after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Show popup at random intervals between 15-45 seconds
    const scheduleNextPopup = () => {
      const randomDelay = Math.random() * (45000 - 15000) + 15000; // 15-45 seconds
      setTimeout(() => {
        showPopup();
        scheduleNextPopup(); // Schedule the next one
      }, randomDelay);
    };

    // Initial delay before first popup (5-10 seconds after page load)
    const initialDelay = Math.random() * 5000 + 5000;
    setTimeout(() => {
      showPopup();
      scheduleNextPopup();
    }, initialDelay);

  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-1">
              🎉 New Booking Alert!
            </p>
            <p className="text-sm text-gray-600">
              {currentMessage}
            </p>
            <p className="text-xs text-gray-400 mt-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              Just now
            </p>
          </div>
        </div>

        {/* Pulse indicator */}
        <div className="absolute -top-1 -left-1">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofPopup;