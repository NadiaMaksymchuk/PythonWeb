import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  SecurityEventDto,
  SecurityEventCreate,
  SecurityEventUpdate,
} from '../models/security-event.model';

@Injectable({
  providedIn: 'root',
})
export class SecurityEventService {
  private apiUrl = 'http://localhost:8001/securityevents';

  constructor(private http: HttpClient) {}

  getSecurityEvents(): Observable<SecurityEventDto[]> {
    return this.http
      .get<SecurityEventDto[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getSecurityEventById(id: string): Observable<SecurityEventDto> {
    return this.http
      .get<SecurityEventDto>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createSecurityEvent(
    event: SecurityEventCreate
  ): Observable<SecurityEventDto> {
    return this.http
      .post<SecurityEventDto>(this.apiUrl, event)
      .pipe(catchError(this.handleError));
  }

  updateSecurityEvent(
    id: string,
    event: SecurityEventUpdate
  ): Observable<SecurityEventDto> {
    return this.http
      .put<SecurityEventDto>(`${this.apiUrl}/${id}`, event)
      .pipe(catchError(this.handleError));
  }

  deleteSecurityEvent(id: string): Observable<SecurityEventDto> {
    return this.http
      .delete<SecurityEventDto>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Server Error (${error.status}): ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }
}
