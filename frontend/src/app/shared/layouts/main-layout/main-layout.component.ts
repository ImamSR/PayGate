import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';

import { HeaderComponent } from '../../components/header/header.component';
import { SidenavComponent } from '../../components/sidenav/sidenav.component';
import { ConnectionStatusComponent } from '../../components/connection-status/connection-status.component';
import { NotificationComponent } from '../../components/notification/notification.component';

import { WebSocketService } from '../../../core/services/websocket.service';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    HeaderComponent,
    SidenavComponent,
    ConnectionStatusComponent,
    NotificationComponent
  ],
  template: `
    <div class="relative flex min-h-screen w-full flex-col bg-[#030712] text-slate-100">
      <div class="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_90%)]"></div>
      <div class="pointer-events-none fixed -left-[100px] -top-[120px] z-0 h-[420px] w-[420px] animate-[orb-float_11s_ease-in-out_infinite_alternate] rounded-full bg-cyan-400/10 blur-[90px]"></div>
      <div class="pointer-events-none fixed -bottom-[140px] -right-[140px] z-0 h-[420px] w-[420px] animate-[orb-float_13s_ease-in-out_infinite_alternate] rounded-full bg-indigo-500/10 blur-[90px]"></div>

      <app-header 
        class="relative z-[2]"
        (menuToggle)="toggleSidenav()"
        [isAuthenticated]="(authState$ | async) ?? false"
        [user]="user$ | async">
      </app-header>

      <mat-sidenav-container class="relative z-[1] flex-1 bg-transparent">
        <mat-sidenav 
          #sidenav 
          mode="over" 
          class="w-[296px] border-r border-slate-700/40 bg-transparent"
          [opened]="sidenavOpened">
          <app-sidenav 
            [isAuthenticated]="(authState$ | async) ?? false"
            [user]="user$ | async"
            (navigate)="closeSidenav()">
          </app-sidenav>
        </mat-sidenav>

        <mat-sidenav-content class="block bg-transparent px-3 pb-4 md:px-6 md:pb-6">
          <div class="relative z-[1] min-h-full animate-[content-enter_600ms_ease-out_both]">
            <router-outlet></router-outlet>
          </div>
          
          <app-connection-status
            *ngIf="wsService.isRealtimeActive()"
            [connectionState]="wsService.connectionState$ | async">
          </app-connection-status>
          
          <app-notification></app-notification>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    @keyframes content-enter {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes orb-float {
      from {
        transform: translate3d(0, 0, 0) scale(1);
      }
      to {
        transform: translate3d(24px, -18px, 0) scale(1.06);
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  sidenavOpened = false;
  readonly authState$: Observable<boolean>;
  readonly user$: Observable<User | null>;

  constructor(
    public authService: AuthService,
    public wsService: WebSocketService
  ) {
    this.authState$ = this.authService.authState$;
    this.user$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  closeSidenav(): void {
    this.sidenavOpened = false;
  }
}
