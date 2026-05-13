import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

import { AuthService, User } from '../../../core/services/auth.service';

/**
 * Header component with navigation and user menu.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="relative z-[3] animate-[shell-enter_700ms_ease-out_both] px-3 pt-4 md:px-6 md:pt-6">
      <mat-toolbar class="relative h-[72px] overflow-hidden rounded-[24px] border border-slate-400/15 !bg-slate-950/70 px-4 text-slate-200 shadow-[0_24px_60px_rgba(2,6,23,0.34)] backdrop-blur-[18px] transition duration-200 hover:-translate-y-0.5 hover:border-sky-300/20 hover:shadow-[0_30px_70px_rgba(2,6,23,0.42)] md:h-[78px] md:px-[22px]">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(34,211,238,0.18),transparent_26%),radial-gradient(circle_at_82%_25%,rgba(99,102,241,0.16),transparent_28%)]"></div>
      <button 
        mat-icon-button 
        (click)="onMenuToggle()"
        *ngIf="isAuthenticated"
        aria-label="Toggle menu"
        class="z-[1] mr-3 !text-sky-300">
        <mat-icon>menu</mat-icon>
      </button>

      <div class="z-[1] flex items-center gap-3">
        <div class="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] border border-sky-300/20 bg-gradient-to-br from-cyan-400/20 to-indigo-500/25 text-sky-100 shadow-[0_12px_32px_rgba(34,211,238,0.12)]">
          <mat-icon>token</mat-icon>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-lg font-bold tracking-tight text-slate-50 md:text-[1.18rem]">Mock Payment Mesh</span>
        </div>
      </div>

      <span class="flex-1"></span>

      <div class="user-menu" *ngIf="isAuthenticated && user">
        <button mat-button [matMenuTriggerFor]="userMenu" class="z-[1] flex h-auto items-center rounded-full border border-slate-400/20 bg-slate-900/85 px-2 py-1 text-slate-300 transition hover:border-sky-300/25 hover:bg-slate-900 hover:shadow-[0_8px_24px_rgba(2,6,23,0.28)] md:pr-4">
          <div class="mr-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 to-indigo-500/25 text-sky-300 md:mr-2.5">
            <mat-icon>person</mat-icon>
          </div>
          <span class="hidden max-w-[120px] truncate text-[0.95rem] font-medium md:inline">{{ user.username }}</span>
          <mat-icon class="ml-1 hidden !text-sky-300 md:inline-flex">keyboard_arrow_down</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu" class="custom-user-menu">
          <div class="flex items-center gap-4 px-5 py-5">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/25 to-indigo-500/30 text-sky-100 shadow-[0_12px_30px_rgba(34,211,238,0.14)]">
              <mat-icon>person</mat-icon>
            </div>
            <div class="flex flex-col">
              <div class="text-[1.05rem] font-semibold text-slate-50">{{ user.username }}</div>
              <div class="mt-0.5 text-[0.85rem] text-slate-400">{{ user.email }}</div>
              <div class="mt-2 inline-block self-start rounded-xl bg-cyan-400/10 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.5px] text-sky-300">{{ user.role }}</div>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="navigateToProfile()" class="menu-item">
            <mat-icon class="!mr-3 !text-sky-300">account_circle</mat-icon>
            <span>My Profile</span>
          </button>
          <button mat-menu-item (click)="navigateToSettings()" class="menu-item">
            <mat-icon class="!mr-3 !text-sky-300">settings</mat-icon>
            <span>Settings</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()" class="logout-button menu-item">
            <mat-icon class="!mr-3 !text-rose-400">logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
      </div>

      <div class="z-[1] flex items-center gap-3" *ngIf="!isAuthenticated">
        <button mat-raised-button class="pulse-effect !h-[42px] !rounded-[14px] !border-0 !bg-gradient-to-r !from-cyan-400 !via-blue-600 !to-violet-600 !px-6 !font-bold !uppercase !tracking-[0.08em] !text-white !shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:!-translate-y-0.5 hover:!shadow-[0_16px_36px_rgba(37,99,235,0.34)]" (click)="navigateToLogin()">
          <mat-icon>login</mat-icon>
          <span>Connect</span>
        </button>
      </div>
      </mat-toolbar>
    </div>
  `,
  styles: [`
    ::ng-deep .custom-user-menu {
      border-radius: 20px !important;
      padding: 8px 0;
      box-shadow: 0 24px 60px rgba(2,6,23,0.45) !important;
      min-width: 240px;
      background: rgba(7, 12, 24, 0.96) !important;
      border: 1px solid rgba(148, 163, 184, 0.14);
    }

    .menu-item {
      font-size: 0.95rem;
      color: #cbd5e1;
      height: 44px;
    }

    .logout-button {
      color: #ef4444;
    }

    .pulse-effect {
      position: relative;
      overflow: hidden;
    }

    .pulse-effect::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.24) 45%, transparent 100%);
      transform: translateX(-120%);
      animation: shimmer 4s ease-in-out infinite;
    }

    @keyframes shell-enter {
      from {
        opacity: 0;
        transform: translateY(-18px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes toolbar-float {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-3px);
      }
    }

    @keyframes drift-glow {
      from {
        transform: translateX(-1%) scale(1);
      }
      to {
        transform: translateX(1.5%) scale(1.04);
      }
    }

    @keyframes icon-breathe {
      0%,
      100% {
        box-shadow: 0 12px 32px rgba(34, 211, 238, 0.12);
      }
      50% {
        box-shadow: 0 18px 42px rgba(34, 211, 238, 0.2);
      }
    }

    @keyframes pill-breathe {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-1px);
      }
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-120%);
      }
      30%,
      100% {
        transform: translateX(120%);
      }
    }
  `]
})
export class HeaderComponent {
  @Input() isAuthenticated = false;
  @Input() user: User | null = null;
  @Output() menuToggle = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }
}
