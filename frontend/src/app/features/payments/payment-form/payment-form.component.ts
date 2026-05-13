import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';

import { PaymentService } from '../../../core/services/payment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PaymentResponse, StatusUpdate, WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:px-6">
      <mat-card class="rounded-[28px] border border-slate-700/60 bg-slate-900/90 text-slate-100 shadow-[0_24px_70px_rgba(2,6,23,0.34)]">
        <mat-card-header class="!p-8 !pb-4">
          <mat-card-title class="!mb-2 !text-3xl !font-bold !tracking-tight !text-slate-50">Create Transaction</mat-card-title>
          <mat-card-subtitle class="!text-slate-400">Submit a payment and watch live status updates</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="!px-8 !pb-8 !pt-2">
          <form [formGroup]="paymentForm" (ngSubmit)="submitPayment()" class="mt-3 grid gap-4">
            <mat-form-field appearance="outline" class="tailwind-field">
              <mat-label>Amount</mat-label>
              <input matInput type="number" min="0.01" step="0.01" formControlName="amount">
              <mat-error *ngIf="paymentForm.get('amount')?.hasError('required')">Amount is required</mat-error>
              <mat-error *ngIf="paymentForm.get('amount')?.hasError('min')">Amount must be greater than zero</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="tailwind-field">
              <mat-label>Currency</mat-label>
              <mat-select formControlName="currency">
                <mat-option *ngFor="let currency of currencies" [value]="currency">{{ currency }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="tailwind-field">
              <mat-label>Payment method</mat-label>
              <mat-select formControlName="paymentMethod">
                <mat-option *ngFor="let method of paymentMethods" [value]="method.value">
                  {{ method.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button mat-raised-button color="primary" type="submit" [disabled]="paymentForm.invalid || isSubmitting" class="!h-12 !rounded-xl !px-6 !font-semibold">
                <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
                <span *ngIf="!isSubmitting">Submit Payment</span>
              </button>
              <a mat-stroked-button routerLink="/transactions" class="!h-12 !rounded-xl !border-slate-600 !px-6 !text-slate-200">View Transactions</a>
            </div>
          </form>

          <div class="mt-5 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-sm leading-6 text-sky-100">
            Use <code>FAIL_TEST</code> to simulate a rejected payment, or enter an amount above <code>25000</code> to simulate a gateway decline.
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="latestTransactionId" class="rounded-[28px] border border-slate-700/60 bg-slate-900/90 text-slate-100 shadow-[0_24px_70px_rgba(2,6,23,0.34)]">
        <mat-card-header class="!p-8 !pb-4">
          <mat-card-title class="!mb-2 !text-2xl !font-bold !tracking-tight !text-slate-50">Latest Transaction</mat-card-title>
          <mat-card-subtitle class="!truncate !text-slate-400">{{ latestTransactionId }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="!px-8 !pb-8 !pt-2">
          <div class="flex items-center justify-between gap-4 border-b border-slate-800 py-3">
            <span class="text-sm font-semibold text-slate-400">Current status</span>
            <mat-chip [ngClass]="statusClass(currentStatus)">{{ currentStatus || 'PENDING' }}</mat-chip>
          </div>
          <div class="flex items-center justify-between gap-4 border-b border-slate-800 py-3" *ngIf="lastResponseAt">
            <span class="text-sm font-semibold text-slate-400">Last update</span>
            <span class="text-sm text-slate-200">{{ lastResponseAt | date:'medium' }}</span>
          </div>
          <div class="flex items-center justify-between gap-4 py-3" *ngIf="statusMessage">
            <span class="text-sm font-semibold text-slate-400">Message</span>
            <span class="text-right text-sm text-slate-200">{{ statusMessage }}</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    ::ng-deep .tailwind-field .mat-mdc-text-field-wrapper {
      background: rgba(15, 23, 42, 0.9);
      border-radius: 16px;
    }

    ::ng-deep .tailwind-field .mdc-notched-outline__leading,
    ::ng-deep .tailwind-field .mdc-notched-outline__notch,
    ::ng-deep .tailwind-field .mdc-notched-outline__trailing {
      border-color: rgba(71, 85, 105, 0.8) !important;
    }

    ::ng-deep .tailwind-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .tailwind-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .tailwind-field.mat-focused .mdc-notched-outline__trailing {
      border-color: rgba(56, 189, 248, 0.9) !important;
    }

    ::ng-deep .tailwind-field .mdc-floating-label,
    ::ng-deep .tailwind-field input,
    ::ng-deep .tailwind-field .mat-mdc-select-value-text,
    ::ng-deep .tailwind-field .mat-mdc-select-arrow {
      color: #e2e8f0 !important;
    }
  `]
})
export class PaymentFormComponent implements OnInit, OnDestroy {
  protected readonly currencies = ['USD', 'IDR', 'EUR'];
  protected readonly paymentMethods = [
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'QRIS', label: 'QRIS' },
    { value: 'FAIL_TEST', label: 'Fail Test' }
  ];

  protected readonly paymentForm;
  protected isSubmitting = false;
  protected latestTransactionId: string | null = null;
  protected currentStatus: string | null = null;
  protected statusMessage: string | null = null;
  protected lastResponseAt: Date | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
    private readonly webSocketService: WebSocketService
  ) {
    this.paymentForm = this.fb.nonNullable.group({
      amount: [[Validators.required, Validators.min(0.01)]],
      currency: ['USD', [Validators.required]],
      paymentMethod: ['CREDIT_CARD', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.webSocketService.enterRealtimePage();

    this.webSocketService.getStatusUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(update => this.handleStatusUpdate(update));

    this.webSocketService.getPaymentResponses()
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => this.handlePaymentResponse(response));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.leaveRealtimePage();
  }

  submitPayment(): void {
    if (this.paymentForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.statusMessage = null;

    this.paymentService.createPayment(this.paymentForm.getRawValue()).subscribe({
      next: response => {
        this.latestTransactionId = response.transactionId;
        this.currentStatus = response.status;
        this.lastResponseAt = new Date(response.timestamp);
        this.notificationService.showInfo(`Transaction ${response.transactionId} submitted`);
      },
      error: error => {
        this.isSubmitting = false;
        this.notificationService.showError(error.error?.message || 'Failed to submit payment');
      }
    });
  }

  protected statusClass(status: string | null): string {
    switch (status || 'PENDING') {
      case 'COMPLETED':
        return '!rounded-full !bg-emerald-500/20 !px-3 !py-1 !text-emerald-300';
      case 'PROCESSING':
        return '!rounded-full !bg-amber-500/20 !px-3 !py-1 !text-amber-300';
      case 'FAILED':
      case 'CANCELLED':
        return '!rounded-full !bg-rose-500/20 !px-3 !py-1 !text-rose-300';
      default:
        return '!rounded-full !bg-slate-500/20 !px-3 !py-1 !text-slate-200';
    }
  }

  private handleStatusUpdate(update: StatusUpdate): void {
    if (update.transactionId !== this.latestTransactionId) {
      return;
    }

    this.currentStatus = update.status;
    this.lastResponseAt = new Date(update.timestamp);
    this.statusMessage = update.errorMessage || this.statusMessage;

    if (update.status === 'COMPLETED' || update.status === 'FAILED' || update.status === 'CANCELLED') {
      this.isSubmitting = false;
    }
  }

  private handlePaymentResponse(response: PaymentResponse): void {
    if (response.transactionId !== this.latestTransactionId) {
      return;
    }

    this.currentStatus = response.status;
    this.lastResponseAt = new Date(response.timestamp);
    this.statusMessage = response.message || this.statusMessage;

    if (response.status === 'COMPLETED') {
      this.isSubmitting = false;
      this.notificationService.showSuccess(`Transaction ${response.transactionId} completed`);
    } else if (response.status === 'FAILED' || response.status === 'CANCELLED') {
      this.isSubmitting = false;
      this.notificationService.showError(response.message || `Transaction ${response.transactionId} failed`);
    }
  }
}
