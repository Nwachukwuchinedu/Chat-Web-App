import { useState } from "react";
import { MessageCircle, Search, MoreVertical, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Conversation } from "@/lib/api";

interface ChatSidebarProps {
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  conversations: Conversation[];
  isLoading: boolean;
  onCreateConversation: () => void;
}

export function ChatSidebar({
  activeChat,
  onChatSelect,
  conversations,
  isLoading,
  onCreateConversation
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Messages</h2>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={onCreateConversation}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations yet. Create one to get started!
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onChatSelect(conversation.id.toString())}
              className={cn(
                "flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50",
                activeChat === conversation.id.toString() && "bg-muted"
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {conversation.title.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 ml-3 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground truncate">
                    {conversation.display_title || conversation.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {conversation.participants.length === 2 ? 'Direct message' : `${conversation.participants.length} participants`}
                </p>
              </div>

              <div className="flex flex-col items-end ml-2">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 mt-1 opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}