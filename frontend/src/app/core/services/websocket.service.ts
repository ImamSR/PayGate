import { Injectable, NgZone } from '@angular/core';
import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { catchError, map, retry, takeUntil } from 'rxjs/operators';

import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface StatusUpdate {
  transactionId: string;
  status: string;
  timestamp: string;
  errorMessage?: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: string;
  timestamp: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private readonly rxStomp: RxStomp;
  private readonly connectionStateSubscription: Subscription;
  private realtimeStop$ = new Subject<void>();
  private subscriptionsInitialized = false;
  private shouldStayConnected = false;

  public readonly connectionState$: Observable<RxStompState>;

  private readonly statusUpdates$ = new Subject<StatusUpdate>();
  private readonly paymentResponses$ = new Subject<PaymentResponse>();
  private readonly errorMessages$ = new Subject<any>();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly ngZone: NgZone
  ) {
    this.rxStomp = new RxStomp();
    this.connectionState$ = this.rxStomp.connectionState$;
    this.connectionStateSubscription = this.setupConnectionStateHandling();
  }

  private activeRealtimePages = 0;

  enterRealtimePage(): void {
    this.activeRealtimePages++;
    this.shouldStayConnected = true;
    this.connect();
  }

  leaveRealtimePage(): void {
    this.activeRealtimePages--;
    if (this.activeRealtimePages <= 0) {
      this.activeRealtimePages = 0;
      this.shouldStayConnected = false;
      this.disconnect();
    }
  }

  connect(): void {
    if (!this.authService.isAuthenticatedSnapshot()) {
      return; // Do not connect if user is not authenticated
    }

    if (this.rxStomp.active) {
      return;
    }

    this.activateConnection();
  }

  private activateConnection(): void {
    console.log('Connecting to WebSocket');
    this.ensureRealtimeSubscriptions();

    this.ngZone.runOutsideAngular(() => {
      this.rxStomp.configure({
        webSocketFactory: () => new SockJS(this.toSockJsUrl(environment.wsUrl)),
        connectHeaders: {},
        heartbeatIncoming: 30000, // 30 seconds
        heartbeatOutgoing: 30000, // 30 seconds
        reconnectDelay: 3000, // Native RxStomp automatic reconnection
        debug: (msg: string) => {
          if (!environment.production) {
            console.log('STOMP Debug:', msg);
          }
        }
      });

      this.rxStomp.activate();
    });
  }

  disconnect(): void {
    this.realtimeStop$.next();
    this.realtimeStop$.complete();
    this.realtimeStop$ = new Subject<void>();
    this.subscriptionsInitialized = false;

    void this.rxStomp.deactivate();
  }

  publish(destination: string, body: any): void {
    if (this.rxStomp.connected()) {
      this.rxStomp.publish({
        destination,
        body: JSON.stringify(body)
      });
    } else {
      console.error('WebSocket not connected. Cannot publish message.');
      this.notificationService.showError('Connection lost. Please wait for reconnection.');
    }
  }

  watch(destination: string): Observable<IMessage> {
    return this.rxStomp.watch(destination).pipe(
      takeUntil(this.realtimeStop$),
      retry({
        count: 3,
        delay: 1000
      }),
      catchError(error => {
        console.error('WebSocket subscription error:', error);
        this.notificationService.showError('Failed to subscribe to updates');
        throw error;
      })
    );
  }

  getStatusUpdates(): Observable<StatusUpdate> {
    return this.statusUpdates$.asObservable();
  }

  getPaymentResponses(): Observable<PaymentResponse> {
    return this.paymentResponses$.asObservable();
  }

  getErrorMessages(): Observable<any> {
    return this.errorMessages$.asObservable();
  }

  isConnected(): boolean {
    return this.rxStomp.connected();
  }

  isRealtimeActive(): boolean {
    return this.activeRealtimePages > 0;
  }

  private setupConnectionStateHandling(): Subscription {
    return this.connectionState$.subscribe(state => {
      this.ngZone.run(() => {
        console.log('WebSocket connection state:', RxStompState[state]);
      });
    });
  }

  private ensureRealtimeSubscriptions(): void {
    if (this.subscriptionsInitialized) {
      return;
    }

    this.setupMessageSubscriptions();
    this.subscriptionsInitialized = true;
  }

  private setupMessageSubscriptions(): void {
    this.watch('/user/queue/payment-response').pipe(
      map(message => JSON.parse(message.body) as PaymentResponse)
    ).subscribe(response => {
      this.ngZone.run(() => {
        this.paymentResponses$.next(response);
      });
    });

    this.watch('/user/queue/status-updates').pipe(
      map(message => JSON.parse(message.body) as StatusUpdate)
    ).subscribe(update => {
      this.ngZone.run(() => {
        this.statusUpdates$.next(update);
        this.notificationService.showInfo(
          `Transaction ${update.transactionId} status: ${update.status}`
        );
      });
    });

    this.watch('/user/queue/errors').pipe(
      map(message => JSON.parse(message.body))
    ).subscribe(error => {
      this.ngZone.run(() => {
        this.errorMessages$.next(error);
        this.notificationService.showError(error.message || 'An error occurred');
      });
    });
  }

  private toSockJsUrl(url: string): string {
    if (url.startsWith('ws://')) {
      return `http://${url.slice(5)}`;
    }

    if (url.startsWith('wss://')) {
      return `https://${url.slice(6)}`;
    }

    return url;
  }
}
