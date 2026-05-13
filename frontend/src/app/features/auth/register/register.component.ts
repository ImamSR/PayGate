import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  template: `
    <div class="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.04)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div class="pointer-events-none absolute -left-36 top-[-180px] h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -right-20 bottom-[-120px] h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl"></div>

      <div class="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:px-6 lg:gap-16">
        <mat-card class="rounded-[28px] border border-slate-700/70 bg-slate-900/90 text-slate-100 shadow-[0_25px_60px_rgba(2,6,23,0.45)]">
          <mat-card-content class="!p-6 md:!p-8">
            <div class="mb-7">
              <div class="mb-4 inline-flex rounded-full border border-teal-400/20 bg-teal-500/10 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-teal-300">Identity Issuance</div>
              <h2 class="mb-2 text-3xl font-bold tracking-tight text-slate-50">Register a network user</h2>
              <p class="m-0 text-sm leading-6 text-slate-400">Create a basic user account. Administrative access remains backend-controlled and is never exposed through public registration.</p>
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="grid gap-4">
              <mat-form-field appearance="outline" class="tailwind-field w-full">
                <mat-label>Username*</mat-label>
                <input matInput formControlName="username" autocomplete="username">
                <mat-icon matSuffix class="!text-teal-300">person_outline</mat-icon>
                <mat-error *ngIf="registerForm.get('username')?.hasError('required')">Username is required</mat-error>
                <mat-error *ngIf="registerForm.get('username')?.hasError('minlength')">Username must be at least 3 characters</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="tailwind-field w-full">
                <mat-label>Email Address*</mat-label>
                <input matInput formControlName="email" type="email" autocomplete="email">
                <mat-icon matSuffix class="!text-teal-300">mail_outline</mat-icon>
                <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
                <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email address</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="tailwind-field w-full">
                <mat-label>Password*</mat-label>
                <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="new-password">
                <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</mat-error>
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || isLoading" class="!mt-2 !h-12 !rounded-xl !bg-gradient-to-r !from-cyan-500 !to-blue-600 !text-white !shadow-[0_10px_30px_rgba(37,99,235,0.28)]">
                <mat-spinner *ngIf="isLoading" diameter="20" color="accent"></mat-spinner>
                <span *ngIf="!isLoading">Register Account</span>
              </button>

              <div class="pt-2 text-center text-sm text-slate-400">
                <span>Already have an account?</span>
                <a routerLink="/login" class="ml-1 font-semibold text-teal-300 hover:underline">Sign in here</a>
              </div>

              <div class="text-center text-xs leading-6 text-slate-500">
                By creating an account, you agree to our
                <a href="javascript:void(0)" class="text-slate-300 underline">Terms of Service</a> and
                <a href="javascript:void(0)" class="text-slate-300 underline">Privacy Policy</a>.
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <aside class="hidden rounded-[28px] border border-slate-700/70 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-8 text-slate-100 shadow-[0_25px_50px_rgba(2,6,23,0.35)] lg:flex lg:min-h-[540px] lg:flex-col lg:justify-between" aria-label="Application stack">
          <div>
            <div class="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-sky-300">Tech Overview</div>
            <h3 class="mt-4 text-4xl font-bold tracking-tight text-slate-50">Ship the first screen with real platform context</h3>
            <p class="mt-3 max-w-xl text-sm leading-7 text-slate-400">The registration view now uses the spare desktop area to highlight the exact frontend, backend, security, and infrastructure stack behind the product.</p>
          </div>

          <div class="mt-8 grid gap-4 lg:grid-cols-2">
            <article class="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-5" *ngFor="let item of stackItems">
              <div class="mb-4 flex items-center justify-between gap-3">
                <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sm font-semibold text-sky-300">{{ item.icon }}</span>
                <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-teal-300">{{ item.category }}</span>
              </div>
              <strong class="block text-base text-slate-50">{{ item.name }}</strong>
              <p class="mt-2 text-sm leading-6 text-slate-400">{{ item.description }}</p>
            </article>
          </div>
        </aside>
      </div>
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
    ::ng-deep .tailwind-field input {
      color: #e2e8f0 !important;
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  readonly stackItems = [
    {
      icon: 'A21',
      category: 'Frontend',
      name: 'Angular 21',
      description: 'Standalone Angular screens drive authentication and the client-side dashboard flow.'
    },
    {
      icon: 'MAT',
      category: 'UI',
      name: 'Angular Material',
      description: 'Material inputs, buttons, and feedback patterns keep the onboarding experience consistent.'
    },
    {
      icon: 'WS',
      category: 'Realtime',
      name: 'STOMP + RxJS',
      description: 'Reactive WebSocket messaging supports live payment state after authenticated entry.'
    },
    {
      icon: 'SB',
      category: 'Backend',
      name: 'Spring Boot 3.4',
      description: 'Registration and secured domain logic run through the Java 17 backend service layer.'
    },
    {
      icon: 'DB',
      category: 'Data',
      name: 'PostgreSQL + Flyway',
      description: 'User and payment data stay in PostgreSQL with migration-based schema management.'
    },
    {
      icon: 'OPS',
      category: 'Platform',
      name: 'JWT, RabbitMQ, Docker',
      description: 'Auth security, messaging, and containerized deployment round out the production stack.'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.authService.loadCurrentUser().pipe(take(1)).subscribe(user => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit(): void {
    if (!this.registerForm.valid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    const userData = this.registerForm.value;

    this.authService.register(userData)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.isLoading = false;
          }, 0);
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Registration successful! Please login.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          const errorMessage = typeof error.error === 'string'
            ? error.error
            : (error.error?.message || 'Registration failed. Please try again.');
          this.notificationService.showError(errorMessage);
        }
      });
  }
}
