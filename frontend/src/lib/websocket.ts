import { getAccessToken } from './api';

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'user_join' | 'user_leave';
  message?: string;
  user_id?: number;
  username?: string;
  display_name?: string;
  message_id?: number;
  timestamp?: string;
  typing?: boolean;
}

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private conversationId: string | null = null;
  private onMessageCallback: ((data: WebSocketMessage) => void) | null = null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.sendTyping = this.sendTyping.bind(this);
  }

  connect(conversationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.conversationId = conversationId;
      const token = getAccessToken();

      if (!token) {
        reject(new Error('No access token available'));
        return;
      }

      // Use production WebSocket URL if available, otherwise fallback to localhost
      const isProduction = window.location.hostname !== 'localhost';
      const wsProtocol = isProduction ? 'wss' : 'ws';
      const wsHost = isProduction ? 'chat-web-app-wh20.onrender.com' : 'localhost:8000';
      const wsUrl = `${wsProtocol}://${wsHost}/ws/chat/${conversationId}/?token=${token}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;

        if (this.onConnectCallback) {
          this.onConnectCallback();
        }
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);

        if (this.onDisconnectCallback) {
          this.onDisconnectCallback();
        }

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

          setTimeout(() => {
            if (this.conversationId) {
              this.connect(this.conversationId).catch(console.error);
            }
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.conversationId = null;
  }

  sendMessage(message: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        message: message
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  sendTyping(typing: boolean): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        typing: typing
      }));
    }
  }

  onMessage(callback: (data: WebSocketMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  onDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
export const chatWebSocket = new ChatWebSocket(); 