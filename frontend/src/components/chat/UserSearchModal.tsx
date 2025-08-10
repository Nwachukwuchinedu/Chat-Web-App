import { useState, useEffect } from "react";
import { Search, X, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiClient, User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UserSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartConversation: (user: User) => void;
}

export function UserSearchModal({ isOpen, onClose, onStartConversation }: UserSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setUsers([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                setIsLoading(true);
                const searchResults = await apiClient.searchUsers(searchQuery);
                setUsers(searchResults);
            } catch (error) {
                console.error('Failed to search users:', error);
                toast({
                    title: "Error",
                    description: "Failed to search users",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, toast]);

    const handleUserSelect = (user: User) => {
        onStartConversation(user);
        onClose();
        setSearchQuery("");
        setUsers([]);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Start a new conversation</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Search Results */}
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {isLoading ? (
                            <div className="text-center text-muted-foreground py-4">
                                Searching...
                            </div>
                        ) : searchQuery.trim() && users.length === 0 ? (
                            <div className="text-center text-muted-foreground py-4">
                                No users found
                            </div>
                        ) : (
                            users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                                {(user.display_name || user.username).split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {user.display_name || user.username}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                @{user.username}
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <MessageCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 