import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-primaryDark text-white flex flex-col justify-between p-6 shrink-0 min-h-screen">
      <div>
        <!-- Brand Header -->
        <div class="flex items-center gap-3 pb-6 border-b border-white/10 mb-6">
          <img src="assets/MAIN.jpg" alt="سوق وسفرة" class="w-11 h-11 rounded-full border border-primary/40 object-cover shadow-xs">
          <div>
            <h2 class="font-bold text-sm font-baloo text-primaryLight tracking-wide">سوق وسفرة الإدارة</h2>
            <span class="text-[10px] text-gray-400 block">لوحة التحكم السحابية</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1.5 font-medium text-xs">
          <a routerLink="/admin" 
             routerLinkActive="bg-primary text-white font-bold shadow-md" 
             [routerLinkActiveOptions]="{exact: true}"
             class="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-300 hover:bg-white/5 transition-all">
            <span class="text-base">📊</span>
            <span>لوحة المؤشرات العامة</span>
          </a>

          <a routerLink="/admin/products" 
             routerLinkActive="bg-primary text-white font-bold shadow-md" 
             class="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-300 hover:bg-white/5 transition-all">
            <span class="text-base">🍔</span>
            <span>إدارة الأصناف والمنيو</span>
          </a>

          <a routerLink="/admin/orders" 
             routerLinkActive="bg-primary text-white font-bold shadow-md" 
             class="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-300 hover:bg-white/5 transition-all">
            <span class="text-base">📦</span>
            <span>إدارة الطلبات المباشرة</span>
          </a>

          <a routerLink="/admin/settings" 
             routerLinkActive="bg-primary text-white font-bold shadow-md" 
             class="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-300 hover:bg-white/5 transition-all">
            <span class="text-base">⚙️</span>
            <span>إعدادات المتجر والفروع</span>
          </a>
        </nav>
      </div>

      <!-- Bottom Profile & Logout -->
      <div class="space-y-4 pt-6 border-t border-white/10">
        <!-- Current User Info -->
        <div class="flex items-center gap-3 px-2">
          <div class="w-8 h-8 rounded-full bg-primary/20 text-primaryLight font-bold flex items-center justify-center text-xs">
            👤
          </div>
          <div class="overflow-hidden">
            <div class="text-xs font-bold text-gray-200 truncate">{{ auth.currentUser()?.fullName || 'مدير النظام' }}</div>
            <div class="text-[10px] text-gray-400 truncate">{{ auth.currentUser()?.email || 'admin@souqsofra.com' }}</div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2 px-1">
          <a routerLink="/" class="text-[11px] text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <span>←</span>
            <span>المتجر العام</span>
          </a>

          <button (click)="logout()" class="text-[11px] text-red-400 hover:text-red-300 font-bold transition-colors flex items-center gap-1">
            <span>🚪</span>
            <span>خروج</span>
          </button>
        </div>
      </div>
    </aside>
  `
})
export class AdminSidebarComponent {
  auth = inject(AuthService);

  logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      this.auth.logout();
    }
  }
}
