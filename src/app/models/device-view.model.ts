import { Device } from './device.model';
import { PositionView } from './position-view.model';

export interface DeviceView {
  device: Device;
  positions: PositionView[];
}