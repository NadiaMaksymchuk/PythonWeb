import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, interval } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface LoginResponse {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://localhost:8001';
  private loggedIn = new BehaviorSubject<boolean>(false);
  public isLoggedIn = this.loggedIn.asObservable();
  public userRole: string | null = null;
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  refreshSubscription: any;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      this.loggedIn.next(!!accessToken);
      if (accessToken) {
        const payload = this.parseJwt(accessToken);
        //this.userRole = payload?.role || null;
        this.scheduleTokenRefresh();
      }
    }
  }

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/customer`, user);
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/auth/admin/login`, credentials)
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token', response.access);
            this.loggedIn.next(true);
            //this.userRole = response.user.role;
          }
        })
      );
  }

  userLogin(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/auth/customer/login`, credentials)
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token', response.access);
            this.loggedIn.next(true);
            //this.userRole = response.user.role;
          }
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      this.loggedIn.next(false);
      this.userRole = null;
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  adminAuth(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<any>(`${this.authUrl}/auth/admin`, { headers }).pipe(
      map(response => response.email)
    );
  }

  customerAuth(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<any>(`${this.authUrl}/auth/customer`, { headers }).pipe(
      map(response => response.email)
    );
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  refreshAccessToken(): Observable<LoginResponse> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError('Not running in the browser');
    }

    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      this.logout();
      return throwError('No refresh token available');
    }

    const body = { refresh: refreshToken };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(`${this.authUrl}/auth/refresh`, body, { headers }).pipe(
      tap(response => {
        this.storeTokens(response.access);
      }),
      catchError(error => {
        console.error('Refresh token failed:', error);
        this.logout();
        return throwError(error);
      })
    );
  }

  // Helper method to store tokens
  private storeTokens(accessToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    this.loggedIn.next(true);

    const payload = this.parseJwt(accessToken);
    this.userRole = payload?.role || null;
  }

  // Schedule periodic token refresh
  private scheduleTokenRefresh(): void {
    // Clear any existing subscriptions
    this.unscheduleTokenRefresh();

    // Set the interval to 10 minutes (600,000 milliseconds)
    this.refreshSubscription = interval(400000).subscribe(() => {
      this.refreshAccessToken().subscribe({
        next: () => {
          console.log('Token refreshed successfully');
        },
        error: (err) => {
          console.error('Failed to refresh token:', err);
        }
      });
    });
  }

  // Unschedule token refresh
  private unscheduleTokenRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.detail && error.error.detail.message) {
      // Backend error message
      errorMessage = error.error.detail.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return throwError(errorMessage);
  }

  private parseJwt(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Failed to parse JWT:', e);
      return null;
    }
  }
}