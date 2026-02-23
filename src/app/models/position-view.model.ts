import { Shelf } from './shelf.model';
export interface PositionView {
  shelfPositionId: string;
  index: number;
  shelf: Shelf | null;
}