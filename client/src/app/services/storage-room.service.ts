// src/app/services/storage-room.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { StorageRoom } from '../models/storage-room.model';

@Injectable({
  providedIn: 'root',
})
export class StorageRoomService {
  private apiUrl = 'http://localhost:8001/storagerooms';
  private storageRoomCache = new Map<string, Observable<StorageRoom>>();

  constructor(private http: HttpClient) {}

  getAllStorageRooms(): Observable<StorageRoom[]> {
    const url = `${this.apiUrl}/`;
    return this.http
      .get<StorageRoom[]>(url)
      .pipe(catchError(this.handleError), shareReplay(1));
  }

  getStorageRoomById(id: string): Observable<StorageRoom> {
    const storageRoom$ = this.http
      .get<StorageRoom>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError), shareReplay(1));
    this.storageRoomCache.set(id, storageRoom$);
    return storageRoom$;
  }

  createStorageRoom(
    storageroom: Partial<StorageRoom>
  ): Observable<StorageRoom> {
    return this.http
      .post<StorageRoom>(this.apiUrl, storageroom)
      .pipe(catchError(this.handleError));
  }

  updateStorageRoom(
    id: string,
    storageroom: Partial<StorageRoom>
  ): Observable<StorageRoom> {
    return this.http
      .put<StorageRoom>(`${this.apiUrl}/${id}`, storageroom)
      .pipe(catchError(this.handleError));
  }

  deleteStorageRoom(id: string): Observable<StorageRoom> {
    return this.http
      .delete<StorageRoom>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    // Handle different error scenarios here
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Server Error (${error.status}): ${error.message}`;
    }
    // Optionally, you can use a remote logging infrastructure
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }
}
