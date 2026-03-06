import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DeviceService, CreateDeviceRequest, UpdateDeviceRequest } from '../../core/device.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-device-form',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,NgIf],
  template: `
  <mat-card class="stack" style="max-width: 860px; margin-inline: auto;">
    <h2>{{ isEdit() ? 'Update Device' : 'Create Device' }}</h2>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="stack">
      <div class="grid-auto">
        <mat-form-field appearance="outline">
          <mat-label>Device Name</mat-label>
          <input matInput formControlName="deviceName" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Part Number</mat-label>
          <input matInput formControlName="partNumber" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Building Name</mat-label>
          <input matInput formControlName="buildingName" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Device Type</mat-label>
          <input matInput formControlName="deviceType" required>
        </mat-form-field>

        <!-- Shelf-related: disable in edit mode -->
        <mat-form-field appearance="outline">
          <mat-label>Number of Shelf Positions</mat-label>
          <input
            type="number"
            min="1"
            matInput
            formControlName="numberOfShelfPositions"
            [readonly]="isEdit()"
            [disabled]="isEdit()"
            required
          >
          <mat-hint *ngIf="isEdit()">Shelf positions cannot be updated after creation</mat-hint>
        </mat-form-field>
      </div>

      <div class="row">
        <button mat-raised-button color="primary" [disabled]="form.invalid || submitting()">Save</button>
        <button mat-button type="button" (click)="cancel()">Cancel</button>
        <span class="spacer"></span>
      </div>
    </form>
  </mat-card>
`,
  styles: [`
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    form { display:flex; flex-direction: column; gap: 16px; }
  `]
})
export class DeviceFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    deviceName: ['', Validators.required],
    partNumber: ['', Validators.required],
    buildingName: ['', Validators.required],
    deviceType: ['', Validators.required],
    numberOfShelfPositions: [1, [Validators.required, Validators.min(1)]],
  });

  isEdit = signal<boolean>(false);
  deviceId = signal<string | null>(null);
  submitting = signal<boolean>(false);

  constructor(
    private deviceService: DeviceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const idFromParam = this.route.snapshot.paramMap.get('deviceId');
    const idFromQuery = this.route.snapshot.queryParamMap.get('deviceId');
    const id = idFromParam || idFromQuery;

    if (id) {
      this.isEdit.set(true);
      this.deviceId.set(id);
      // Disable the control in edit mode for extra safety
      this.form.get('numberOfShelfPositions')?.disable({ emitEvent: false });

      this.deviceService.getView(id).subscribe({
        next: v => this.form.patchValue({
          deviceName: v.device.deviceName,
          partNumber: v.device.partNumber,
          buildingName: v.device.buildingName,
          deviceType: v.device.deviceType,
          numberOfShelfPositions: v.device.numberOfShelfPositions,
        })
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting.set(true);

    if (this.isEdit()) {
      // For update: exclude shelf-related field
      const { deviceName, partNumber, buildingName, deviceType } = this.form.getRawValue(); // getRawValue() returns disabled controls too
      const payload: UpdateDeviceRequest = { deviceName, partNumber, buildingName, deviceType } as UpdateDeviceRequest;

      this.deviceService.update(this.deviceId()!, payload).subscribe({
        next: d => {
          alert('Device updated');
          this.router.navigate(['/devices', (d as any).deviceId ?? this.deviceId()]);
        },
        error: _ => this.submitting.set(false)
      });
    } else {
      // For create: send full payload including shelf positions
      const payload = this.form.value as CreateDeviceRequest;
      this.deviceService.create(payload).subscribe({
        next: d => {
          alert('Device created');
          this.router.navigate(['/devices', (d as any).deviceId ?? this.deviceId()]);
        },
        error: _ => this.submitting.set(false)
      });
    }
  }

  cancel() { history.back(); }
}