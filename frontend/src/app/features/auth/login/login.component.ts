import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
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
  selector: 'app-login',
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
              <div class="mb-4 inline-flex rounded-full border border-teal-400/20 bg-teal-500/10 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-teal-300">Node Authentication</div>
              <h2 class="mb-2 text-3xl font-bold tracking-tight text-slate-50">Connect your identity</h2>
              <p class="m-0 text-sm leading-6 text-slate-400">Use your username or email to establish a server-side session. No local token storage. No client-side credential trust.</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="grid gap-4">
              <mat-form-field appearance="outline" class="tailwind-field w-full">
                <mat-label>Username or Email</mat-label>
                <input matInput formControlName="username" autocomplete="username">
                <mat-icon matSuffix class="!text-teal-300">mail_outline</mat-icon>
                <mat-error *ngIf="loginForm.get('username')?.hasError('required')">Username or email is required</mat-error>
                <mat-error *ngIf="loginForm.get('username')?.hasError('email')">Please enter a valid email address</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="tailwind-field w-full">
                <mat-label>Password</mat-label>
                <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="current-password">
                <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
              </mat-form-field>

              <div class="flex items-center justify-between gap-3 text-sm">
                <label class="flex items-center gap-2 text-slate-400">
                  <input type="checkbox" class="h-4 w-4 accent-teal-400" />
                  <span>Remember me</span>
                </label>
                <a href="javascript:void(0)" class="font-medium text-teal-300 hover:underline">Forgot password?</a>
              </div>

                <button mat-raised-button color="primary" type="submit" [disabled]="isLoading" class="!mt-2 !h-12 !rounded-xl !bg-gradient-to-r !from-cyan-500 !to-blue-600 !text-white !shadow-[0_10px_30px_rgba(37,99,235,0.28)]">
                <mat-spinner *ngIf="isLoading" diameter="20" color="accent"></mat-spinner>
                <span *ngIf="!isLoading">Sign In</span>
              </button>

              <div class="pt-2 text-center text-sm text-slate-400">
                <span>Don't have an account?</span>
                <a routerLink="/register" class="ml-1 font-semibold text-teal-300 hover:underline">Create one now</a>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <aside class="hidden rounded-[28px] border border-slate-700/70 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-8 text-slate-100 shadow-[0_25px_50px_rgba(2,6,23,0.35)] lg:flex lg:min-h-[540px] lg:flex-col lg:justify-between" aria-label="Application stack">
          <div>
            <div class="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-sky-300">Current Stack</div>
            <h3 class="mt-4 text-4xl font-bold tracking-tight text-slate-50">What powers this payment platform</h3>
            <p class="mt-3 max-w-xl text-sm leading-7 text-slate-400">The desktop panel now doubles as a compact system map for the stack behind authentication, realtime updates, and deployment.</p>
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  returnUrl = '/dashboard';
  readonly stackItems = [
    {
      icon: 'A21',
      category: 'Frontend',
      name: 'Angular 21',
      description: 'Standalone components and router-driven screens power the client entry flow.'
    },
    {
      icon: 'MAT',
      category: 'UI',
      name: 'Angular Material',
      description: 'Material form controls keep auth validation, feedback, and accessibility consistent.'
    },
    {
      icon: 'RX',
      category: 'State',
      name: 'RxJS',
      description: 'Reactive streams handle login requests, async state, and realtime client updates.'
    },
    {
      icon: 'J17',
      category: 'Backend',
      name: 'Java 17 + Spring Boot 3.4',
      description: 'The auth API and payment services run on a secured Spring backend.'
    },
    {
      icon: 'PG',
      category: 'Data',
      name: 'PostgreSQL + Flyway',
      description: 'Persistent auth and payment data live in PostgreSQL with migration-managed schema changes.'
    },
    {
      icon: 'OPS',
      category: 'Infra',
      name: 'RabbitMQ, JWT, Docker',
      description: 'Messaging, token security, and containerized deployment complete the platform stack.'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    this.authService.loadCurrentUser().pipe(take(1)).subscribe(user => {
      if (user) {
        this.router.navigate([this.returnUrl]);
      }
    });
  }

  onSubmit(): void {
    if (this.isLoading) {
      return;
    }

    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials)
      .pipe(
        finalize(() => {
          queueMicrotask(() => {
            this.isLoading = false;
          });
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Login successful!');
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
          this.notificationService.showError(errorMessage);
        }
      });
  }
}
