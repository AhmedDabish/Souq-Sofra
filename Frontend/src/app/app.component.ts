import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './features/public/components/header/header.component';
import { CartDrawerComponent } from './features/public/components/cart-drawer/cart-drawer.component';
import { BottomNavComponent } from './features/public/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, CartDrawerComponent, BottomNavComponent],
  template: `
    @if (!isAdminRoute()) {
      <app-header></app-header>
    }

    <main class="min-h-screen pb-16 md:pb-0">
      <router-outlet></router-outlet>
    </main>

    @if (!isAdminRoute()) {
      <app-cart-drawer></app-cart-drawer>
      <app-bottom-nav></app-bottom-nav>

      <!-- Footer matching More-In style -->
      <footer class="bg-[#2d2013] text-white pt-12 pb-20 md:pb-8 border-t border-primary/20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
            
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <img src="assets/MAIN.jpg" alt="سوق وسفرة" class="w-12 h-12 rounded-full border border-primary/40">
                <span class="text-xl font-bold font-baloo text-primary">سوق وسفرة</span>
              </div>
              <p class="text-xs text-gray-300 leading-relaxed">
                مطعم ومخبز يقدم أشهى الفطائر المشلتتة، المناقيش، الحلويات الشرقية والخبز الطازج يومياً.
              </p>
            </div>

            <div>
              <h4 class="font-bold text-sm text-primary mb-3">روابط سريعة</h4>
              <ul class="text-xs space-y-2 text-gray-300">
                <li><a routerLink="/menu" class="hover:text-primary">منيو سوق وسفرة</a></li>
                <li><a routerLink="/contact" class="hover:text-primary">فروعنا وأوقات العمل</a></li>
                <li><a routerLink="/checkout" class="hover:text-primary">إتمام الطلب</a></li>
                <li><a routerLink="/admin/login" class="hover:text-primary">دخول الإدارة</a></li>
              </ul>
            </div>

            <div>
              <h4 class="font-bold text-sm text-primary mb-3">بيانات التواصل</h4>
              <p class="text-xs text-gray-300">أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين</p>
              <p class="text-xs text-gray-300 mt-2">الهاتف: 02 633 3136</p>
              <p class="text-xs text-gray-300">واتساب: +971 50 315 7884</p>
            </div>

            <div>
              <h4 class="font-bold text-sm text-primary mb-3">طرق الدفع المتاحة</h4>
              <p class="text-xs text-gray-300">الدفع عند الاستلام (كاش)، بطاقات الائتمان فيزا وماستركارد، وأبل باي.</p>
            </div>

          </div>

          <div class="pt-6 text-center text-xs text-gray-400">
            جميع الحقوق محفوظة © سوق وسفرة 2026 - Souq & Sofra (Good Food, Good Mood)
          </div>
        </div>
      </footer>
    }
  `
})
export class AppComponent {
  private router = inject(Router);

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
