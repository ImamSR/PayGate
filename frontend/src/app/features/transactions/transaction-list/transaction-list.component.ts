import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, debounceTime } from 'rxjs';

import { PaymentService, TransactionSummary } from '../../../core/services/payment.service';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6">
      <mat-card class="rounded-[28px] border border-slate-700/60 bg-slate-900/90 text-slate-100 shadow-[0_24px_70px_rgba(2,6,23,0.34)]">
        <mat-card-header class="!p-8 !pb-4">
          <mat-card-title class="!mb-2 !text-3xl !font-bold !tracking-tight !text-slate-50">Transactions</mat-card-title>
          <mat-card-subtitle class="!text-slate-400">Live transaction history from the backend</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="!px-8 !pb-8 !pt-2">
          <div class="my-3 flex flex-wrap gap-3">
            <button mat-raised-button color="primary" routerLink="/payments/new" class="!h-11 !rounded-xl !px-5 !font-semibold">New Payment</button>
            <button mat-stroked-button (click)="executeLoadTransactions(true)" class="!h-11 !rounded-xl !border-slate-600 !px-5 !text-slate-200">Refresh</button>
          </div>

          <div class="grid min-h-[180px] place-items-center text-center text-slate-400" *ngIf="isLoading">
            <mat-spinner diameter="36"></mat-spinner>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-slate-800" *ngIf="!isLoading && transactions.length">
            <table mat-table [dataSource]="transactions" class="transaction-table w-full bg-slate-950/30">
            <ng-container matColumnDef="transactionId">
              <th mat-header-cell *matHeaderCellDef>Transaction</th>
              <td mat-cell *matCellDef="let transaction">{{ transaction.transactionId }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let transaction">
                {{ transaction.amount | number:'1.2-2' }} {{ transaction.currency }}
              </td>
            </ng-container>

            <ng-container matColumnDef="paymentMethod">
              <th mat-header-cell *matHeaderCellDef>Method</th>
              <td mat-cell *matCellDef="let transaction">{{ transaction.paymentMethod }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let transaction">
                <span class="status-pill" [class]="transaction.status">{{ transaction.status }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="updatedAt">
              <th mat-header-cell *matHeaderCellDef>Updated</th>
              <td mat-cell *matCellDef="let transaction">{{ transaction.updatedAt | date:'medium' }}</td>
            </ng-container>

            <ng-container matColumnDef="message">
              <th mat-header-cell *matHeaderCellDef>Notes</th>
              <td mat-cell *matCellDef="let transaction">{{ transaction.message || 'OK' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          </div>

          <div class="grid min-h-[180px] place-items-center text-center text-slate-400" *ngIf="!isLoading && !transactions.length">
            <div>
              <mat-icon class="mb-4 !h-12 !w-12 !text-[48px] !text-slate-500">receipt_long</mat-icon>
              <p class="m-0">No transactions yet. Create one from the payment page.</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    ::ng-deep .transaction-table .mat-mdc-header-row,
    ::ng-deep .transaction-table .mat-mdc-row {
      background: transparent !important;
    }

    ::ng-deep .transaction-table .mat-mdc-header-cell {
      color: #94a3b8 !important;
      border-bottom-color: rgba(51, 65, 85, 0.8) !important;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    ::ng-deep .transaction-table .mat-mdc-cell {
      color: #e2e8f0 !important;
      border-bottom-color: rgba(30, 41, 59, 0.9) !important;
    }

    ::ng-deep .transaction-table .mat-mdc-row:hover .mat-mdc-cell {
      background: rgba(15, 23, 42, 0.45) !important;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 0.375rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .PENDING {
      background: rgba(100, 116, 139, 0.25);
      color: #e2e8f0;
    }

    .PROCESSING {
      background: rgba(245, 158, 11, 0.22);
      color: #fcd34d;
    }

    .COMPLETED {
      background: rgba(16, 185, 129, 0.22);
      color: #86efac;
    }

    .FAILED,
    .CANCELLED {
      background: rgba(244, 63, 94, 0.22);
      color: #fda4af;
    }
  `]
})
export class TransactionListComponent implements OnInit, OnDestroy {
  protected readonly displayedColumns = ['transactionId', 'amount', 'paymentMethod', 'status', 'updatedAt', 'message'];
  protected transactions: TransactionSummary[] = [];
  protected isLoading = true;

  private readonly destroy$ = new Subject<void>();
  private readonly loadTrigger$ = new Subject<void>();

  constructor(
    private readonly paymentService: PaymentService,
    private readonly webSocketService: WebSocketService
  ) {
    this.loadTrigger$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => this.executeLoadTransactions(false));
  }

  ngOnInit(): void {
    this.webSocketService.enterRealtimePage();
    this.executeLoadTransactions(true);

    this.webSocketService.getStatusUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.triggerDebouncedLoad());

    this.webSocketService.getPaymentResponses()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.triggerDebouncedLoad());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.leaveRealtimePage();
  }

  triggerDebouncedLoad(): void {
    this.loadTrigger$.next();
  }

  executeLoadTransactions(showSpinner: boolean = true): void {
    if (showSpinner) {
      this.isLoading = true;
    }
    this.paymentService.getTransactions().subscribe({
      next: transactions => {
        this.transactions = transactions;
        this.isLoading = false;
      },
      error: () => {
        this.transactions = [];
        this.isLoading = false;
      }
    });
  }
}
