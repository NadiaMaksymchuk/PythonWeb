export enum OccupancyStatus {
  Empty = 'empty',
  PartiallyFilled = 'partially_filled',
  Full = 'full',
}

export interface StorageRoom {
  id: string;
  room_type: string;
  location: string;
  occupancy_status: OccupancyStatus;
  description?: string;
}
