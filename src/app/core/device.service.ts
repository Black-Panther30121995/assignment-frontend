import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Device } from '../models/device.model';
import { DeviceView } from '../models/device-view.model';

export interface CreateDeviceRequest {
  deviceName: string;
  partNumber: string;
  buildingName: string;
  deviceType: string;
  numberOfShelfPositions: number;
}
export interface UpdateDeviceRequest extends CreateDeviceRequest {}

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private base = `${environment.apiBaseUrl}/api/devices`;
  constructor(private http: HttpClient) {}
  list() { return this.http.get<Device[]>(this.base); }
  create(req: CreateDeviceRequest) { return this.http.post<Device>(this.base, req); }
  getView(deviceId: string) { return this.http.get<DeviceView>(`${this.base}/${deviceId}/view`); }
  update(deviceId: string, req: UpdateDeviceRequest) { return this.http.put<Device>(`${this.base}/${deviceId}`, req); }
  delete(deviceId: string) { return this.http.delete<void>(`${this.base}/${deviceId}`); }
}