import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send, User, Bot, Headphones, Clock, Phone, Mail, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

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
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  isHumanTransfer: boolean;
  transferredAt: string;
  lastMessageAt: string;
  adminUserId?: number;
}

interface AdminChatSettings {
  isOnline: boolean;
  awayMessage: string;
  notificationsEnabled: boolean;
  autoResponseEnabled: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  weekendAvailable: boolean;
}

export default function AdminLiveChat() {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch active chat sessions
  const { data: sessionsData } = useQuery({
    queryKey: ["/api/admin/chat/sessions"],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Fetch admin chat settings
  const { data: settingsData } = useQuery({
    queryKey: ["/api/admin/chat/settings"],
  });

  // Update chat settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Partial<AdminChatSettings>) =>
      apiRequest("PUT", "/api/admin/chat/settings", settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chat/settings"] });
    },
  });

  // Assign session mutation
  const assignSessionMutation = useMutation({
    mutationFn: (sessionId: number) =>
      apiRequest("PUT", `/api/admin/chat/session/${sessionId}/assign`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chat/sessions"] });
    },
  });

  const sessions: ChatSession[] = (sessionsData as any)?.sessions || [];
  const settings: AdminChatSettings = (settingsData as any)?.settings || {
    isOnline: false,
    awayMessage: "",
    notificationsEnabled: true,
    autoResponseEnabled: true,
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    weekendAvailable: false,
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Set admin online status when component mounts
    if (settings.isOnline !== true) {
      updateSettingsMutation.mutate({ isOnline: true });
    }
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('Admin WebSocket connected');
      setIsConnected(true);
      
      // Join as admin
      ws.current?.send(JSON.stringify({
        type: 'admin_online',
        userType: 'admin',
        userId: 4 // Assuming admin user ID, should come from auth context
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message':
        case 'message_sent':
          if (selectedSession && data.message.sessionId === selectedSession.id) {
            setMessages(prev => [...prev, data.message]);
          }
          // Update unread count if not current session
          if (!selectedSession || data.message.sessionId !== selectedSession.id) {
            setUnreadCounts(prev => ({
              ...prev,
              [data.message.sessionId]: (prev[data.message.sessionId] || 0) + 1
            }));
          }
          break;
        case 'new_transfer':
          // New chat transfer notification
          queryClient.invalidateQueries({ queryKey: ["/api/admin/chat/sessions"] });
          if (settings.notificationsEnabled) {
            new Notification('New Chat Transfer', {
              body: `Customer ${data.session.customerName} has requested human assistance`,
              icon: '/favicon.ico'
            });
          }
          break;
      }
    };

    ws.current.onclose = () => {
      console.log('Admin WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('Admin WebSocket error:', error);
    };
  };

  const selectSession = async (session: ChatSession) => {
    setSelectedSession(session);
    setUnreadCounts(prev => ({ ...prev, [session.id]: 0 }));
    
    // Load messages for this session
    try {
      const response = await fetch(`/api/chat/session/${session.sessionId}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }

    // Join this session for real-time updates
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify({
        type: 'join_session',
        sessionId: session.sessionId,
        userType: 'admin',
        userId: 4
      }));
    }
  };

  const assignSession = (session: ChatSession) => {
    assignSessionMutation.mutate(session.id);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedSession || !ws.current || !isConnected) return;

    const messageText = inputMessage.trim();
    setInputMessage("");

    // Send admin message
    ws.current.send(JSON.stringify({
      type: 'send_message',
      sessionId: selectedSession.sessionId,
      sender: 'admin',
      senderName: 'AramisTech Support',
      message: messageText
    }));
  };

  const toggleOnlineStatus = (online: boolean) => {
    updateSettingsMutation.mutate({ isOnline: online });
    
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify({
        type: online ? 'admin_online' : 'admin_offline',
        userId: 4
      }));
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Live Chat Management</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="online-status">Online</Label>
            <Switch
              id="online-status"
              checked={settings.isOnline}
              onCheckedChange={toggleOnlineStatus}
            />
          </div>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Chats ({sessions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-1 p-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => selectSession(session)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedSession?.id === session.id
                        ? "bg-orange-50 border-orange-200"
                        : "bg-white hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">
                            {session.customerName}
                          </h4>
                          {session.isHumanTransfer && (
                            <Badge variant="secondary" className="text-xs">
                              Human
                            </Badge>
                          )}
                          {unreadCounts[session.id] > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {unreadCounts[session.id]}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(session.lastMessageAt)}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          {session.customerEmail && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{session.customerEmail}</span>
                            </div>
                          )}
                          {session.customerPhone && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span>{session.customerPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {!session.adminUserId && session.isHumanTransfer && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          assignSession(session);
                        }}
                        className="w-full mt-2 bg-orange-500 hover:bg-orange-600"
                      >
                        Accept Chat
                      </Button>
                    )}
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active chats</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          {selectedSession ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      Chat with {selectedSession.customerName}
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedSession.isHumanTransfer ? 'Human Support' : 'AI Assistant'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSession.customerEmail && (
                      <a
                        href={`mailto:${selectedSession.customerEmail}`}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {selectedSession.customerPhone && (
                      <a
                        href={`tel:${selectedSession.customerPhone}`}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-80">
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2",
                          msg.sender === 'admin' ? "justify-end" : "justify-start"
                        )}
                      >
                        {msg.sender !== 'admin' && (
                          <div className="flex-shrink-0 mt-1">
                            {getMessageIcon(msg.sender)}
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                            msg.sender === 'admin'
                              ? "bg-orange-500 text-white"
                              : msg.sender === 'system'
                              ? "bg-gray-100 text-gray-700 border"
                              : "bg-gray-100 text-gray-900"
                          )}
                        >
                          {msg.sender !== 'admin' && msg.sender !== 'system' && (
                            <div className="text-xs font-medium mb-1 text-gray-600">
                              {msg.senderName}
                            </div>
                          )}
                          <div>{msg.message}</div>
                          <div className={cn(
                            "text-xs mt-1 opacity-70",
                            msg.sender === 'admin' ? "text-orange-100" : "text-gray-500"
                          )}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                        {msg.sender === 'admin' && (
                          <div className="flex-shrink-0 mt-1">
                            <Headphones className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your response..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={!isConnected}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || !isConnected}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-80">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">Select a chat to get started</h3>
                <p className="text-sm">Choose a conversation from the list to begin responding to customers</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}