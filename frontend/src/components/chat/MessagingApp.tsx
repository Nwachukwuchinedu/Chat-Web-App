import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { UserSearchModal } from "./UserSearchModal";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, Conversation, User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function MessagingApp() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const fetchedConversations = await apiClient.getConversations();
        setConversations(fetchedConversations);

        // Set the first conversation as active if none is selected
        if (fetchedConversations.length > 0 && !activeChat) {
          setActiveChat(fetchedConversations[0].id.toString());
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [activeChat, toast]);

  const handleStartConversation = async (selectedUser: User) => {
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv =>
        conv.participants.length === 2 &&
        conv.participants.some(p => p.id === selectedUser.id)
      );

      if (existingConversation) {
        setActiveChat(existingConversation.id.toString());
        toast({
          title: "Conversation found",
          description: "Opening existing conversation",
        });
        return;
      }

      // Create new conversation
      const newConversation = await apiClient.createConversation({
        participant_ids: [selectedUser.id],
      });

      setConversations(prev => [newConversation, ...prev]);
      setActiveChat(newConversation.id.toString());
      toast({
        title: "Success",
        description: `Started conversation with ${selectedUser.display_name || selectedUser.username}`,
      });
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <div className="w-80 shrink-0 border-r">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Chat App</h2>
            <p className="text-sm text-muted-foreground">
              {user?.display_name || user?.username}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
        <ChatSidebar
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          conversations={conversations}
          isLoading={isLoading}
          onCreateConversation={() => setIsUserSearchOpen(true)}
        />
      </div>
      <ChatWindow
        activeChat={activeChat}
        conversation={conversations.find(c => c.id.toString() === activeChat)}
      />

      <UserSearchModal
        isOpen={isUserSearchOpen}
        onClose={() => setIsUserSearchOpen(false)}
        onStartConversation={handleStartConversation}
      />
    </div>
  );
}