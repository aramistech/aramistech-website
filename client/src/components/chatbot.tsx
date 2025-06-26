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
    
    // Technical Support Questions
    'slow computer': "Slow computers can be caused by:\n• Too many startup programs\n• Insufficient RAM or storage\n• Malware infections\n• Outdated hardware\n• Registry issues\n\nOur technicians can diagnose and fix these issues quickly. Call us at (305) 814-4461 for a free assessment!",
    'computer slow': "Slow computers can be caused by:\n• Too many startup programs\n• Insufficient RAM or storage\n• Malware infections\n• Outdated hardware\n• Registry issues\n\nOur technicians can diagnose and fix these issues quickly. Call us at (305) 814-4461 for a free assessment!",
    'internet slow': "Slow internet could be due to:\n• Network congestion\n• Outdated router/modem\n• Poor Wi-Fi placement\n• ISP throttling\n• Malware\n\nWe can optimize your network for maximum speed. Call us at (305) 814-4461 for a network evaluation!",
    'wifi problems': "Wi-Fi issues often stem from:\n• Router placement\n• Interference from other devices\n• Outdated equipment\n• Network configuration\n• Security settings\n\nOur network experts can solve these problems. Call us at (305) 814-4461 for professional Wi-Fi optimization!",
    'virus': "If you suspect malware:\n1. Don't enter passwords/personal info\n2. Disconnect from internet\n3. Run antivirus scan\n4. Contact us immediately\n\nWe provide emergency malware removal and prevention. Call us at (305) 814-4461 for immediate assistance!",
    'malware': "If you suspect malware:\n1. Don't enter passwords/personal info\n2. Disconnect from internet\n3. Run antivirus scan\n4. Contact us immediately\n\nWe provide emergency malware removal and prevention. Call us at (305) 814-4461 for immediate assistance!",
    'email problems': "Email issues can include:\n• Can't send/receive emails\n• Spam filtering problems\n• Account security concerns\n• Setup on new devices\n• Outlook configuration\n\nWe handle all email platforms. Call us at (305) 814-4461 for email support!",
    'printer': "Printer problems we solve:\n• Won't print or prints blank pages\n• Paper jams and feed issues\n• Network printer setup\n• Driver installation\n• Print quality issues\n\nOur technicians can fix it remotely or on-site. Call us at (305) 814-4461!",
    'backup failed': "Backup failures are serious! Common causes:\n• Storage space issues\n• Network interruptions\n• Corrupted files\n• Software conflicts\n\nDon't risk losing data - call us at (305) 814-4461 immediately for backup repair and data protection!",
    'data recovery': "Lost important files? We can help with:\n• Hard drive recovery\n• Deleted file restoration\n• Corrupted document repair\n• RAID recovery\n• SSD/flash drive recovery\n\nTime is critical for data recovery. Call us at (305) 814-4461 now!",
    'server down': "Server issues need immediate attention:\n• Check power and connections\n• Verify network connectivity\n• Look for error messages\n• Don't restart repeatedly\n\nFor business-critical servers, call us at (305) 814-4461 for emergency support!",
    'password reset': "Password issues we help with:\n• Windows login problems\n• Email account recovery\n• Network password resets\n• Two-factor authentication\n• Security policy setup\n\nCall us at (305) 814-4461 for secure password assistance!",
    'software install': "Software installation problems:\n• Compatibility issues\n• License management\n• Driver conflicts\n• Business software setup\n• Updates and patches\n\nWe ensure proper software deployment. Call us at (305) 814-4461 for professional installation!",
    'remote work': "Remote work IT support:\n• VPN setup and troubleshooting\n• Remote desktop configuration\n• Home office security\n• Cloud access issues\n• Video conferencing setup\n\nWe specialize in remote work solutions. Call us at (305) 814-4461 to optimize your home office!",
    
    // Business IT Challenges
    'office 365': "Office 365/Microsoft 365 issues we resolve:\n• Email migration and setup\n• SharePoint configuration\n• Teams optimization\n• License management\n• Security compliance\n\nMaximize your Office 365 investment. Call us at (305) 814-4461 for expert configuration!",
    'teams': "Microsoft Teams problems:\n• Audio/video quality issues\n• Screen sharing problems\n• Meeting room setup\n• Integration with phone systems\n• User training needs\n\nWe optimize Teams for seamless collaboration. Call us at (305) 814-4461!",
    'zoom': "Video conferencing issues:\n• Poor audio/video quality\n• Connection problems\n• Screen sharing difficulties\n• Recording setup\n• Security settings\n\nWe ensure professional video meetings. Call us at (305) 814-4461 for setup assistance!",
    'quickbooks': "QuickBooks IT support:\n• Multi-user setup\n• Database corruption\n• Network sharing issues\n• Backup and security\n• Integration problems\n\nProtect your financial data with proper IT setup. Call us at (305) 814-4461!",
    'server': "Server problems we solve:\n• Performance issues\n• Storage management\n• User access problems\n• Backup failures\n• Security concerns\n\nBusiness servers need expert care. Call us at (305) 814-4461 for server support!",
    'firewall': "Firewall and security issues:\n• Blocked legitimate traffic\n• Configuration problems\n• VPN access issues\n• Intrusion attempts\n• Policy management\n\nSecure your business properly. Call us at (305) 814-4461 for cybersecurity expertise!",
    
    // Hardware Issues
    'computer won\'t start': "Computer won't boot? Common causes:\n• Power supply failure\n• RAM issues\n• Hard drive problems\n• Motherboard failure\n• Loose connections\n\nDon't lose your data - call us at (305) 814-4461 for immediate diagnosis!",
    'blue screen': "Blue Screen of Death (BSOD) indicates:\n• Hardware failure\n• Driver conflicts\n• Memory problems\n• System corruption\n• Overheating\n\nThis needs professional diagnosis. Call us at (305) 814-4461 to prevent data loss!",
    'overheating': "Computer overheating can cause:\n• Sudden shutdowns\n• Performance drops\n• Hardware damage\n• Data corruption\n\nPrevent costly damage - call us at (305) 814-4461 for cooling system repair!",
    'hard drive': "Hard drive issues are critical:\n• Strange noises (clicking/grinding)\n• Slow file access\n• Frequent crashes\n• Error messages\n• Boot failures\n\nBack up data immediately! Call us at (305) 814-4461 for emergency data recovery!",
    
    // Cyber Security Concerns
    'hacked': "If you think you've been hacked:\n1. Disconnect from internet immediately\n2. Don't use any passwords\n3. Scan for malware\n4. Check financial accounts\n5. Call us NOW\n\nCyber attacks need immediate response. Call us at (305) 814-4461 for emergency security assistance!",
    'ransomware': "Ransomware attack response:\n1. DO NOT pay the ransom\n2. Disconnect affected systems\n3. Preserve evidence\n4. Contact authorities\n5. Call cybersecurity experts\n\nWe help businesses recover from ransomware. Call us at (305) 814-4461 immediately!",
    'phishing': "Phishing protection tips:\n• Verify sender identity\n• Don't click suspicious links\n• Check URLs carefully\n• Use two-factor authentication\n• Train your employees\n\nWe provide comprehensive phishing protection. Call us at (305) 814-4461 for security training!",
    'spam': "Email spam and security:\n• Advanced spam filtering\n• Email security policies\n• User education\n• Quarantine management\n• Compliance requirements\n\nProtect your business email. Call us at (305) 814-4461 for email security solutions!",
    
    // Contact & Business Info
    'contact': "You can reach us at:\n📞 (305) 814-4461\n📧 sales@aramistech.com\n📍 Serving Miami & Broward\n⏰ Mon-Fri: 9am-6pm\n\nWould you like to schedule a free consultation?",
    'phone': "Call us at (305) 814-4461 for immediate assistance. We're available Monday through Friday, 9am to 6pm.",
    'email': "Email us at sales@aramistech.com and we'll respond within 24 hours.",
    'hours': "We're open Monday through Friday, 9am to 6pm. For urgent issues, we offer 24/7 emergency support for our managed clients.",
    'location': "We proudly serve businesses throughout Miami and Broward counties with on-site and remote IT support.",
    
    // Pricing & Consultation
    'price': "Our pricing varies based on your specific needs. We offer free consultations to assess your requirements and provide a custom quote. Would you like to schedule one?",
    'cost': "Costs depend on the services you need. Let's schedule a free consultation to discuss your requirements and provide accurate pricing.",
    'consultation': "Great! We offer free IT consultations where we assess your current setup and recommend solutions. You can schedule one by calling us at (305) 814-4461 or filling out our contact form.",
    'quote': "I'd be happy to help you get a quote! Please call us at (305) 814-4461 or use our quick quote form on the homepage for a personalized estimate.",
    
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
    'urgent': "For urgent IT issues, please call us at (305) 814-4461 right away. We prioritize emergency situations and can provide immediate assistance.",
    'down': "If your systems are down, call us at (305) 814-4461 immediately. We understand how critical uptime is for your business.",
    
    // Additional Technical Issues
    'vpn': "VPN connection problems:\n• Can't connect to company network\n• Slow VPN performance\n• Authentication failures\n• Split tunneling issues\n• Mobile device setup\n\nWe configure secure, fast VPN solutions. Call us at (305) 814-4461 for VPN support!",
    'outlook': "Outlook email issues:\n• Won't send/receive emails\n• PST file corruption\n• Calendar sync problems\n• Profile configuration\n• Add-in conflicts\n\nWe're Outlook experts. Call us at (305) 814-4461 for email troubleshooting!",
    'excel': "Excel and Office problems:\n• File corruption\n• Performance issues\n• Macro errors\n• Sharing and collaboration\n• Version compatibility\n\nMaximize your Office productivity. Call us at (305) 814-4461 for software optimization!",
    'dropbox': "Cloud storage issues:\n• Sync problems\n• File conflicts\n• Access permissions\n• Storage management\n• Security concerns\n\nWe optimize cloud workflows. Call us at (305) 814-4461 for cloud solution support!",
    'onedrive': "OneDrive sync issues:\n• Files not syncing\n• Duplicate files\n• Storage quota problems\n• Sharing permissions\n• Offline access\n\nWe ensure seamless cloud integration. Call us at (305) 814-4461!",
    'website down': "Website or online service issues:\n• DNS problems\n• Hosting issues\n• SSL certificate errors\n• Database connections\n• Performance optimization\n\nWe support business web services. Call us at (305) 814-4461 for web assistance!",
    
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
    
    // Enhanced technical keyword detection with specific responses
    const hardwareKeywords = ['computer', 'laptop', 'desktop', 'pc', 'hardware', 'motherboard', 'ram', 'memory', 'cpu', 'processor', 'blue', 'bsod', 'boot', 'startup', 'power'];
    const networkKeywords = ['internet', 'wifi', 'wi-fi', 'network', 'connection', 'router', 'modem', 'ethernet', 'vpn'];
    const softwareKeywords = ['windows', 'microsoft', 'office', 'word', 'excel', 'powerpoint', 'software', 'program', 'application', 'app', 'install', 'update'];
    const emailKeywords = ['email', 'outlook', 'gmail', 'mail', 'exchange', 'send', 'receive'];
    const securityKeywords = ['security', 'antivirus', 'firewall', 'malware', 'virus', 'hack', 'hacked', 'password', 'login', 'ransomware', 'phishing', 'spam'];
    const generalTechKeywords = ['error', 'problem', 'issue', 'not working', 'broken', 'crash', 'freeze', 'stuck', 'fail', 'down', 'slow', 'help', 'fix', 'repair', 'trouble', 'support'];
    
    // Check for hardware issues
    if (hardwareKeywords.some(keyword => message.includes(keyword))) {
      return "Hardware issues can be tricky to diagnose! Common problems include:\n• Blue Screen of Death (BSOD)\n• Computer won't start or boot\n• Random crashes and freezes\n• Memory (RAM) problems\n• Hard drive failures\n• Overheating components\n• Power supply issues\n\nThese problems need professional diagnosis to prevent data loss. Call us at (305) 814-4461 for immediate hardware troubleshooting and repair!";
    }
    
    // Check for network issues
    if (networkKeywords.some(keyword => message.includes(keyword))) {
      return "Network connectivity problems are frustrating and hurt productivity! Common issues we fix:\n• Slow or intermittent internet\n• Wi-Fi dead zones and weak signals\n• Router/modem configuration problems\n• VPN connection failures\n• Network security vulnerabilities\n• Can't connect devices to network\n\nNetwork problems can have many causes. Our technicians quickly diagnose and optimize your connectivity. Call us at (305) 814-4461 for professional network troubleshooting!";
    }
    
    // Check for software issues
    if (softwareKeywords.some(keyword => message.includes(keyword))) {
      return "Software problems can really slow down your work! Issues we commonly resolve:\n• Programs crash or won't start\n• Software installation failures\n• Compatibility problems between programs\n• License and activation issues\n• Slow performance and freezing\n• Update and patch failures\n\nSoftware conflicts can be complex to diagnose. We handle all types of software troubleshooting and optimization. Call us at (305) 814-4461 for expert software support!";
    }
    
    // Check for email issues
    if (emailKeywords.some(keyword => message.includes(keyword))) {
      return "Email problems can seriously hurt your business communication! Issues we fix daily:\n• Can't send or receive emails\n• Outlook configuration and setup\n• Email account synchronization\n• Mobile device email problems\n• Spam filtering and security\n• Email server connection errors\n\nEmail issues can cost you business opportunities. We're email experts and resolve these problems quickly. Call us at (305) 814-4461 for immediate email support!";
    }
    
    // Check for security concerns
    if (securityKeywords.some(keyword => message.includes(keyword))) {
      return "Cybersecurity threats are real and growing! Security issues we handle:\n• Virus and malware infections\n• Suspicious computer behavior\n• Password security and breaches\n• Firewall configuration\n• Ransomware protection\n• Employee security training\n• Data backup and recovery\n\nDon't wait until it's too late - cybersecurity requires immediate professional attention. Call us at (305) 814-4461 for comprehensive security solutions!";
    }
    
    // Check for general technical problems
    if (generalTechKeywords.some(keyword => message.includes(keyword))) {
      return "Technical issues can be frustrating and complex! Common problems we solve:\n• System crashes and error messages\n• Slow computer performance\n• Programs freezing or not responding\n• Startup and boot problems\n• Random computer behavior\n• Data access issues\n• System optimization needs\n\nTechnical problems often have multiple causes. With 27+ years of experience, we quickly diagnose the root cause and fix it properly. Call us at (305) 814-4461 and describe your specific issue - we'll get you back up and running fast!";
    }
    
    // Fallback response for general inquiries
    return "I'd be happy to help! For specific questions about our IT services, pricing, or to schedule a consultation, please call us at (305) 814-4461 or email us at sales@aramistech.com. Our team can provide detailed answers tailored to your needs.";
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