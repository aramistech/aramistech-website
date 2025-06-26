import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
}

export default function Chatbot({ className = "" }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm AramisTech's virtual assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predefinedResponses: { [key: string]: string } = {
    // Greetings
    'hello': "Hello! Welcome to AramisTech. How can I assist you with your IT needs today?",
    'hi': "Hi there! I'm here to help with any questions about our IT services.",
    'hey': "Hey! Thanks for visiting AramisTech. What can I help you with?",
    
    // Services
    'services': "We offer comprehensive IT services including:\n• Network Setup & Management\n• Cybersecurity Solutions\n• Cloud Migration\n• Hardware Installation\n• 24/7 Support\n• Data Backup & Recovery\n\nWhich service interests you most?",
    'network': "Our network services include setup, configuration, and ongoing management of your business network infrastructure. We ensure secure, reliable connectivity for your team.",
    'security': "We provide comprehensive cybersecurity solutions including firewalls, antivirus, employee training, and security audits to protect your business from threats.",
    'cloud': "Our cloud migration services help you move to secure, scalable cloud solutions. We handle everything from planning to implementation and ongoing support.",
    'backup': "We offer automated data backup and disaster recovery solutions to ensure your business data is always protected and recoverable.",
    
    // Contact & Business Info
    'contact': "You can reach us at:\n📞 (305) 814-4461\n📧 sales@aramistech.com\n📍 Serving Miami & Broward\n⏰ Mon-Fri: 9am-6pm\n\nWould you like to schedule a free consultation?",
    'phone': "Call us at (305) 814-4461 for immediate assistance. We're available Monday through Friday, 9am to 6pm.",
    'email': "Email us at sales@aramistech.com and we'll respond within 24 hours.",
    'hours': "We're open Monday through Friday, 9am to 6pm. For urgent issues, we offer 24/7 emergency support for our managed clients.",
    'location': "We proudly serve businesses throughout Miami and Broward counties with on-site and remote IT support.",
    
    // Pricing & Consultation
    'price': "Our pricing varies based on your specific needs. We offer free consultations to assess your requirements and provide a custom quote. Would you like to schedule one?",
    'cost': "Costs depend on the services you need. Let's schedule a free consultation to discuss your requirements and provide accurate pricing.",
    'consultation': "Great! We offer free IT consultations where we assess your current setup and recommend solutions. You can schedule one by calling (305) 814-4461 or filling out our contact form.",
    'quote': "I'd be happy to help you get a quote! Please call (305) 814-4461 or use our quick quote form on the homepage for a personalized estimate.",
    
    // Windows 10 specific
    'windows': "Windows 10 support ends October 14, 2025. We offer comprehensive Windows 11 migration services to keep your business secure and compliant. Check out our Windows 10 upgrade page for more details!",
    'windows 10': "Windows 10 support ends October 14, 2025. We offer comprehensive Windows 11 migration services to keep your business secure and compliant. Check out our Windows 10 upgrade page for more details!",
    'upgrade': "We provide seamless Windows 11 upgrades with data migration, compatibility testing, and user training. Don't wait until the last minute - let's get you upgraded safely!",
    
    // About company
    'about': "AramisTech is a family-owned IT company with 27+ years of experience serving South Florida businesses. We specialize in providing reliable, professional IT solutions that help businesses grow.",
    'experience': "We have over 27 years of experience in the IT industry, serving businesses throughout South Florida with reliable, professional IT solutions.",
    'family': "Yes! AramisTech is a family-owned business that has been serving the South Florida community for over 27 years. We treat every client like family.",
    
    // Emergencies
    'emergency': "For IT emergencies, call us immediately at (305) 814-4461. Our managed clients have access to 24/7 emergency support.",
    'urgent': "For urgent IT issues, please call (305) 814-4461 right away. We prioritize emergency situations and can provide immediate assistance.",
    'down': "If your systems are down, call (305) 814-4461 immediately. We understand how critical uptime is for your business.",
    
    // Default responses
    'help': "I can help you with information about our IT services, pricing, contact details, and scheduling consultations. What would you like to know?",
    'thanks': "You're welcome! Is there anything else I can help you with today?"
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();
    
    // Check for exact matches first
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (message.includes(key)) {
        return response;
      }
    }
    
    // Fallback response
    return "I'd be happy to help! For specific questions about our IT services, pricing, or to schedule a consultation, please call us at (305) 814-4461 or email sales@aramistech.com. Our team can provide detailed answers tailored to your needs.";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-aramis-orange hover:bg-aramis-orange/90 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 h-96 flex flex-col">
        {/* Header */}
        <div className="bg-primary-blue text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm">AramisTech Assistant</h3>
              <p className="text-xs opacity-90">Online now</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/10 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-aramis-orange text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.isBot && (
                      <Bot className="h-4 w-4 mt-0.5 text-primary-blue" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-500' : 'text-white/70'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!message.isBot && (
                      <User className="h-4 w-4 mt-0.5 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-primary-blue" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 text-sm"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-aramis-orange hover:bg-aramis-orange/90 h-10 w-10 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            For detailed assistance, call (305) 814-4461
          </p>
        </div>
      </div>
    </div>
  );
}