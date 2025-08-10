import { config } from '@/config/env';

const API_BASE_URL = config.apiBaseUrl;

// Types
export interface User {
    id: number;
    username: string;
    email: string;
    display_name: string;
}

export interface Conversation {
    id: number;
    title: string;
    display_title?: string;
    participants: User[];
    created_at: string;
}

export interface Message {
    id: number;
    conversation: number;
    sender: User;
    content: string;
    created_at: string;
}

export interface AuthResponse {
    access: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email?: string;
    display_name?: string;
    password: string;
}

// API Client
class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        // Add auth header if token exists
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Auth endpoints
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/token/', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async register(data: RegisterData): Promise<User> {
        return this.request<User>('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async refreshToken(refresh: string): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/token/refresh/', {
            method: 'POST',
            body: JSON.stringify({ refresh }),
        });
    }

    async getCurrentUser(): Promise<User> {
        return this.request<User>('/auth/me/');
    }

    async searchUsers(query: string): Promise<User[]> {
        return this.request<User[]>(`/users/search/?q=${encodeURIComponent(query)}`);
    }

    async logout(): Promise<void> {
        return this.request<void>('/auth/logout/', {
            method: 'POST',
        });
    }

    // Chat endpoints
    async getConversations(): Promise<Conversation[]> {
        return this.request<Conversation[]>('/conversations/');
    }

    async createConversation(data: { title?: string; participant_ids?: number[] }): Promise<Conversation> {
        return this.request<Conversation>('/conversations/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMessages(conversationId: number): Promise<Message[]> {
        return this.request<Message[]>(`/conversations/${conversationId}/messages/`);
    }

    async sendMessage(conversationId: number, content: string): Promise<Message> {
        return this.request<Message>(`/conversations/${conversationId}/messages/`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth utilities
export const setAuthToken = (access: string) => {
    localStorage.setItem('access_token', access);
};

export const clearAuthToken = () => {
    localStorage.removeItem('access_token');
    // Note: refresh token is stored in HTTP-only cookie, 
    // so we can't clear it from JavaScript
    // The backend should handle clearing it
};

export const getAccessToken = () => localStorage.getItem('access_token'); 