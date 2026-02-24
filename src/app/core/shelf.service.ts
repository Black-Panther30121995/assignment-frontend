import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Shelf } from '../models/shelf.model';

export interface CreateShelfRequest { shelfName: string; partNumber: string; }
export interface UpdateShelfRequest extends CreateShelfRequest {}

@Injectable({ providedIn: 'root' })
export class ShelfService {
  private base = `${environment.apiBaseUrl}/api/shelves`;
  constructor(private http: HttpClient) {}

  list() { return this.http.get<Shelf[]>(this.base); }              

  create(req: CreateShelfRequest) { return this.http.post<Shelf>(this.base, req); }
  getById(shelfId: string) { return this.http.get<Shelf>(`${this.base}/${shelfId}`); }
  update(shelfId: string, req: UpdateShelfRequest) { return this.http.put<Shelf>(`${this.base}/${shelfId}`, req); }
  delete(shelfId: string) { return this.http.delete<void>(`${this.base}/${shelfId}`); }

  attach(shelfPositionId: string, shelfId: string) {
    const params = new HttpParams().set('shelfPositionId', shelfPositionId).set('shelfId', shelfId);
    return this.http.post<void>(`${this.base}/attach`, null, { params });
  }
  detach(shelfPositionId: string) {
    const params = new HttpParams().set('shelfPositionId', shelfPositionId);
    return this.http.delete<void>(`${this.base}/detach`, { params });
  }
}