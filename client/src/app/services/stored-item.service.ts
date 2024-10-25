import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { StoredItemDto } from '../models/stored-item.model';

@Injectable({
  providedIn: 'root',
})
export class StoredItemService {
  private apiUrl = 'http://localhost:8001/storeditems';

  private storedItemCache = new Map<string, Observable<StoredItemDto>>();

  constructor(private http: HttpClient) {}

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
