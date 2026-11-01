import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './features/public/components/header/header.component';
import { CartDrawerComponent } from './features/public/components/cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, CartDrawerComponent],
  template: `
    <app-header></app-header>
    <main class="min-h-screen">
      <router-outlet></router-outlet>
    </main>
    <app-cart-drawer></app-cart-drawer>

    <!-- Footer matching More-In style -->
    <footer class="bg-[#2d2013] text-white pt-12 pb-8 border-t border-primary/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <img src="assets/MAIN.jpg" alt="Logo" class="w-12 h-12 rounded-full border border-primary/40">
              <span class="text-xl font-bold font-baloo text-primary">سوق وسفرة</span>
            </div>
            <p class="text-xs text-gray-300 leading-relaxed">
              مطعم ومخبز يقدم أشهى الفطائر المشلتتة، المناقيش، الحلويات الشرقية والخبز الطازج يومياً.
            </p>
          </div>

          <div>
            <h4 class="font-bold text-sm text-primary mb-3">روابط سريعة</h4>
            <ul class="text-xs space-y-2 text-gray-300">
              <li><a href="#" class="hover:text-primary">منيو سوق وسفرة</a></li>
              <li><a href="#" class="hover:text-primary">عروض اليوم</a></li>
              <li><a href="#" class="hover:text-primary">فروعنا وأوقات العمل</a></li>
              <li><a href="#" class="hover:text-primary">الشروط والأحكام</a></li>
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
          جميع الحقوق محفوظة © سوق وسفرة 2026 - Souq & Sofra
        </div>
      </div>
    </footer>
  `
})
export class AppComponent {}
