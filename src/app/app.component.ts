import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { HealthService } from './core/health.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatSnackBarModule, NgIf
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <span class="brand" routerLink="/">Assignment</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/">Devices</a>
      <a mat-button routerLink="/devices/new">Create Device</a>
      <a mat-button routerLink="/shelves/new">Create Shelf</a>

      <span class="spacer"></span>
      <ng-container *ngIf="healthService.health() as h">
        <mat-chip-set>
          <mat-chip [color]="h.neo4jConnectivity ? 'accent' : 'warn'" selected>
            <mat-icon>{{ h.neo4jConnectivity ? 'check_circle' : 'error' }}</mat-icon>
            Neo4j: {{ h.neo4jConnectivity ? 'Connected' : 'Unavailable' }}
          </mat-chip>
        </mat-chip-set>
      </ng-container>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .app-toolbar { position: sticky; top: 0; z-index: 10; }
    .brand { font-weight: 600; cursor: pointer; }
    .spacer { flex: 1 1 auto; }
  `]
})
export class AppComponent {

  healthService = inject(HealthService);

  constructor() {
    this.healthService.load();
  }
}