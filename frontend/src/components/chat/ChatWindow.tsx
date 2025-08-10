import { useState, useRef, useEffect } from "react";
import { Send, MoreVertical, Phone, Video, Paperclip, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiClient, Message as ApiMessage, Conversation } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { chatWebSocket, WebSocketMessage } from "@/lib/websocket";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  avatar?: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatWindowProps {
  activeChat: string | null;
  conversation?: Conversation;
}

// Helper function to convert API message to UI message
const convertApiMessageToMessage = (apiMessage: ApiMessage, currentUserId: number): Message => ({
  id: apiMessage.id.toString(),
  content: apiMessage.content,
  timestamp: new Date(apiMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  isOwn: apiMessage.sender.id === currentUserId,
});

export function ChatWindow({ activeChat, conversation }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // WebSocket connection and message handling
  useEffect(() => {
    if (!activeChat || !user) {
      chatWebSocket.disconnect();
      return;
    }

    // Connect to WebSocket
    chatWebSocket.connect(activeChat)
      .then(() => {
        console.log('Connected to WebSocket for conversation:', activeChat);
      })
      .catch((error) => {
        console.error('Failed to connect to WebSocket:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to real-time chat",
          variant: "destructive",
        });
      });

    // Set up message handlers
    chatWebSocket.onMessage((data: WebSocketMessage) => {
      if (data.type === 'message') {
        const newMessage: Message = {
          id: data.message_id?.toString() || `temp-${Date.now()}`,
          content: data.message || '',
          timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: data.user_id === user?.id,
        };
        setMessages(prev => [...prev, newMessage]);
      } else if (data.type === 'typing') {
        if (data.typing) {
          setTypingUsers(prev => [...new Set([...prev, data.display_name || data.username || 'Unknown'])]);
        } else {
          setTypingUsers(prev => prev.filter(name => name !== (data.display_name || data.username || 'Unknown')));
        }
      } else if (data.type === 'user_join') {
        toast({
          title: "User Joined",
          description: `${data.display_name || data.username} joined the conversation`,
        });
      } else if (data.type === 'user_leave') {
        toast({
          title: "User Left",
          description: `${data.display_name || data.username} left the conversation`,
        });
      }
    });

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const apiMessages = await apiClient.getMessages(parseInt(activeChat));
        const convertedMessages = apiMessages.map(msg => convertApiMessageToMessage(msg, user.id));
        setMessages(convertedMessages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Cleanup on unmount or conversation change
    return () => {
      chatWebSocket.disconnect();
      setTypingUsers([]);
    };
  }, [activeChat, user, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat || !user) return;

    const messageContent = message.trim();
    setMessage("");

    // Stop typing indicator
    setIsTyping(false);
    chatWebSocket.sendTyping(false);

    // Try WebSocket first, fallback to HTTP API
    if (chatWebSocket.isConnected()) {
      chatWebSocket.sendMessage(messageContent);
    } else {
      // Fallback to HTTP API
      try {
        const apiMessage = await apiClient.sendMessage(parseInt(activeChat), messageContent);
        const newMessage: Message = {
          id: apiMessage.id.toString(),
          content: apiMessage.content,
          timestamp: new Date(apiMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: true,
        };
        setMessages(prev => [...prev, newMessage]);
      } catch (error) {
        console.error('Failed to send message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        // Restore message to input on error
        setMessage(messageContent);
      }
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      chatWebSocket.sendTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      chatWebSocket.sendTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="bg-gradient-primary bg-clip-text text-transparent text-6xl mb-4">
            💬
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Welcome to Chat App
          </h3>
          <p className="text-muted-foreground">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {conversation.title.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-foreground">{conversation.display_title || conversation.title}</h3>
            <p className="text-sm text-muted-foreground">
              {conversation.participants.length === 2 ? 'Direct message' : `${conversation.participants.length} participants`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
            <Video className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="text-muted-foreground">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center">
            <div className="text-muted-foreground">No messages yet. Start the conversation!</div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.isOwn ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm",
                    msg.isOwn
                      ? "bg-chat-sent text-chat-sent-foreground ml-12"
                      : "bg-chat-received text-chat-received-foreground mr-12"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">{msg.timestamp}</span>
                    {msg.isOwn && (
                      <span className="text-xs opacity-70 ml-2">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-2 rounded-2xl text-sm">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" className="h-9 w-9 p-0 shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              className="pr-10 bg-muted border-0 focus-visible:ring-1"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
            className="h-9 w-9 p-0 bg-gradient-primary hover:opacity-90 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}