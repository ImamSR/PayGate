import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { User } from '../../../core/services/auth.service';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

/**
 * Side navigation component with menu items.
 */
@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-200" *ngIf="isAuthenticated">
      <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40"></div>

      <div class="relative z-[1] mx-4 mb-2 mt-4 rounded-[22px] border border-slate-700/80 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-[18px] shadow-[0_18px_36px_rgba(2,6,23,0.26)]">
        <div class="mb-2.5 text-[0.7rem] uppercase tracking-[0.14em] text-sky-300">Operator Node</div>
        <div class="mb-1.5 text-[1.05rem] font-bold text-slate-50">Protocol Control</div>
        <div class="text-[0.82rem] leading-6 text-slate-400">Authenticated routes and realtime settlement tools</div>
      </div>

      <div class="relative z-[1] mx-4 mt-2 flex items-center gap-3 rounded-[18px] border border-slate-700/80 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-5 shadow-[0_16px_30px_rgba(2,6,23,0.22)]" *ngIf="user">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-sky-300">
          <mat-icon class="!h-10 !w-10 !text-[40px]">account_circle</mat-icon>
        </div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-base font-medium text-slate-50">{{ user.username }}</div>
          <div class="mt-0.5 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-cyan-300">{{ user.role }}</div>
        </div>
      </div>

      <mat-divider class="relative z-[1] !mx-4 !my-4 !border-slate-700/70"></mat-divider>

      <mat-nav-list class="relative z-[1] p-3">
        <ng-container *ngFor="let item of navigationItems">
          <mat-list-item 
            *ngIf="!item.adminOnly || isAdmin"
            [routerLink]="item.route"
            routerLinkActive="active-link"
            class="mb-1 cursor-pointer rounded-2xl border border-transparent text-white transition duration-200 hover:translate-x-1 hover:bg-slate-900/80 hover:border-slate-700"
            (click)="onNavigate()">

            <mat-icon matListItemIcon class="!text-white">
              {{ item.icon }}
            </mat-icon>

            <span matListItemTitle class="!text-white">
              {{ item.label }}
            </span>

          </mat-list-item>
        </ng-container>
      </mat-nav-list>
    </div>

    <div class="flex h-full flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-200" *ngIf="!isAuthenticated">
      <div class="relative z-[1] m-4 rounded-[22px] border border-slate-700/80 bg-slate-900/95 px-5 py-8 text-center text-slate-400 shadow-[0_18px_36px_rgba(2,6,23,0.26)]">
        <mat-icon class="mb-4 !h-12 !w-12 !text-[48px] !text-sky-300">info</mat-icon>
        <p class="m-0">Please log in to access the application</p>
      </div>
    </div>
  `,
  styles: [`
    .active-link {
      background: rgba(15, 23, 42, 0.92) !important;
      color: #f8fafc !important;
      border: 1px solid rgba(56, 189, 248, 0.24);
      border-left: 2px solid #22d3ee;
      border-radius: 16px;
      box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.04);
    }

    .active-link mat-icon {
      color: #67e8f9 !important;
    }
  `]
})
export class SidenavComponent {
  @Input() isAuthenticated = false;
  @Input() user: User | null = null;
  @Output() navigate = new EventEmitter<void>();

  navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Make Payment',
      icon: 'payment',
      route: '/payments/new'
    },
    {
      label: 'Transactions',
      icon: 'receipt_long',
      route: '/transactions'
    },
    {
      label: 'Transaction History',
      icon: 'history',
      route: '/transactions/history'
    },
    {
      label: 'Admin Dashboard',
      icon: 'admin_panel_settings',
      route: '/admin/dashboard',
      adminOnly: true
    },
    {
      label: 'System Metrics',
      icon: 'analytics',
      route: '/admin/metrics',
      adminOnly: true
    },
    {
      label: 'User Management',
      icon: 'people',
      route: '/admin/users',
      adminOnly: true
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings'
    }
  ];

  get isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }

  onNavigate(): void {
    this.navigate.emit();
  }
}
