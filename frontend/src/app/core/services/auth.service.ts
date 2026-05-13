import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string | null;
  refreshToken: string | null;
  expiresIn: number;
  user: User;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$ = this.authStateSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    })
      .pipe(
        tap(response => {
          this.setSession(response.user);
        }),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, userData, {
      responseType: 'text'
    })
      .pipe(
        catchError(error => {
          console.error('Registration failed:', {
            status: error.status,
            message: error.message,
            error: error.error
          });
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      error: () => {
        // Local logout should still complete even if the server revoke call fails.
      }
    });
    this.clearSessionState();
    this.authStateSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, {}, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.setSession(response.user);
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  loadCurrentUser(forceReload = false): Observable<User | null> {
    if (!forceReload && this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }

    return this.http.get<User>(`${environment.apiUrl}/auth/me`, {
      withCredentials: true
    }).pipe(
      tap(user => {
        this.setSession(user);
      }),
      catchError(() => {
        this.clearSessionState();
        return of(null);
      })
    );
  }

  isAuthenticatedSnapshot(): boolean {
    return this.authStateSubject.value;
  }

  getCurrentUserSnapshot(): User | null {
    return this.currentUserSubject.value;
  }

  private setSession(user: User): void {
    this.authStateSubject.next(true);
    this.currentUserSubject.next(user);
  }

  private clearSessionState(): void {
    this.authStateSubject.next(false);
    this.currentUserSubject.next(null);
  }
}
