import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  duration?: number;
}

/**
 * Service for displaying notifications and managing notification state.
 * Provides methods for showing different types of notifications.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  public notifications$ = this.notificationSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Shows a success notification.
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.showNotification(message, 'success', duration);
  }

  /**
   * Shows an error notification.
   */
  showError(message: string, duration: number = 5000): void {
    this.showNotification(message, 'error', duration);
  }

  /**
   * Shows a warning notification.
   */
  showWarning(message: string, duration: number = 4000): void {
    this.showNotification(message, 'warning', duration);
  }

  /**
   * Shows an info notification.
   */
  showInfo(message: string, duration: number = 3000): void {
    this.showNotification(message, 'info', duration);
  }

  /**
   * Shows a notification with specified type and duration.
   */
  private showNotification(message: string, type: Notification['type'], duration: number): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      timestamp: new Date(),
      duration
    };

    // Emit notification for components that want to handle it
    this.notificationSubject.next(notification);

    // Use a macrotask so submit handlers can finish their current change-detection
    // cycle before Material attaches overlay state.
    setTimeout(() => {
      this.snackBar.open(message, 'Close', {
        duration,
        panelClass: [`snackbar-${type}`],
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }, 0);
  }

  /**
   * Generates a unique ID for notifications.
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
