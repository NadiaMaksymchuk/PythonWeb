export enum SecurityEventType {
  ALERT = 'intrusion',
  WARNING = 'equipment_failure',
  INFO = 'anomaly',
}

export interface SecurityEventBase {
  event_type: SecurityEventType;
  description?: string;
}

export interface SecurityEventCreate extends SecurityEventBase {
  stored_item_id: string;
}

export interface SecurityEventUpdate {
  event_type?: SecurityEventType;
  description?: string;
  stored_item_id?: string;
}

export interface SecurityEventDto extends SecurityEventBase {
  id: string;
  datetime: string;
  user_id: string;
  stored_item_id?: string;
  storedItemName?: string;
  storedItemClassification?: string;
}
