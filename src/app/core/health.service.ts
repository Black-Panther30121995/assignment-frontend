import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Health {
  app: string;
  neo4jConnectivity: boolean;
  neo4jMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private _health = signal<Health | null>(null);
  health = this._health.asReadonly();

  constructor(private http: HttpClient) {}
  load() {
    this.http.get<Health>(`${environment.apiBaseUrl}/api/health`).subscribe({
      next: h => this._health.set(h),
      error: _ => this._health.set({ app: 'ok', neo4jConnectivity: false, neo4jMessage: null })
    });
  }
}