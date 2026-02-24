import { Component, OnInit, signal } from '@angular/core';
import { ShelfService } from '../../core/shelf.service';
import { Shelf } from '../../models/shelf.model';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-shelves-list',
  imports: [NgIf, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <mat-card>
      <div class="header">
        <h2>Shelves</h2>
        <span class="spacer"></span>
        <a mat-raised-button color="primary" routerLink="/shelves/new"><mat-icon>add</mat-icon> Create Shelf</a>
      </div>

      <div *ngIf="loading()" class="center"><mat-spinner diameter="42"></mat-spinner></div>

      <table mat-table [dataSource]="shelves() || []" *ngIf="!loading()">
        <ng-container matColumnDef="shelfName">
          <th mat-header-cell *matHeaderCellDef> Name </th>
          <td mat-cell *matCellDef="let s">{{ s.shelfName }}</td>
        </ng-container>
        <ng-container matColumnDef="partNumber">
          <th mat-header-cell *matHeaderCellDef> Part # </th>
          <td mat-cell *matCellDef="let s">{{ s.partNumber }}</td>
        </ng-container>
        <ng-container matColumnDef="shelfId">
          <th mat-header-cell *matHeaderCellDef> Shelf ID </th>
          <td mat-cell *matCellDef="let s">{{ s.shelfId }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let s">
            <a mat-button color="primary" [routerLink]="['/shelves', s.shelfId]">
              <mat-icon>visibility</mat-icon> Summary
            </a>
            <a mat-button color="primary" [routerLink]="['/shelves', 'new']" [queryParams]="{shelfId: s.shelfId}">
              <mat-icon>edit</mat-icon> Edit
            </a>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols;"></tr>
      </table>

      <p *ngIf="!loading() && (!shelves() || shelves()!.length === 0)" class="muted">
        No shelves found. Create one to get started.
      </p>
    </mat-card>
  `,
  styles: [`
    .header { display:flex; align-items:center; }
    .spacer { flex: 1 1 auto; }
    .center { display:flex; justify-content:center; padding: 24px; }
    .muted { opacity: 0.7; padding: 12px; }
    table { width: 100%; }
  `]
})
export class ShelvesListComponent implements OnInit {
  cols = ['shelfName', 'partNumber', 'shelfId', 'actions'];
  shelves = signal<Shelf[] | null>(null);
  loading = signal<boolean>(false);

  constructor(private shelfService: ShelfService) {}

  ngOnInit() {
    this.loading.set(true);
    this.shelfService.list().subscribe({
      next: list => { this.shelves.set(list); this.loading.set(false); },
      error: _ => this.loading.set(false)
    });
  }
}