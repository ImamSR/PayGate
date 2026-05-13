import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { WebSocketService } from './core/services/websocket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnDestroy {
  title = 'WebSocket Payment Service';

  constructor(private wsService: WebSocketService) {}

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }
}
