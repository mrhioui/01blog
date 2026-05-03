import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import * as _SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Polyfill for 'global' if running in a browser environment that doesn't provide it
if (typeof (global as any) === 'undefined') {
  (window as any).global = window;
}

const SockJS = (_SockJS as any).default || _SockJS;

@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements OnDestroy {
  private client: Client | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);

  constructor() {
    this.connect();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private connect(): void {
    const socket = new SockJS(`${environment.apiUrl.replace('/api', '')}/ws`);
    this.client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      this.connectionStatus.next(true);
      console.log('Connected to WebSocket');
    };

    this.client.onDisconnect = () => {
      this.connectionStatus.next(false);
      console.log('Disconnected from WebSocket');
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  private disconnect(): void {
    if (this.client) {
      this.client.deactivate();
    }
  }

  subscribe<T>(topic: string): Observable<T> {
    return new Observable<T>((observer) => {
      if (!this.client) {
        observer.error('WebSocket client not initialized');
        return;
      }

      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body) as T;
          observer.next(payload);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  get isConnected(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }
}
