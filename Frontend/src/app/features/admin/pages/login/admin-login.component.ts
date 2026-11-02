import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-cairo" dir="rtl">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-gray-200">
        
        <div class="text-center space-y-2">
          <img src="assets/MAIN.jpg" alt="سوق وسفرة" class="w-16 h-16 rounded-full mx-auto border-2 border-primary/40 shadow-sm object-cover">
          <h1 class="text-2xl font-bold font-baloo text-primaryDark">تسجيل دخول الإدارة</h1>
          <p class="text-xs text-gray-500">لوحة تحكم مطعم ومخبز سوق وسفرة</p>
        </div>

        @if (errorMessage()) {
          <div class="p-3.5 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold text-center border border-red-100 flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form (ngSubmit)="handleLogin()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email"
              required
              placeholder="admin@souqsofra.com"
              class="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary text-sm dir-ltr text-right">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">كلمة المرور</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary text-sm dir-ltr text-right">
          </div>

          <button 
            type="submit" 
            [disabled]="isLoading()"
            class="w-full py-3.5 rounded-2xl bg-primary hover:bg-primaryHover disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
            @if (isLoading()) {
              <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>جاري التحقق...</span>
            } @else {
              <span>تسجيل الدخول</span>
            }
          </button>
        </form>

        <div class="pt-4 border-t border-gray-100 text-center">
          <a routerLink="/" class="text-xs text-gray-500 hover:text-primary font-medium">
            ← العودة للمتجر العام
          </a>
        </div>

      </div>
    </div>
  `
})
export class AdminLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = 'admin@souqsofra.com';
  password = '';
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  handleLogin() {
    if (!this.email || !this.password) {
      this.errorMessage.set('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate([this.auth.currentUser()?.role === 'User' ? '/admin/orders' : '/admin']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('بيانات تسجيل الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.');
        } else if (err.status === 0) {
          this.errorMessage.set('تعذر الاتصال بـ API Backend (تأكد من تشغيل سيرفر .NET على المنفذ 2811).');
        } else {
          this.errorMessage.set(err.error?.message || 'حدث خطأ أثناء محاولة الدخول.');
        }
      }
    });
  }
}
