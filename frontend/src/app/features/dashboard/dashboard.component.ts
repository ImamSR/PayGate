import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs/operators';

import { AuthService, User } from '../../core/services/auth.service';
import { DashboardService, UserDashboardResponse } from '../../core/services/dashboard.service';
import { WebSocketService } from '../../core/services/websocket.service';

/**
 * Main dashboard component showing overview and quick actions.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <div class="mx-auto w-full max-w-7xl px-4 py-8 text-slate-100 lg:px-6">
      <div class="mb-8">
        <h1 class="mb-1 text-4xl font-bold tracking-tight text-slate-50">Welcome back, <span class="text-cyan-300">{{ user?.username }}</span></h1>
        <p class="m-0 text-base font-light text-slate-400">Here is your financial overview for today.</p>
      </div>

      <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-16 text-slate-400">
        <mat-spinner diameter="40"></mat-spinner>
        <p class="mt-5">Loading your dashboard...</p>
      </div>

      <ng-container *ngIf="!isLoading && dashboardData">
        <div class="mb-10 grid gap-6 xl:grid-cols-3">
          <div class="relative overflow-hidden rounded-[24px] border border-slate-700/80 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),linear-gradient(180deg,rgba(11,29,43,0.98)_0%,rgba(7,19,35,0.98)_100%)] p-6 shadow-[0_20px_40px_rgba(2,6,23,0.28)] transition hover:-translate-y-1 hover:border-sky-400/20 hover:shadow-[0_24px_46px_rgba(2,6,23,0.36)]">
            <div class="absolute -right-5 -top-12 h-[150px] w-[150px] rounded-full bg-slate-400/10"></div>
            <div class="absolute bottom-[-40px] right-12 h-[100px] w-[100px] rounded-full bg-slate-400/10"></div>
            <div class="relative flex items-center">
              <div class="mr-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                <mat-icon>account_balance_wallet</mat-icon>
              </div>
              <div class="relative flex-1">
                <p class="mb-1 text-[0.95rem] font-medium text-slate-400">Account Balance</p>
                <h2 class="m-0 text-[2rem] font-bold tracking-tight text-slate-50">{{ dashboardData.currentBalance | currency:'USD' }}</h2>
              </div>
            </div>
          </div>

          <div class="overflow-hidden rounded-[24px] border border-slate-700/80 bg-[radial-gradient(circle_at_top_right,rgba(248,113,113,0.12),transparent_26%),linear-gradient(180deg,rgba(18,17,31,0.98)_0%,rgba(10,10,20,0.98)_100%)] p-6 shadow-[0_20px_40px_rgba(2,6,23,0.28)] transition hover:-translate-y-1 hover:border-sky-400/20 hover:shadow-[0_24px_46px_rgba(2,6,23,0.36)]">
            <div class="flex items-center">
              <div class="mr-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-400/15 text-rose-300">
                <mat-icon>shopping_cart</mat-icon>
              </div>
              <div class="flex-1">
                <p class="mb-1 text-[0.95rem] font-medium text-slate-400">Total Spent</p>
                <h2 class="m-0 text-[2rem] font-bold tracking-tight text-slate-50">{{ dashboardData.totalSpent | currency:'USD' }}</h2>
              </div>
            </div>
          </div>

          <div class="overflow-hidden rounded-[24px] border border-slate-700/80 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_26%),linear-gradient(180deg,rgba(24,20,9,0.98)_0%,rgba(16,13,7,0.98)_100%)] p-6 shadow-[0_20px_40px_rgba(2,6,23,0.28)] transition hover:-translate-y-1 hover:border-sky-400/20 hover:shadow-[0_24px_46px_rgba(2,6,23,0.36)]">
            <div class="flex items-center">
              <div class="mr-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                <mat-icon>pending_actions</mat-icon>
              </div>
              <div class="flex-1">
                <p class="mb-1 text-[0.95rem] font-medium text-slate-400">Pending Payments</p>
                <h2 class="m-0 text-[2rem] font-bold tracking-tight text-slate-50">{{ dashboardData.activeTransactionsCount }}</h2>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-8 xl:grid-cols-2">
          <div>
            <h3 class="mb-5 text-xl font-semibold text-slate-50">Quick Actions</h3>
            <div class="grid gap-5 sm:grid-cols-2">
              <mat-card class="cursor-pointer rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-center shadow-[0_14px_28px_rgba(2,6,23,0.2)] transition hover:-translate-y-1 hover:border-sky-400/20 hover:shadow-[0_22px_38px_rgba(2,6,23,0.32)]" routerLink="/payments/new">
                <mat-card-content class="!p-0">
                  <mat-icon class="mb-4 !h-10 !w-10 !text-[40px] !text-cyan-300">payment</mat-icon>
                  <h3 class="m-0 mb-2 text-lg font-semibold text-slate-50">Make Payment</h3>
                  <p class="m-0 text-sm text-slate-400">Send a new transaction</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="cursor-pointer rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-center shadow-[0_14px_28px_rgba(2,6,23,0.2)] transition hover:-translate-y-1 hover:border-sky-400/20 hover:shadow-[0_22px_38px_rgba(2,6,23,0.32)]" routerLink="/transactions/history">
                <mat-card-content class="!p-0">
                  <mat-icon class="mb-4 !h-10 !w-10 !text-[40px] !text-cyan-300">history</mat-icon>
                  <h3 class="m-0 mb-2 text-lg font-semibold text-slate-50">History</h3>
                  <p class="m-0 text-sm text-slate-400">View all transactions</p>
                </mat-card-content>
              </mat-card>

              <mat-card 
                *ngIf="isAdmin" 
                class="cursor-pointer rounded-3xl border border-slate-700/80 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_28%),linear-gradient(180deg,rgba(13,22,39,0.98)_0%,rgba(8,14,26,0.98)_100%)] p-6 text-center shadow-[0_14px_28px_rgba(2,6,23,0.2)] transition hover:-translate-y-1 hover:border-sky-400/20 hover:shadow-[0_22px_38px_rgba(2,6,23,0.32)]" 
                routerLink="/admin/dashboard">
                <mat-card-content class="!p-0">
                  <mat-icon class="mb-4 !h-10 !w-10 !text-[40px] !text-cyan-300">admin_panel_settings</mat-icon>
                  <h3 class="m-0 mb-2 text-lg font-semibold text-slate-50">Admin Panel</h3>
                  <p class="m-0 text-sm text-slate-400">Manage system</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <div>
            <div class="mb-5 flex items-center justify-between gap-4">
              <h3 class="m-0 text-xl font-semibold text-slate-50">Recent Transactions</h3>
              <a routerLink="/transactions/history" class="text-sm font-medium text-cyan-300 transition hover:text-cyan-200 hover:underline">View All</a>
            </div>
            
            <mat-card class="overflow-hidden rounded-[24px] border border-slate-700/80 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_20px_40px_rgba(2,6,23,0.24)]">
              <div *ngIf="dashboardData.recentTransactions.length === 0" class="px-5 py-12 text-center text-slate-400">
                <mat-icon class="mb-4 !h-12 !w-12 !text-[48px] !opacity-50">receipt_long</mat-icon>
                <p class="m-0">No recent transactions found.</p>
              </div>

              <div class="flex flex-col" *ngIf="dashboardData.recentTransactions.length > 0">
                <div class="flex items-center border-b border-slate-700/70 px-5 py-5 transition hover:bg-slate-900/70 last:border-b-0" *ngFor="let tx of dashboardData.recentTransactions">
                  <div class="mr-4 flex h-11 w-11 items-center justify-center rounded-full" [ngClass]="txIconClass(tx.status)">
                    <mat-icon *ngIf="tx.status === 'COMPLETED'">check_circle</mat-icon>
                    <mat-icon *ngIf="tx.status === 'PENDING' || tx.status === 'PROCESSING'">schedule</mat-icon>
                    <mat-icon *ngIf="tx.status === 'FAILED' || tx.status === 'CANCELLED'">error</mat-icon>
                  </div>
                  <div class="flex-1">
                    <p class="mb-1 text-base font-semibold text-slate-50">{{ tx.paymentMethod }}</p>
                    <p class="m-0 text-sm text-slate-400">{{ tx.createdAt | date:'medium' }}</p>
                  </div>
                  <div class="text-right text-lg font-bold" [ngClass]="txAmountClass(tx.status)">
                    -{{ tx.amount | currency:tx.currency }}
                  </div>
                </div>
              </div>
            </mat-card>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [``]
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  dashboardData: UserDashboardResponse | null = null;
  isLoading = true;
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.webSocketService.enterRealtimePage();

    this.authService.loadCurrentUser().pipe(take(1)).subscribe({
      next: (user) => {
        this.user = user;
        this.isAdmin = user?.role === 'ADMIN';
        this.loadDashboardData();
      },
      error: () => {
        this.loadDashboardData();
      }
    });
  }

  ngOnDestroy(): void {
    this.webSocketService.leaveRealtimePage();
  }

  txIconClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-400';
      case 'pending':
      case 'processing':
        return 'bg-amber-400/15 text-amber-300';
      default:
        return 'bg-rose-400/15 text-rose-300';
    }
  }

  txAmountClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'processing':
        return 'text-amber-300';
      case 'failed':
      case 'cancelled':
        return 'text-slate-400 line-through';
      default:
        return 'text-slate-50';
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getUserDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.isLoading = false;
      }
    });
  }
}
