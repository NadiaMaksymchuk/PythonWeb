import { StorageRoom } from './storage-room.model';

export interface StoredItemCreate {
  name: string;
  classification: string;
  description?: string;
  storageroom_id: string;
}

export interface StoredItemUpdate {
  name?: string;
  classification?: string;
  description?: string;
  storageroom_id?: string;
}

export interface StoredItemDto {
  id: string;
  name: string;
  classification: string;
  description?: string;
  storageroom_id: string;
}

export interface StoredItemWithStorageRoom extends StoredItemDto {
  storageRoom?: StorageRoom;
}
