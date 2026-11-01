import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'souq_sofra_admin_token';
  private userKey = 'souq_sofra_admin_user';

  public isAuthenticated = signal<boolean>(this.hasToken());
  public currentUser = signal<{ fullName: string; email: string; role: string } | null>(this.getUser());

  constructor(private router: Router) {}

  login(email: string, password: string):boolean {
    // Default credentials as specified in README & SeedData
    if (email === 'admin@souqsofra.com' && password === 'Admin@123456') {
      const mockToken = 'mock_jwt_token_' + Date.now();
      const user = { fullName: 'مدير النظام (Admin)', email, role: 'Admin' };
      
      localStorage.setItem(this.tokenKey, mockToken);
      localStorage.setItem(this.userKey, JSON.stringify(user));

      this.isAuthenticated.set(true);
      this.currentUser.set(user);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/admin/login']);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private getUser() {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }
}
