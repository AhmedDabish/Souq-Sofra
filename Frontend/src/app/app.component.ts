import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from './features/public/components/header/header.component';
import { BottomNavComponent } from './features/public/components/bottom-nav/bottom-nav.component';
import { ApiService } from './core/services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, HeaderComponent, BottomNavComponent],
  template: `
    @if (!isAdminRoute()) {
      <app-header></app-header>
    }

    <main class="min-h-screen pb-16 md:pb-0">
      <router-outlet></router-outlet>
    </main>

    @if (!isAdminRoute()) {
      <app-bottom-nav></app-bottom-nav>

      <!-- Polished Souq & Sofra footer -->
      <footer class="relative overflow-hidden bg-[#21170f] text-white pb-20 pt-10 md:pb-8 md:pt-14">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#fbb042] via-[#f58229] to-[#fbb042]"></div>
        <div class="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#f58229]/10 blur-3xl"></div>
        <div class="container-wide relative mx-auto px-4 md:px-6">
          <div class="grid grid-cols-1 gap-9 border-b border-white/10 pb-9 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            <div class="space-y-4 sm:col-span-2 lg:col-span-4">
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-white p-1 shadow-lg shadow-[#f58229]/20 ring-2 ring-[#f58229]/70">
                  <img [src]="logoUrl()" alt="شعار سوق وسفرة" class="h-14 w-14 rounded-full object-cover">
                </div>
                <div>
                  <span class="block text-xl font-bold font-baloo text-[#fbb042]">سوق وسفرة</span>
                  <span class="mt-0.5 block text-xs text-white/60">Good Food, Good Mood</span>
                </div>
              </div>
              <p class="max-w-sm text-sm leading-7 text-white/70">
                مطعم ومخبز يقدم أشهى الفطائر المشلتتة، المناقيش، الحلويات الشرقية والخبز الطازج يومياً.
              </p>
              <a routerLink="/menu" class="inline-flex items-center rounded-full bg-[#f58229] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#fbb042] hover:text-[#21170f]">
                اكتشف المنيو <span class="ms-2" aria-hidden="true">←</span>
              </a>
            </div>

            <div class="lg:col-span-2">
              <h4 class="mb-4 text-sm font-bold text-[#fbb042]">روابط سريعة</h4>
              <ul class="space-y-3 text-sm text-white/70">
                <li><a routerLink="/menu" class="transition hover:text-white">منيو سوق وسفرة</a></li>
                <li><a routerLink="/contact" class="transition hover:text-white">فروعنا وأوقات العمل</a></li>
                <li><a routerLink="/cart" class="transition hover:text-white">سلة المشتريات</a></li>
                <li><a routerLink="/cart" class="transition hover:text-white">إرسال الطلب</a></li>
              </ul>
            </div>

            <div class="lg:col-span-3">
              <h4 class="mb-4 text-sm font-bold text-[#fbb042]">تواصل معنا</h4>
              <ul class="space-y-3 text-sm leading-6 text-white/70">
                <li class="flex gap-2"><span class="text-[#f58229]" aria-hidden="true">⌖</span><span>أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين</span></li>
                <li><a href="tel:026333136" class="transition hover:text-white">الهاتف: 02 633 3136</a></li>
                <li><a href="https://wa.me/971503157884" class="transition hover:text-white" target="_blank" rel="noopener noreferrer">واتساب: +971 50 315 7884</a></li>
              </ul>
            </div>

            <div class="lg:col-span-3">
              <h4 class="mb-4 text-sm font-bold text-[#fbb042]">طرق الدفع</h4>
              <p class="mb-4 text-sm leading-6 text-white/70">الدفع نقداً عند الاستلام أو استلام الطلب من الفرع.</p>
              <div class="flex flex-wrap gap-2 text-xs text-white/80">
                <span class="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">نقداً عند الاستلام</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center justify-between gap-3 pt-6 text-center text-xs text-white/50 md:flex-row md:text-start">
            <span>جميع الحقوق محفوظة © سوق وسفرة 2026</span>
            <span>Souq & Sofra · Good Food, Good Mood</span>
          </div>
        </div>
      </footer>
    }
  `
})
export class AppComponent implements OnInit {
  private api = inject(ApiService);
  logoUrl = signal('assets/MAIN.jpg');
  ngOnInit() {
    this.api.getSettings().subscribe({ next: settings => {
      const value = settings['StoreLogo'];
      if (value) this.logoUrl.set(/^https?:\/\//i.test(value) || value.startsWith('assets/') ? value : `http://localhost:2811${value.startsWith('/') ? value : `/${value}`}`);
    }, error: () => {} });
  }
  private router = inject(Router);

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
