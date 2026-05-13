import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RxStompState } from '@stomp/rx-stomp';

/**
 * Component for displaying WebSocket connection status.
 */
@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div
      class="fixed bottom-3 right-3 z-[1000] flex min-w-[172px] cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 text-sm font-semibold shadow-2xl backdrop-blur md:bottom-5 md:right-5 md:px-4 md:py-3"
      [ngClass]="statusClasses"
      [matTooltip]="tooltipText">
      <span class="h-3 w-3 shrink-0 rounded-full bg-current shadow-[0_0_18px_currentColor]"></span>
      <mat-icon class="!h-[18px] !w-[18px] !text-[18px]">{{ statusIcon }}</mat-icon>
      <div class="hidden flex-col gap-px md:flex">
        <span class="text-[0.68rem] uppercase tracking-[0.12em] text-slate-200/70">Mesh link</span>
        <span class="whitespace-nowrap">{{ statusText }}</span>
      </div>
    </div>
  `
})
export class ConnectionStatusComponent {
  @Input() connectionState: RxStompState | null = null;

  get statusClasses(): string {
    if (this.isConnected) {
      return 'border-emerald-400/20 bg-emerald-950/60 text-emerald-200';
    }

    if (this.isConnecting) {
      return 'border-amber-400/20 bg-amber-950/60 text-amber-200 animate-pulse';
    }

    if (this.isDisconnected) {
      return 'border-rose-400/20 bg-rose-950/60 text-rose-200';
    }

    return 'border-slate-400/20 bg-slate-900/70 text-slate-200';
  }

  get isConnected(): boolean {
    return this.connectionState === RxStompState.OPEN;
  }

  get isConnecting(): boolean {
    return this.connectionState === RxStompState.CONNECTING;
  }

  get isDisconnected(): boolean {
    return this.connectionState === RxStompState.CLOSED || 
           this.connectionState === RxStompState.CLOSING;
  }

  get statusIcon(): string {
    switch (this.connectionState) {
      case RxStompState.OPEN:
        return 'wifi';
      case RxStompState.CONNECTING:
        return 'wifi_find';
      case RxStompState.CLOSED:
      case RxStompState.CLOSING:
        return 'wifi_off';
      default:
        return 'help_outline';
    }
  }

  get statusText(): string {
    switch (this.connectionState) {
      case RxStompState.OPEN:
        return 'Connected';
      case RxStompState.CONNECTING:
        return 'Connecting...';
      case RxStompState.CLOSED:
        return 'Disconnected';
      case RxStompState.CLOSING:
        return 'Disconnecting...';
      default:
        return 'Unknown';
    }
  }

  get tooltipText(): string {
    switch (this.connectionState) {
      case RxStompState.OPEN:
        return 'WebSocket connection is active. Real-time updates enabled.';
      case RxStompState.CONNECTING:
        return 'Establishing WebSocket connection...';
      case RxStompState.CLOSED:
        return 'WebSocket connection is closed. Real-time updates disabled.';
      case RxStompState.CLOSING:
        return 'Closing WebSocket connection...';
      default:
        return 'WebSocket connection status unknown.';
    }
  }
}
