import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <mat-card class="rounded-[28px] border border-slate-700/60 bg-slate-900/90 shadow-[0_24px_70px_rgba(2,6,23,0.34)]">
        <mat-card-header class="!p-8 !pb-4">
          <mat-card-title class="!mb-2 !text-3xl !font-bold !tracking-tight !text-slate-50">Admin Dashboard</mat-card-title>
        </mat-card-header>
        <mat-card-content class="!px-8 !pb-8 !pt-2">
          <p class="m-0 text-base text-slate-400">Admin dashboard component - Coming soon!</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AdminDashboardComponent {}
