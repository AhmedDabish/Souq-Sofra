import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:2811/api';

  private readonly tokenKey = 'souq_sofra_admin_token';
  private readonly userKey = 'souq_sofra_admin_user';

  public isAuthenticated = signal<boolean>(this.hasToken());
  public currentUser = signal<{ fullName: string; email: string; role: string } | null>(this.getUser());

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        if (res && res.token) {
          localStorage.setItem(this.tokenKey, res.token);
          const user = { fullName: res.fullName, email: res.email, role: res.role };
          localStorage.setItem(this.userKey, JSON.stringify(user));
          this.isAuthenticated.set(true);
          this.currentUser.set(user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private getUser(): { fullName: string; email: string; role: string } | null {
    const raw = localStorage.getItem(this.userKey);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
