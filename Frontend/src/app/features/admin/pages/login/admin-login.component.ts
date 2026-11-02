import { LanguageService } from '../../../../core/services/language.service';
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
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-gray-200">
        <div class="flex justify-end"><button type="button" (click)="language.toggle()" class="rounded-full border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">{{ language.isEnglish() ? 'العربية' : 'English' }}</button></div>

        <div class="text-center space-y-2">
          <img src="assets/MAIN.jpg" [alt]="language.t('سوق وسفرة', 'Souq & Sofra')" class="w-16 h-16 rounded-full mx-auto border-2 border-primary/40 shadow-sm object-cover">
          <h1 class="text-2xl font-bold font-baloo text-primaryDark">{{ language.t('تسجيل دخول الإدارة', 'Admin sign in') }}</h1>
          <p class="text-xs text-gray-500">{{ language.t('لوحة تحكم مطعم ومخبز سوق وسفرة', 'Souq & Sofra restaurant and bakery dashboard') }}</p>
        </div>

        @if (errorMessage()) {
          <div class="p-3.5 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold text-center border border-red-100 flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form (ngSubmit)="handleLogin()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">{{ language.t('البريد الإلكتروني', 'Email address') }}</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="admin@souqsofra.com"
              class="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary text-sm dir-ltr text-right">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">{{ language.t('كلمة المرور', 'Password') }}</label>
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
              <span>{{ language.t('جاري التحقق...', 'Signing in...') }}</span>
            } @else {
              <span>{{ language.t('تسجيل الدخول', 'Sign in') }}</span>
            }
          </button>
        </form>

        <div class="pt-4 border-t border-gray-100 text-center">
          <a routerLink="/" class="text-xs text-gray-500 hover:text-primary font-medium">
            {{ language.t('← العودة للمتجر العام', '← Back to storefront') }}
          </a>
        </div>

      </div>
    </div>
  `
})
export class AdminLoginComponent {
  language = inject(LanguageService);
  private auth = inject(AuthService);
  private router = inject(Router);

  email = 'admin@souqsofra.com';
  password = '';
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  handleLogin() {
    if (!this.email || !this.password) {
      this.errorMessage.set(this.language.t('يرجى إدخال البريد الإلكتروني وكلمة المرور.', 'Please enter your email address and password.'));
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
          this.errorMessage.set(this.language.t('بيانات تسجيل الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.', 'Incorrect sign-in details. Check your email and password.'));
        } else if (err.status === 0) {
          this.errorMessage.set(this.language.t('تعذر الاتصال بالخادم. تأكد من تشغيل الواجهة الخلفية.', 'Could not connect to the server. Check that the backend is running.'));
        } else {
          this.errorMessage.set(this.language.isEnglish() ? 'An error occurred while signing in.' : (err.error?.message || 'حدث خطأ أثناء محاولة الدخول.'));
        }
      }
    });
  }
}
