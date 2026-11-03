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
  public currentUser = signal<{ fullName: string; email: string; role: string; permissions: string[] } | null>(this.getUser());

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        if (res && res.token) {
          localStorage.setItem(this.tokenKey, res.token);
          const user = { fullName: res.fullName, email: res.email, role: res.role, permissions: res.permissions ?? this.defaultPermissions(res.role) };
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

  private defaultPermissions(role: string): string[] {
    const catalog = ['dashboard.view','orders.view','orders.create','orders.update','orders.delete','products.view','products.create','products.update','products.delete','categories.view','categories.create','categories.update','categories.delete','addons.view','addons.create','addons.update','addons.delete','settings.view','settings.update','media.upload','branches.view','branches.create','branches.update','branches.delete','users.view','users.create','users.update','users.delete'];
    if (role === 'SuperAdmin') return catalog;
    if (role === 'Admin') return catalog.filter(permission => !permission.startsWith('users.') || permission === 'users.view');
    if (role === 'User') return ['orders.view','orders.update'];
    return [];
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    return user?.role === 'SuperAdmin' || !!user?.permissions?.includes(permission);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private getUser(): { fullName: string; email: string; role: string; permissions: string[] } | null {
    const raw = localStorage.getItem(this.userKey);
    try {
      const user = raw ? JSON.parse(raw) : null;
      return user ? { ...user, permissions: Array.isArray(user.permissions) ? user.permissions : this.defaultPermissions(user.role) } : null;
    } catch {
      return null;
    }
  }
}
