import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import {
  StoredItemCreate,
  StoredItemDto,
  StoredItemUpdate,
  StoredItemWithStorageRoom,
} from '../models/stored-item.model';
import { StorageRoom } from '../models/storage-room.model';
import { StorageRoomService } from './storage-room.service';

@Injectable({
  providedIn: 'root',
})
export class StoredItemService {
  private apiUrl = 'http://localhost:8001/storeditems';

  private storedItemCache = new Map<string, Observable<StoredItemDto>>();

  constructor(
    private http: HttpClient,
    private storageRoomService: StorageRoomService
  ) {}

  getStoredItemById(id: string): Observable<StoredItemDto> {
    if (this.storedItemCache.has(id)) {
      return this.storedItemCache.get(id)!;
    } else {
      const storedItem$ = this.http
        .get<StoredItemDto>(`${this.apiUrl}/${id}`)
        .pipe(catchError(this.handleError), shareReplay(1));
      this.storedItemCache.set(id, storedItem$);
      return storedItem$;
    }
  }

  getAllStoredItems(): Observable<StoredItemDto[]> {
    const allStoredItemsUrl = `${this.apiUrl}`;
    return this.http
      .get<StoredItemDto[]>(allStoredItemsUrl)
      .pipe(catchError(this.handleError), shareReplay(1));
  }

  createStoredItem(storedItem: StoredItemCreate): Observable<StoredItemDto> {
    return this.http
      .post<StoredItemDto>(this.apiUrl, storedItem)
      .pipe(catchError(this.handleError));
  }

  // Update an existing stored item
  updateStoredItem(
    id: string,
    storedItem: StoredItemUpdate
  ): Observable<StoredItemDto> {
    const url = `${this.apiUrl}/${id}`;
    return this.http
      .put<StoredItemDto>(url, storedItem)
      .pipe(catchError(this.handleError));
  }

  // Delete a stored item
  deleteStoredItem(id: string): Observable<StoredItemDto> {
    const url = `${this.apiUrl}/${id}`;
    return this.http
      .delete<StoredItemDto>(url)
      .pipe(catchError(this.handleError));
  }

  getAllStoredItemsWithDetails(): Observable<StoredItemWithStorageRoom[]> {
    return this.http.get<StoredItemDto[]>(this.apiUrl).pipe(
      catchError(this.handleError),
      switchMap((storedItems: StoredItemDto[]) => {
        const uniqueStorageRoomIds = Array.from(
          new Set(storedItems.map((item) => item.storageroom_id))
        );
        const storageRoomObservables: Observable<StorageRoom>[] =
          uniqueStorageRoomIds.map((id) =>
            this.storageRoomService.getStorageRoomById(id)
          );
        return forkJoin(storageRoomObservables).pipe(
          map((storageRooms: StorageRoom[]) => {
            const storageRoomMap = new Map<string, StorageRoom>();
            storageRooms.forEach((room) => storageRoomMap.set(room.id, room));

            return storedItems.map((item) => ({
              ...item,
              storageRoom: storageRoomMap.get(item.storageroom_id),
            }));
          })
        );
      })
    );
  }

  clearCache(): void {
    this.storedItemCache.clear();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage =
      'An unknown error occurred while fetching the stored item!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error (${error.status}): ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }
}
