import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <mat-card class="w-full max-w-md rounded-[28px] border border-slate-700/60 bg-slate-900/90 p-10 text-center shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
        <mat-card-content class="!p-0">
          <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-300">
            <mat-icon class="!h-[72px] !w-[72px] !text-[72px]">error_outline</mat-icon>
          </div>
          <h1 class="m-0 mb-4 text-3xl font-bold tracking-tight text-slate-50">404 - Page Not Found</h1>
          <p class="m-0 mb-6 text-sm leading-6 text-slate-400">The page you're looking for doesn't exist.</p>
          
          <ng-container *ngIf="authState$ | async; else loginLink">
            <button mat-raised-button color="primary" routerLink="/dashboard" class="!rounded-xl !bg-gradient-to-r !from-cyan-500 !to-blue-600 !px-6 !py-2 !text-white">
              Go To Dashboard
            </button>
          </ng-container>
          <ng-template #loginLink>
            <button mat-raised-button color="primary" routerLink="/login" class="!rounded-xl !bg-gradient-to-r !from-cyan-500 !to-blue-600 !px-6 !py-2 !text-white">
              Go To Login
            </button>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class NotFoundComponent implements OnInit {
  readonly authState$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.authState$ = this.authService.authState$;
  }

  ngOnInit(): void {
    // Proactively check session so the buttons render correctly
    this.authService.loadCurrentUser().pipe(take(1)).subscribe();
  }
}

