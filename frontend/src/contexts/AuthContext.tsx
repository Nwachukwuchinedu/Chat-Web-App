import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, apiClient, setAuthToken, clearAuthToken, getAccessToken } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, email?: string, displayName?: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = getAccessToken();
            if (token) {
                try {
                    const currentUser = await apiClient.getCurrentUser();
                    setUser(currentUser);
                } catch (error) {
                    console.error('Failed to get current user:', error);
                    clearAuthToken();
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await apiClient.login({ username, password });
            setAuthToken(response.access);

            const currentUser = await apiClient.getCurrentUser();
            setUser(currentUser);

            toast({
                title: "Success",
                description: "Logged in successfully!",
            });

            // Redirect to chat app after successful login
            navigate('/');
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Login failed",
                variant: "destructive",
            });
            throw error;
        }
    };

    const register = async (username: string, password: string, email?: string, displayName?: string) => {
        try {
            await apiClient.register({ username, password, email, display_name: displayName });

            toast({
                title: "Success",
                description: "Account created successfully! Please log in.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Registration failed",
                variant: "destructive",
            });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiClient.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuthToken();
            setUser(null);
            toast({
                title: "Logged out",
                description: "You have been logged out successfully.",
            });
            // Redirect to auth page after logout
            navigate('/auth');
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 