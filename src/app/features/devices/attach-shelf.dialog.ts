import { Component, Inject, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ShelfService } from '../../core/shelf.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { Shelf } from '../../models/shelf.model';

@Component({
  standalone: true,
  imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NgIf],
  template: `
    <h2 mat-dialog-title>Attach Shelf</h2>
    <div mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Shelf ID</mat-label>
          <input matInput formControlName="shelfId" placeholder="e.g. SHELF-xxxx-uuid">
        </mat-form-field>
      </form>

      <div *ngIf="preview() as s" class="preview">
        <p><strong>{{ s.shelfName }}</strong> ({{ s.shelfId }})</p>
        <p>Part #: {{ s.partNumber }}</p>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-stroked-button (click)="previewShelf()">Preview</button>
      <button mat-raised-button color="primary" [disabled]="!preview()" (click)="attach()">Attach</button>
      <button mat-button (click)="close()">Cancel</button>
    </div>
  `,
  styles: [`.w-100{width:100%}.preview{padding:8px;border-left:4px solid #3f51b5;background:#f5f7ff;margin-top:8px}`]
})
export class AttachShelfDialog {
  private fb = inject(FormBuilder);

  form = this.fb.group({ shelfId: ['', Validators.required] });
  preview = signal<Shelf | null>(null);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { shelfPositionId: string },
    private ref: MatDialogRef<AttachShelfDialog>,
    private shelfService: ShelfService
  ) {}

  previewShelf() {
    const id = this.form.value.shelfId!.trim();
    if (!id) return;
    this.shelfService.getById(id).subscribe({
      next: s => this.preview.set(s),
      error: _ => this.preview.set(null)
    });
  }
  attach() {
    if (!this.preview()) return;
    this.shelfService.attach(this.data.shelfPositionId, this.preview()!.shelfId).subscribe({
      next: _ => this.ref.close(true)
    });
  }
  close() { this.ref.close(false); }
}