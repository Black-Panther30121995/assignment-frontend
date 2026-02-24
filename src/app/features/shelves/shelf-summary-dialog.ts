import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-shelf-summary-dialog',
  imports: [
    MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Open Shelf Summary</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Enter Shelf ID</mat-label>
          <input matInput formControlName="shelfId" placeholder="SHELF-xxxx-uuid">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="go()">Open</button>
    </mat-dialog-actions>
  `,
  styles: [`.w-100 { width: 100%; }`]
})
export class ShelfSummaryDialog {
  private fb = inject(FormBuilder);
  form = this.fb.group({ shelfId: ['', Validators.required] });

  constructor(private ref: MatDialogRef<ShelfSummaryDialog>) {}

  go() { this.ref.close(this.form.value.shelfId); }
  close() { this.ref.close(); }
}