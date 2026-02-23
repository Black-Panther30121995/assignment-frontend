import { Component, OnInit, signal } from '@angular/core';
import { DeviceService } from '../../core/device.service';
import { Device } from '../../models/device.model';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-devices-list',
  imports: [NgIf, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <mat-card>
      <div class="header">
        <h2>Devices</h2>
        <span class="spacer"></span>
        <a mat-raised-button color="primary" routerLink="/devices/new"><mat-icon>add</mat-icon> Create Device</a>
        <a mat-stroked-button color="primary" routerLink="/shelves/new" class="ml-8"><mat-icon>add_box</mat-icon> Create Shelf</a>
      </div>

      <div *ngIf="loading()" class="center"><mat-spinner diameter="42"></mat-spinner></div>

      <table mat-table [dataSource]="devices() || []" *ngIf="!loading()">
        <ng-container matColumnDef="deviceName">
          <th mat-header-cell *matHeaderCellDef> Name </th>
          <td mat-cell *matCellDef="let d">{{ d.deviceName }}</td>
        </ng-container>
        <ng-container matColumnDef="partNumber">
          <th mat-header-cell *matHeaderCellDef> Part # </th>
          <td mat-cell *matCellDef="let d">{{ d.partNumber }}</td>
        </ng-container>
        <ng-container matColumnDef="buildingName">
          <th mat-header-cell *matHeaderCellDef> Building </th>
          <td mat-cell *matCellDef="let d">{{ d.buildingName }}</td>
        </ng-container>
        <ng-container matColumnDef="deviceType">
          <th mat-header-cell *matHeaderCellDef> Type </th>
          <td mat-cell *matCellDef="let d">{{ d.deviceType }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let d">
            <a mat-button color="primary" [routerLink]="['/devices', d.deviceId]"><mat-icon>visibility</mat-icon> Summary</a>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols;"></tr>
      </table>

      <p *ngIf="!loading() && (!devices() || devices()!.length === 0)" class="muted">
        No devices found. Create one to get started.
      </p>
    </mat-card>
  `,
  styles: [`
    .header { display:flex; align-items:center; }
    .spacer { flex: 1 1 auto; }
    .center { display:flex; justify-content:center; padding: 24px; }
    .ml-8 { margin-left: 8px; }
    .muted { opacity: 0.7; padding: 12px; }
    table { width: 100%; }
  `]
})
export class DevicesListComponent implements OnInit {
  cols = ['deviceName', 'partNumber', 'buildingName', 'deviceType', 'actions'];
  devices = signal<Device[] | null>(null);
  loading = signal<boolean>(false);

  constructor(private deviceService: DeviceService) {}
  ngOnInit() {
    this.loading.set(true);
    this.deviceService.list().subscribe({
      next: ds => { this.devices.set(ds); this.loading.set(false); },
      error: _ => this.loading.set(false)
    });
  }
}