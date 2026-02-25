import { Component, Inject, OnInit, inject, signal, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ShelfService } from '../../core/shelf.service';
import { DeviceService } from '../../core/device.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { NgIf, NgFor } from '@angular/common';
import { Shelf } from '../../models/shelf.model';

@Component({
  standalone: true,
  imports: [
    MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatAutocompleteModule, MatOptionModule, NgIf, NgFor
  ],
  template: `
    <h2 mat-dialog-title>Attach Shelf</h2>
    <div mat-dialog-content>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Select Shelf</mat-label>
        <input type="text" matInput [formControl]="filterCtrl" [matAutocomplete]="auto" placeholder="Search by name / id / part #">
        <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSelect($event.option.value)">
          <mat-option *ngFor="let s of filteredShelves()" [value]="s.shelfId" [disabled]="attachedSet().has(s.shelfId)">
            <div class="option">
              <span class="name">{{ s.shelfName }}</span>
              <span class="muted">({{ s.shelfId }})</span>
              <span class="muted">• {{ s.partNumber }}</span>
              <span class="pill" *ngIf="attachedSet().has(s.shelfId)">attached</span>
            </div>
          </mat-option>
        </mat-autocomplete>
      </mat-form-field>

      <div *ngIf="selectedShelf() as s" class="preview">
        <p><strong>{{ s.shelfName }}</strong> <span class="muted">({{ s.shelfId }})</span></p>
        <p>Part #: {{ s.partNumber }}</p>
      </div>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!selectedShelf()" (click)="attach()">Attach</button>
    </div>
  `,
  styles: [`
    .w-100{width:100%}
    .option { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
    .name { font-weight:600; }
    .muted { opacity:0.7; }
    .pill { font-size:11px; padding:1px 6px; border-radius:10px; background:#fff3e0; color:#e65100; }
    .preview{padding:8px;border-left:4px solid #3f51b5;background:#f5f7ff;margin-top:8px}
  `]
})
export class AttachShelfDialog implements OnInit {
  private fb = inject(FormBuilder);
  private shelvesApi = inject(ShelfService);
  private devicesApi = inject(DeviceService);

  filterCtrl = new FormControl<string>('', { nonNullable: true });
  shelves = signal<Shelf[]>([]);
  attachedSet = signal<Set<string>>(new Set());
  selectedId = signal<string | null>(null);

  selectedShelf = computed(() => {
    const id = this.selectedId();
    return id ? this.shelves().find(s => s.shelfId === id) ?? null : null;
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { shelfPositionId: string },
    private ref: MatDialogRef<AttachShelfDialog>
  ) {}

  ngOnInit() {
    this.shelvesApi.list().subscribe({ next: list => this.shelves.set(list || []) });


    this.devicesApi.list().subscribe({
      next: devices => {
        const set = new Set<string>();
        let idx = 0;
        const scan = () => {
          if (!devices || idx >= devices.length) { this.attachedSet.set(set); return; }
          this.devicesApi.getView(devices[idx].deviceId).subscribe({
            next: dv => {
              dv.positions.forEach(p => { if (p.shelf) set.add(p.shelf.shelfId); });
              idx++; scan();
            },
            error: _ => { idx++; scan(); }
          });
        };
        scan();
      }
    });
  }

  filteredShelves = computed(() => {
    const q = this.filterCtrl.value?.toLowerCase().trim() ?? '';
    if (!q) return this.shelves();
    return this.shelves().filter(s =>
      s.shelfName.toLowerCase().includes(q) ||
      s.shelfId.toLowerCase().includes(q) ||
      s.partNumber.toLowerCase().includes(q)
    );
  });

  onSelect(shelfId: string) {
    if (this.attachedSet().has(shelfId)) return;
    this.selectedId.set(shelfId);
  }

  attach() {
    const id = this.selectedId();
    if (!id) return;
    this.shelvesApi.attach(this.data.shelfPositionId, id).subscribe({
      next: _ => this.ref.close(true)
    });
  }

  close() { this.ref.close(false); }
}