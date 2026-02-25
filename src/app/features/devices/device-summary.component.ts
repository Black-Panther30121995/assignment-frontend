import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DeviceService } from '../../core/device.service';
import { DeviceView } from '../../models/device-view.model';
import { ShelfService } from '../../core/shelf.service';
import { NgIf, NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AttachShelfDialog } from './attach-shelf.dialog';

@Component({
  standalone: true,
  selector: 'app-device-summary',
  imports: [NgIf, NgFor, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule],
// template
template: `
  <mat-card *ngIf="view() as v" class="stack">
    <div class="row">
      <h2 class="section-title">{{ v.device.deviceName }}</h2>
      <span class="spacer"></span>
      <a mat-stroked-button color="primary" [routerLink]="['/devices', 'new']" [queryParams]="{deviceId: v.device.deviceId}">
        <mat-icon>edit</mat-icon> Edit
      </a>
      <button mat-stroked-button color="warn" (click)="deleteDevice(v.device.deviceId)">
        <mat-icon>delete</mat-icon> Delete
      </button>
    </div>

    <div class="grid-auto">
      <mat-card class="stack mat-elevation-z1">
        <h3 class="section-title">Details</h3>
        <div class="row" style="justify-content: space-between;"><span class="muted">Part #</span><span>{{ v.device.partNumber }}</span></div>
        <div class="row" style="justify-content: space-between;"><span class="muted">Building</span><span>{{ v.device.buildingName }}</span></div>
        <div class="row" style="justify-content: space-between;"><span class="muted">Type</span><span>{{ v.device.deviceType }}</span></div>
        <div class="row" style="justify-content: space-between;"><span class="muted">Shelf Positions</span><span>{{ v.device.numberOfShelfPositions }}</span></div>
      </mat-card>
    </div>

    <mat-card class="stack mat-elevation-z1">
      <h3 class="section-title">Shelf Positions</h3>
      <div class="grid-auto">
        <mat-card class="stack" *ngFor="let p of v.positions">
          <div class="row" style="justify-content: space-between;">
            <span class="muted">#{{ p.index }}</span>
            <span class="status" [class.empty]="!p.shelf">{{ p.shelf ? 'Occupied' : 'Empty' }}</span>
          </div>

          <div>
            <ng-container *ngIf="p.shelf; else empty">
              <div style="font-weight:600;">{{ p.shelf!.shelfName }}</div>
              <div class="muted" style="font-size:12px;">{{ p.shelf!.shelfId }}</div>
            </ng-container>
            <ng-template #empty>
              <div class="muted">No shelf attached</div>
            </ng-template>
          </div>

          <div class="actions-row">
            <button *ngIf="!p.shelf" mat-raised-button color="primary" (click)="openAttachDialog(p.shelfPositionId)">
              <mat-icon>add_link</mat-icon> Attach Shelf
            </button>

            <a *ngIf="p.shelf" mat-stroked-button color="primary" [routerLink]="['/shelves', p.shelf!.shelfId]">
              <mat-icon>open_in_new</mat-icon> Open Shelf
            </a>

            <button *ngIf="p.shelf" mat-stroked-button color="warn" (click)="detach(p.shelfPositionId)">
              <mat-icon>link_off</mat-icon> Detach
            </button>
          </div>
        </mat-card>
      </div>
    </mat-card>
  </mat-card>

  <div *ngIf="!view()" class="center"><mat-icon>hourglass_empty</mat-icon> Loading...</div>
`,
  styles: [`
    .status {
    font-size: 12px; padding: 2px 8px; border-radius: 10px;
    background: #e8f5e9; color:#1b5e20;
  }
  .status.empty {
    background:#fff3e0; color:#e65100;
  }
    .device-summary { display:flex; flex-direction:column; gap:16px; }
    .header { display:flex; align-items:center; gap:8px; }
    .spacer { flex:1 1 auto; }

    .details-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px; }
    .detail-card { padding:50px; }
    .kv { display:flex; justify-content:space-between; padding:4px 0; gap:8px; }
    .kv span:first-child { opacity:0.75; }

    .positions { padding:50px; }
    .positions-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:12px; }

    .pos-card { display:flex; flex-direction:column; gap:8px; padding:12px; }
    .pos-header { display:flex; align-items:center; justify-content:space-between; }
    .index { font-weight:600; }
    .status { font-size:12px; padding:2px 8px; border-radius:10px; background:#e8f5e9; color:#1b5e20; }
    .status.empty { background:#fff3e0; color:#e65100; }

    .pos-body .shelf-name { font-weight:600; }
    .pos-body .shelf-id { font-size:12px; opacity:0.8; }

    .actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
    .muted { opacity:0.7; }

    .center { padding:24px; display:flex; justify-content:center; align-items:center; gap:8px; }
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
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.deviceId = this.route.snapshot.paramMap.get('deviceId')!;
    this.reload();
  }

  reload() { this.deviceService.getView(this.deviceId).subscribe({ next: v => this.view.set(v) }); }

  openAttachDialog(shelfPositionId: string) {
    this.dialog.open(AttachShelfDialog, { data: { shelfPositionId }})
      .afterClosed().subscribe(ok => { if (ok) this.reload(); });
  }

  detach(shelfPositionId: string) {
    this.shelfService.detach(shelfPositionId).subscribe({ next: _ => this.reload() });
  }

  deleteDevice(id: string) {
    if (!confirm('Soft delete this device?')) return;
    this.deviceService.delete(id).subscribe({ next: _ => this.router.navigate(['/']) });
  }
}
