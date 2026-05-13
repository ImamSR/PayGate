import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';

import { NotificationService, Notification } from '../../../core/services/notification.service';

/**
 * Component for displaying custom notifications.
 * Works alongside MatSnackBar for enhanced notification display.
 */
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="fixed left-3 right-3 top-18 z-[2000] w-auto md:left-auto md:right-5 md:top-20 md:w-full md:max-w-sm">
      <div 
        *ngFor="let notification of notifications; trackBy: trackByNotificationId"
        class="mb-2 flex animate-[slideIn_0.3s_ease-out] items-center justify-between rounded-2xl border-l-4 px-4 py-3 shadow-xl backdrop-blur"
        [ngClass]="notificationClasses(notification.type)">
        
        <div class="flex flex-1 items-center gap-3">
          <mat-icon class="!h-5 !w-5 !text-xl">{{ getNotificationIcon(notification.type) }}</mat-icon>
          <span class="text-sm font-medium leading-5">{{ notification.message }}</span>
        </div>
        
        <button 
          mat-icon-button 
          class="ml-2 !h-8 !w-8 !text-inherit"
          (click)="removeNotification(notification.id)"
          aria-label="Close notification">
          <mat-icon class="!h-[18px] !w-[18px] !text-[18px]">close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        this.addNotification(notification);
        
        // Auto-remove notification after duration
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            this.removeNotification(notification.id);
          }, notification.duration);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addNotification(notification: Notification): void {
    this.notifications.unshift(notification);
    
    // Limit to maximum 5 notifications
    if (this.notifications.length > 5) {
      this.notifications = this.notifications.slice(0, 5);
    }
  }

  removeNotification(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'notifications';
    }
  }

  notificationClasses(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return 'border-emerald-400 bg-emerald-500/95 text-white';
      case 'error':
        return 'border-rose-400 bg-rose-500/95 text-white';
      case 'warning':
        return 'border-amber-400 bg-amber-500/95 text-white';
      case 'info':
      default:
        return 'border-sky-400 bg-sky-500/95 text-white';
    }
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}
