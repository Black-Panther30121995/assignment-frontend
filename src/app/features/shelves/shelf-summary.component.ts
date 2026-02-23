import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ShelfService } from '../../core/shelf.service';
import { DeviceService } from '../../core/device.service';
import { Shelf } from '../../models/shelf.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { SnackService } from '../../shared/snack.service';

@Component({
  standalone: true,
  selector: 'app-shelf-summary',
  imports: [NgIf, RouterLink, MatCardModule, MatButtonModule],
  template: `
    <mat-card *ngIf="shelf() as s">
      <div class="header">
        <h2>{{ s.shelfName }}</h2>
        <span class="spacer"></span>
        <a mat-stroked-button color="primary" [routerLink]="['/shelves', 'new']" [queryParams]="{shelfId: s.shelfId}">Edit</a>
        <button mat-stroked-button color="warn" (click)="deleteShelf(s.shelfId)">Delete</button>
      </div>
      <p><strong>Shelf ID:</strong> {{ s.shelfId }}</p>
      <p><strong>Part #:</strong> {{ s.partNumber }}</p>

      <div class="attach" *ngIf="attached() as a; else notAttached">
        <h3>Attached To</h3>
        <p>
          Device: <a [routerLink]="['/devices', a.deviceId]">{{ a.deviceName }}</a> &nbsp; | &nbsp;
          Position Index: #{{ a.positionIndex }}
        </p>
      </div>
      <ng-template #notAttached>
        <p>Not attached to any position.</p>
      </ng-template>
    </mat-card>

    <div *ngIf="!shelf()" class="center">Loading...</div>
  `,
  styles: [`
    .header { display:flex; align-items:center; margin-bottom: 8px; }
    .spacer { flex:1 1 auto; }
    .center { padding: 24px; text-align:center; }
    .attach { margin-top: 16px; padding: 12px; background:#f7fbff; border-left:4px solid #2196f3; }
  `]
})
export class ShelfSummaryComponent implements OnInit {
  shelf = signal<Shelf | null>(null);
  attached = signal<{ deviceId: string; deviceName: string; positionIndex: number } | null>(null);
  shelfId!: string;

  constructor(
    private route: ActivatedRoute,
    private shelves: ShelfService,
    private devices: DeviceService,
    private snack: SnackService,
    private router: Router
  ) {}

  ngOnInit() {
    this.shelfId = this.route.snapshot.paramMap.get('shelfId')!;
    this.shelves.getById(this.shelfId).subscribe({
      next: s => {
        this.shelf.set(s);
        // Discover attachment by scanning device views (works with your existing APIs)
        this.devices.list().subscribe({
          next: ds => {
            let found = false, idx = 0;
            const scan = () => {
              if (found || idx >= (ds?.length || 0)) return;
              this.devices.getView(ds[idx].deviceId).subscribe({
                next: dv => {
                  const pos = dv.positions.find(p => p.shelf?.shelfId === this.shelfId);
                  if (pos) {
                    found = true;
                    this.attached.set({
                      deviceId: dv.device.deviceId,
                      deviceName: dv.device.deviceName,
                      positionIndex: pos.index
                    });
                  }
                  idx++; scan();
                },
                error: _ => { idx++; scan(); }
              });
            };
            scan();
          }
        });
      }
    });
  }

  deleteShelf(id: string) {
    if (!confirm('Soft delete this shelf?')) return;
    this.shelves.delete(id).subscribe({
      next: _ => { this.snack.ok('Shelf deleted'); this.router.navigate(['/']); }
    });
  }
}