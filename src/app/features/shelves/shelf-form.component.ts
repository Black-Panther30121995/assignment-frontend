import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ShelfService, CreateShelfRequest, UpdateShelfRequest } from '../../core/shelf.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-shelf-form',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
template: `
  <mat-card class="stack" style="max-width: 720px; margin-inline: auto;">
    <h2>{{ isEdit() ? 'Update Shelf' : 'Create Shelf' }}</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="stack">
      <div class="grid-auto">
        <mat-form-field appearance="outline">
          <mat-label>Shelf Name</mat-label>
          <input matInput formControlName="shelfName" required>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Part Number</mat-label>
          <input matInput formControlName="partNumber" required>
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
export class ShelfFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    shelfName: ['', Validators.required],
    partNumber: ['', Validators.required]
  });

  isEdit = signal<boolean>(false);
  shelfId = signal<string | null>(null);
  submitting = signal<boolean>(false);

  constructor(
    private shelves: ShelfService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('shelfId') || this.route.snapshot.queryParamMap.get('shelfId');
    if (id) {
      this.isEdit.set(true);
      this.shelfId.set(id);
      this.shelves.getById(id).subscribe({ next: s => this.form.patchValue(s) });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const payload = this.form.value as CreateShelfRequest | UpdateShelfRequest;

    const obs = this.isEdit()
      ? this.shelves.update(this.shelfId()!, payload)
      : this.shelves.create(payload);

    obs.subscribe({
      next: s => {
        alert(this.isEdit() ? 'Shelf updated' : 'Shelf created');
        this.router.navigate(['/shelves', (s as any).shelfId ?? this.shelfId()]);
      },
      error: _ => this.submitting.set(false)
    });
  }

  cancel() { history.back(); }
}