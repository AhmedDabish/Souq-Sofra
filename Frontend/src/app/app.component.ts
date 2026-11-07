import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, RouterOutlet, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from './features/public/components/header/header.component';
import { BottomNavComponent } from './features/public/components/bottom-nav/bottom-nav.component';
import { LanguageService } from './core/services/language.service';
import { ApiService } from './core/services/api.service';
import { NotificationHostComponent } from './core/components/notification-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, HeaderComponent, BottomNavComponent, NotificationHostComponent],
  template: `
    @if (!isAdminRoute()) {
      @if (announcement() || announcementEn()) {
        <div class="bg-[#32120e] px-4 py-2 text-center text-xs font-semibold text-amber-100" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">{{ language.isEnglish() ? (announcementEn() || announcement()) : (announcement() || announcementEn()) }}</div>
      }
      <app-header></app-header>
    }

    <main class="min-h-screen pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <router-outlet></router-outlet>
    </main>
    <app-notification-host></app-notification-host>

    @if (!isAdminRoute()) {
      <app-bottom-nav></app-bottom-nav>

      <!-- Polished Souq & Sofra footer -->
      <footer [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'" class="relative overflow-hidden bg-[#21170f] text-white pb-20 pt-10 md:pb-8 md:pt-14">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#fbb042] via-[#f58229] to-[#fbb042]"></div>
        <div class="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#f58229]/10 blur-3xl"></div>
        <div class="container-wide relative mx-auto px-4 md:px-6">
          <div class="grid grid-cols-1 gap-9 border-b border-white/10 pb-9 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            <div class="space-y-4 sm:col-span-2 lg:col-span-4">
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-white p-1 shadow-lg shadow-[#f58229]/20 ring-2 ring-[#f58229]/70">
                  <img [src]="logoUrl()" [alt]="language.t('شعار سوق وسفرة', 'Souq & Sofra logo')" class="h-14 w-14 rounded-full object-cover">
                </div>
                <div>
                  <span class="block text-xl font-bold font-baloo text-[#fbb042]">{{ language.t('سوق وسفرة', 'Souq & Sofra') }}</span>
                  <span class="mt-0.5 block text-xs text-white/60">Good Food, Good Mood</span>
                </div>
              </div>
              <p class="max-w-sm text-sm leading-7 text-white/70">
                {{ language.t('مطعم ومخبز يقدم أشهى الفطائر المشلتتة، المناقيش، الحلويات الشرقية والخبز الطازج يومياً.', 'A restaurant and bakery serving fresh feteer, manakeesh, oriental sweets, and bread every day.') }}
              </p>
              <a routerLink="/menu" class="inline-flex items-center rounded-full bg-[#f58229] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#fbb042] hover:text-[#21170f]">
                {{ language.t('اكتشف المنيو', 'Explore the menu') }} <span class="ms-2" aria-hidden="true">←</span>
              </a>
            </div>

            <div class="lg:col-span-2">
              <h4 class="mb-4 text-sm font-bold text-[#fbb042]">{{ language.t('روابط سريعة', 'Quick links') }}</h4>
              <ul class="space-y-3 text-sm text-white/70">
                <li><a routerLink="/menu" class="transition hover:text-white">{{ language.t('منيو سوق وسفرة', 'Souq & Sofra Menu') }}</a></li>
                <li><a routerLink="/contact" class="transition hover:text-white">{{ language.t('فروعنا وأوقات العمل', 'Branches & opening hours') }}</a></li>
                <li><a routerLink="/cart" class="transition hover:text-white">{{ language.t('سلة المشتريات', 'Shopping cart') }}</a></li>
                <li><a routerLink="/cart" class="transition hover:text-white">{{ language.t('إرسال الطلب', 'Place an order') }}</a></li>
              </ul>
            </div>

            <div class="lg:col-span-3">
              <h4 class="mb-4 text-sm font-bold text-[#fbb042]">{{ language.t('تواصل معنا', 'Contact us') }}</h4>
              <ul class="space-y-3 text-sm leading-6 text-white/70">
                <li class="flex gap-2"><span class="text-[#f58229]" aria-hidden="true">⌖</span><span>{{ language.t('أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين', 'Abu Dhabi, Corniche, opposite Al Madina Fresh Mart and Al Nilein Bank') }}</span></li>
                <li><a href="tel:026333136" class="transition hover:text-white">{{ language.t('الهاتف', 'Phone') }}: 02 633 3136</a></li>
                <li><a href="https://wa.me/971503157884" class="transition hover:text-white" target="_blank" rel="noopener noreferrer">{{ language.t('واتساب', 'WhatsApp') }}: +971 50 315 7884</a></li>
              </ul>
            </div>

            <div class="lg:col-span-3">
              <h4 class="mb-4 text-sm font-bold text-[#fbb042]">{{ language.t('طرق الدفع', 'Payment methods') }}</h4>
              <p class="mb-4 text-sm leading-6 text-white/70">{{ language.t('الدفع نقداً عند الاستلام أو استلام الطلب من الفرع.', 'Pay cash on delivery or when collecting your order at the branch.') }}</p>
              <div class="flex flex-wrap gap-2 text-xs text-white/80">
                <span class="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">{{ language.t('نقداً عند الاستلام', 'Cash on pickup') }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center justify-between gap-3 pt-6 text-center text-xs text-white/50 md:flex-row md:text-start">
            <span>{{ language.t('جميع الحقوق محفوظة © سوق وسفرة 2026', '© 2026 Souq & Sofra. All rights reserved.') }}</span>
            <span>Souq & Sofra · Good Food, Good Mood</span>
          </div>
        </div>
      </footer>
    }
  `
})
export class AppComponent implements OnInit {
  private api = inject(ApiService);
  language = inject(LanguageService);
  logoUrl = signal('assets/MAIN.jpg');
  announcement = signal('');
  announcementEn = signal('');
  ngOnInit() {
    this.trackPageView(this.router.url);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) this.trackPageView(event.urlAfterRedirects);
    });
    this.api.getSettings().subscribe({ next: settings => {
      const value = settings['StoreLogo'];
      if (value) this.logoUrl.set(/^https?:\/\//i.test(value) || value.startsWith('assets/') ? value : `http://localhost:2811${value.startsWith('/') ? value : `/${value}`}`);
      this.announcement.set(settings['Announcement'] || '');
      this.announcementEn.set(settings['AnnouncementEn'] || '');
    }, error: () => {} });
  }
  private router = inject(Router);

  private trackPageView(url: string) {
    const pagePath = url.split(/[?#]/, 1)[0] || '/';
    if (pagePath.startsWith('/admin')) return;
    let sessionKey = localStorage.getItem('souq_site_analytics_session');
    if (!sessionKey) {
      sessionKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('souq_site_analytics_session', sessionKey);
    }
    this.api.recordPageView(sessionKey, pagePath).subscribe({ error: () => {} });
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
