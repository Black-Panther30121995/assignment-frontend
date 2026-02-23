import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PositionView } from '../models/position-view.model';

@Injectable({ providedIn: 'root' })
export class PositionService {
  private base = `${environment.apiBaseUrl}/api/positions`;
  constructor(private http: HttpClient) {}
  byDevice(deviceId: string) { return this.http.get<PositionView[]>(`${this.base}/by-device/${deviceId}`); }
  get(spId: string) { return this.http.get<PositionView>(`${this.base}/${spId}`); }
  delete(spId: string) { return this.http.delete<void>(`${this.base}/${spId}`); }
}