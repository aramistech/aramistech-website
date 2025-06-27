import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, User, Bot, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: number;
  sender: string;
  senderName: string;
  message: string;
  messageType: string;
  createdAt: string;
}

interface ChatSession {
  id: number;
  sessionId: string;
  isHumanTransfer: boolean;
  status: string;
}

interface LiveChatProps {
  className?: string;
}

export default function LiveChat({ className = "" }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [showContactForm, setShowContactForm] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connectWebSocket = () => {
    if (!session) return;

    setConnectionStatus('connecting');
    
    // In development mode, simulate connection since WebSocket is disabled
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating WebSocket connection');
      setIsConnected(true);
      setConnectionStatus('connected');
      return;
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host}:8080`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Join the chat session
      ws.current?.send(JSON.stringify({
        type: 'join_session',
        sessionId: session.sessionId,
        userType: 'customer'
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message':
        case 'message_sent':
          setMessages(prev => [...prev, data.message]);
          setIsTyping(false);
          break;
        case 'chat_transferred':
          setMessages(prev => [...prev, data.message]);
          // Update session status
          setSession(prev => prev ? { ...prev, isHumanTransfer: true, status: 'transferred' } : null);
          break;
        case 'agent_typing':
          setIsTyping(true);
          break;
        case 'agent_stopped_typing':
          setIsTyping(false);
          break;
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        if (session && isOpen) {
          connectWebSocket();
        }
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };
  };

  const startChat = async () => {
    if (!customerInfo.name.trim()) {
      alert('Please enter your name to start the chat.');
      return;
    }

    try {
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerInfo),
      });

      const data = await response.json();
      if (data.success) {
        setSession(data.session);
        setShowContactForm(false);
        
        // Load existing messages
        const messagesResponse = await fetch(`/api/chat/session/${data.session.sessionId}/messages`);
        const messagesData = await messagesResponse.json();
        if (messagesData.success) {
          setMessages(messagesData.messages);
        }
        
        // Connect WebSocket
        connectWebSocket();
        
        // Send initial bot message
        setTimeout(() => {
          const welcomeMessage = `Hi ${customerInfo.name}! I'm the AramisTech Assistant. I'm here to help you with any IT questions or concerns. How can I assist you today?`;
          sendBotMessage(welcomeMessage);
        }, 1000);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  const sendBotMessage = async (userMessage: string) => {
    if (!session) return;

    try {
      // Use existing chatbot logic from the current system
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      let botResponseText = "I'm having trouble processing your request right now. Would you like to speak with one of our technicians? You can call us at (305) 814-4461 or email info@aramistech.com for immediate assistance.";
      
      if (response.ok && data.response) {
        botResponseText = data.response;
      }

      // Add bot message to UI
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        senderName: 'AramisTech Assistant',
        message: botResponseText,
        messageType: 'text',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // In production with WebSocket, also send via WebSocket
      if (process.env.NODE_ENV !== 'development' && ws.current) {
        ws.current.send(JSON.stringify({
          type: 'bot_response',
          sessionId: session.sessionId,
          message: botResponseText
        }));
      }
    } catch (error) {
      console.error('Error getting bot response:', error);
      
      // Fallback message
      const fallbackMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        senderName: 'AramisTech Assistant',
        message: "I'm having trouble processing your request right now. Would you like to speak with one of our technicians? You can call us at (305) 814-4461 or email info@aramistech.com for immediate assistance.",
        messageType: 'text',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !session) return;

    const messageText = inputMessage.trim();
    setInputMessage("");

    // Add customer message to UI immediately
    const customerMessage = {
      id: Date.now(),
      sender: 'customer',
      senderName: customerInfo.name,
      message: messageText,
      messageType: 'text',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, customerMessage]);

    // In development mode, use direct API calls instead of WebSocket
    if (process.env.NODE_ENV === 'development' || !ws.current || !isConnected) {
      // If not yet transferred to human, get AI response
      if (!session.isHumanTransfer) {
        setIsTyping(true);
        setTimeout(() => {
          sendBotMessage(messageText);
        }, 1500); // Slight delay to simulate thinking
      }
    } else {
      // Send via WebSocket in production
      ws.current.send(JSON.stringify({
        type: 'send_message',
        sessionId: session.sessionId,
        sender: 'customer',
        senderName: customerInfo.name,
        message: messageText
      }));

      // If not yet transferred to human, get AI response
      if (!session.isHumanTransfer) {
        setIsTyping(true);
        setTimeout(() => {
          sendBotMessage(messageText);
        }, 1500); // Slight delay to simulate thinking
      }
    }
  };

  const requestHumanAgent = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/chat/session/${session.sessionId}/transfer`, {
        method: 'POST',
      });

      if (response.ok) {
        ws.current?.send(JSON.stringify({
          type: 'transfer_to_human',
          sessionId: session.sessionId
        }));
      }
    } catch (error) {
      console.error('Error requesting human agent:', error);
    }
  };

  const getMessageIcon = (sender: string) => {
    switch (sender) {
      case 'bot':
        return <Bot className="w-4 h-4" />;
      case 'admin':
        return <Headphones className="w-4 h-4" />;
      case 'system':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg transition-all duration-300 hover:animate-none hover:shadow-[0_0_20px_rgba(249,115,22,0.6)]"
          style={{ 
            animation: 'slowPulse 8s ease-in-out infinite',
          }}
          size="lg"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <Card className={cn(
        "w-80 h-96 shadow-xl transition-all duration-300",
        isMinimized && "h-14"
      )}>
        <CardHeader className="p-3 bg-orange-500 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle className="text-sm font-medium">
                {session?.isHumanTransfer ? 'Chat with AramisTech' : 'AramisTech Assistant'}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {connectionStatus === 'connected' && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  Online
                </Badge>
              )}
              {connectionStatus === 'connecting' && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  Connecting...
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-orange-600 h-6 w-6 p-0"
              >
                {isMinimized ? "+" : "−"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-orange-600 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {showContactForm ? (
              <div className="p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Start a conversation</h3>
                <div className="space-y-2">
                  <Input
                    placeholder="Your name *"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Phone number"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={startChat}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={!customerInfo.name.trim()}
                >
                  Start Chat
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  We're here to help with all your IT needs
                </p>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2",
                          msg.sender === 'customer' ? "justify-end" : "justify-start"
                        )}
                      >
                        {msg.sender !== 'customer' && (
                          <div className="flex-shrink-0 mt-1">
                            {getMessageIcon(msg.sender)}
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                            msg.sender === 'customer'
                              ? "bg-orange-500 text-white"
                              : msg.sender === 'system'
                              ? "bg-gray-100 text-gray-700 border"
                              : "bg-gray-100 text-gray-900"
                          )}
                        >
                          {msg.sender !== 'customer' && msg.sender !== 'system' && (
                            <div className="text-xs font-medium mb-1 text-gray-600">
                              {msg.senderName}
                            </div>
                          )}
                          <div>{msg.message}</div>
                          <div className={cn(
                            "text-xs mt-1 opacity-70",
                            msg.sender === 'customer' ? "text-orange-100" : "text-gray-500"
                          )}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                        {msg.sender === 'customer' && (
                          <div className="flex-shrink-0 mt-1">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-2 justify-start">
                        <div className="flex-shrink-0 mt-1">
                          {session?.isHumanTransfer ? <Headphones className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="p-3 border-t">
                  {!session?.isHumanTransfer && (
                    <div className="mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={requestHumanAgent}
                        className="text-xs"
                      >
                        <Headphones className="w-3 h-3 mr-1" />
                        Speak with a technician
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder={session?.isHumanTransfer ? "Message our team..." : "Ask me anything..."}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={false}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim()}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-center mt-2">
                    <p className="text-xs text-gray-500">
                      Call us today: (305) 814-4461
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}