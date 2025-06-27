import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

  // ChatGPT API integration
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chatbot", { message });
      const data = await response.json() as { response: string };
      return data.response;
    },
    onSuccess: (response) => {
      const botResponse: Message = {
        id: Date.now().toString(),
        text: response,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    },
    onError: (error) => {
      const errorResponse: Message = {
        id: Date.now().toString(),
        text: "I apologize, but I'm having technical difficulties. Please call us directly at (305) 814-4461 or email sales@aramistech.com for immediate assistance.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      setIsTyping(false);
    }
  });

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Send message to ChatGPT
    chatMutation.mutate(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {!isOpen && (
        <div className="relative group">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-aramis-orange hover:bg-orange-600 shadow-lg transition-all duration-300 hover:scale-110 animate-pulse relative z-10"
            style={{ animationDuration: '3s' }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
          {/* Outer glow on hover */}
          <div className="absolute inset-0 rounded-full bg-aramis-orange opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-xl scale-150 pointer-events-none"></div>
        </div>
      )}

      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-primary-blue text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">AramisTech Support</h3>
                <p className="text-xs text-blue-100">Online • Powered by AI</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-600 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {message.isBot && (
                    <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.isBot
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-primary-blue text-white'
                    }`}
                  >
                    <p className="text-sm">{formatMessage(message.text)}</p>
                    <p className={`text-xs mt-1 ${
                      message.isBot ? 'text-gray-500' : 'text-blue-100'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {!message.isBot && (
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={inputValue.trim() === "" || isTyping}
                className="bg-primary-blue hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by Google Gemini • (305) 814-4461
            </p>
          </div>
        </div>
      )}
    </div>
  );
}