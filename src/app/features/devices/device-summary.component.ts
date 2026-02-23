import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DeviceService } from '../../core/device.service';
import { DeviceView } from '../../models/device-view.model';
import { ShelfService } from '../../core/shelf.service';
import { SnackService } from '../../shared/snack.service';
import { NgIf, NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AttachShelfDialog } from './attach-shelf.dialog';

@Component({
  standalone: true,
  selector: 'app-device-summary',
  imports: [NgIf, NgFor, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatListModule, MatDialogModule],
  template: `
    <mat-card *ngIf="view() as v">
      <div class="header">
        <h2>{{ v.device.deviceName }}</h2>
        <span class="spacer"></span>
        <a mat-stroked-button color="primary" [routerLink]="['/devices', 'new']" [queryParams]="{deviceId: v.device.deviceId}">
          <mat-icon>edit</mat-icon> Edit
        </a>
        <button mat-stroked-button color="warn" (click)="deleteDevice(v.device.deviceId)">
          <mat-icon>delete</mat-icon> Delete
        </button>
      </div>
      <div class="grid">
        <mat-card>
          <h3>Details</h3>
          <p><strong>Part #:</strong> {{ v.device.partNumber }}</p>
          <p><strong>Building:</strong> {{ v.device.buildingName }}</p>
          <p><strong>Type:</strong> {{ v.device.deviceType }}</p>
          <p><strong>Shelf Positions:</strong> {{ v.device.numberOfShelfPositions }}</p>
        </mat-card>

        <mat-card>
          <h3>Shelf Positions</h3>
          <mat-nav-list>
            <a mat-list-item *ngFor="let p of v.positions">
              <div class="pos-row">
                <span class="index">#{{ p.index }}</span>
                <ng-container *ngIf="p.shelf; else addBtn">
                  <span class="shelf">{{ p.shelf!.shelfName }} ({{ p.shelf!.shelfId }})</span>
                  <span class="spacer"></span>
                  <a mat-button color="primary" [routerLink]="['/shelves', p.shelf!.shelfId]"><mat-icon>open_in_new</mat-icon> Shelf</a>
                  <button mat-button color="warn" (click)="detach(p.shelfPositionId)">Detach</button>
                </ng-container>
                <ng-template #addBtn>
                  <span class="muted">Empty</span>
                  <span class="spacer"></span>
                  <button mat-raised-button color="primary" (click)="openAttachDialog(p.shelfPositionId)">
                    <mat-icon>add_link</mat-icon> Attach Shelf
                  </button>
                </ng-template>
              </div>
            </a>
          </mat-nav-list>
        </mat-card>
      </div>
    </mat-card>

    <div *ngIf="!view()" class="center"><mat-icon>hourglass_empty</mat-icon> Loading...</div>
  `,
  styles: [`
    .header { display:flex; align-items:center; margin-bottom: 16px; }
    .spacer { flex: 1 1 auto; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
    .pos-row { display:flex; align-items:center; width:100%; gap:12px; }
    .index { font-weight: 600; width: 48px; }
    .shelf { font-weight: 500; }
    .muted { opacity: 0.7; }
    .center { padding: 24px; display:flex; justify-content:center; align-items:center; gap:8px; }
  `]
})
export class DeviceSummaryComponent implements OnInit {
  view = signal<DeviceView | null>(null);
  deviceId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService,
    private shelfService: ShelfService,
    private dialog: MatDialog,
    private snack: SnackService
  ) {}

  ngOnInit() {
    this.deviceId = this.route.snapshot.paramMap.get('deviceId')!;
    this.reload();
  }

  reload() {
    this.deviceService.getView(this.deviceId).subscribe({ next: v => this.view.set(v) });
  }

  openAttachDialog(shelfPositionId: string) {
    this.dialog.open(AttachShelfDialog, { data: { shelfPositionId }})
      .afterClosed().subscribe(ok => { if (ok) { this.snack.ok('Shelf attached'); this.reload(); } });
  }

  detach(shelfPositionId: string) {
    this.shelfService.detach(shelfPositionId).subscribe({
      next: _ => { this.snack.ok('Shelf detached'); this.reload(); }
    });
  }

  deleteDevice(id: string) {
    if (!confirm('Soft delete this device?')) return;
    this.deviceService.delete(id).subscribe({
      next: _ => { this.snack.ok('Device deleted'); this.router.navigate(['/']); }
    });
  }
}