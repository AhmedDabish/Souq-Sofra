import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { Branch } from '../../../../core/models/models';
import { DeliveryMapComponent } from '../../components/delivery-map/delivery-map.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, DeliveryMapComponent],
  template: `
    <main [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'" class="mx-auto max-w-6xl px-4 py-8 font-cairo sm:px-6 sm:py-12">
      <header class="relative mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 px-6 py-10 text-center text-white shadow-xl sm:px-12 sm:py-14">
        <div class="absolute -start-12 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl"></div>
        <div class="relative mx-auto max-w-2xl">
          <span class="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur">📍 {{ language.t('أماكننا وطرق التواصل', 'Our locations & contact') }}</span>
          <h1 class="font-baloo text-3xl font-black sm:text-5xl">{{ language.t('فروعنا قريبة منك', 'Find your nearest branch') }}</h1>
          <p class="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/90 sm:text-base">{{ language.t('زورونا أو تواصلوا معنا مباشرة. اختر الفرع المناسب وشاهد موقعه على الخريطة.', 'Visit us or get in touch. Choose a branch and see exactly where it is on the map.') }}</p>
        </div>
      </header>

      <section class="space-y-7" [attr.aria-label]="language.t('فروع المطعم', 'Restaurant branches')">
        @for (branch of branches(); track branch.branchId) {
          <article class="overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white shadow-[0_16px_50px_-30px_rgba(124,45,18,.35)] transition hover:shadow-xl">
            <div class="grid gap-0 lg:grid-cols-[.85fr_1.15fr]">
              <div class="flex flex-col p-6 sm:p-8">
                <div class="mb-4 flex items-center gap-3">
                  <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">🍽️</span>
                  <div>
                    <span class="text-[11px] font-bold uppercase tracking-wide text-orange-600">{{ language.t('سوق وسفرة', 'Souq & Sofra') }}</span>
                    <h2 class="font-baloo text-xl font-black text-slate-900 sm:text-2xl">{{ language.isEnglish() ? (branch.nameEn || branch.nameAr) : branch.nameAr }}</h2>
                  </div>
                </div>

                <div class="space-y-4 text-sm text-slate-600">
                  <div class="flex gap-3 rounded-2xl bg-slate-50 p-4">
                    <span class="text-lg">🏢</span>
                    <div class="min-w-0"><strong class="mb-1 block text-xs text-slate-900">{{ language.t('العنوان', 'Address') }}</strong><p class="leading-6">{{ language.isEnglish() ? (branch.addressEn || branch.addressAr) : branch.addressAr }}</p></div>
                  </div>
                  <div class="flex gap-3 rounded-2xl bg-slate-50 p-4">
                    <span class="text-lg">🕒</span>
                    <div><strong class="mb-1 block text-xs text-slate-900">{{ language.t('ساعات العمل', 'Opening hours') }}</strong><p>{{ language.t('يومياً من 7:00 صباحاً حتى 12:00 منتصف الليل', 'Daily, 7:00 AM to 12:00 midnight') }}</p></div>
                  </div>
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <a [href]="'tel:' + branch.phone" class="flex min-w-0 items-center gap-3 rounded-2xl border border-orange-100 p-4 transition hover:bg-orange-50">
                      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">📞</span><span class="min-w-0"><strong class="block text-[11px] text-slate-500">{{ language.t('اتصل بالفرع', 'Call branch') }}</strong><b class="block truncate text-sm text-slate-900" dir="ltr">{{ branch.phone }}</b></span>
                    </a>
                    <a [href]="'https://wa.me/' + branch.whatsApp.replace('+', '')" target="_blank" rel="noopener noreferrer" class="flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-100 p-4 transition hover:bg-emerald-50">
                      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">💬</span><span class="min-w-0"><strong class="block text-[11px] text-slate-500">{{ language.t('واتساب', 'WhatsApp') }}</strong><b class="block truncate text-sm text-slate-900" dir="ltr">{{ branch.whatsApp }}</b></span>
                    </a>
                  </div>
                </div>

                <div class="mt-auto flex flex-wrap gap-3 pt-6">
                  <a [href]="'tel:' + branch.phone" class="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700">📞 {{ language.t('اتصل الآن', 'Call now') }}</a>
                  <a routerLink="/menu" class="inline-flex items-center justify-center rounded-xl bg-slate-100 px-5 py-3 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200">{{ language.t('تصفح قائمة الطعام', 'Browse the menu') }}</a>
                </div>
              </div>

              <div class="min-h-[300px] border-t border-slate-100 bg-slate-50 p-3 sm:p-5 lg:border-s-0 lg:border-t-0">
                @if (branch.latitude != null && branch.longitude != null) {
                  <div class="mb-3 flex items-center justify-between px-1">
                    <div><h3 class="text-sm font-extrabold text-slate-900">{{ language.t('موقع الفرع', 'Branch location') }}</h3><p class="mt-1 text-[11px] text-slate-500">{{ language.t('عرض القمر الصناعي', 'Satellite view') }}</p></div>
                    <a [href]="mapsLink(branch)" target="_blank" rel="noopener noreferrer" class="rounded-xl bg-white px-3 py-2 text-xs font-bold text-orange-700 shadow-sm ring-1 ring-slate-200 hover:bg-orange-50">{{ language.t('افتح في خرائط Google ↗', 'Open in Google Maps ↗') }}</a>
                  </div>
                  <app-delivery-map class="block h-[300px] overflow-hidden rounded-2xl" [latitude]="branch.latitude" [longitude]="branch.longitude" [defaultMapType]="'satellite'" [readOnly]="true"></app-delivery-map>
                } @else {
                  <div class="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <span class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">🗺️</span>
                    <h3 class="font-bold text-slate-800">{{ language.t('موقع الفرع غير محدد بعد', 'Branch location not set yet') }}</h3>
                    <p class="mt-2 max-w-xs text-xs leading-6 text-slate-500">{{ language.t('سيظهر موقع الفرع هنا بعد تحديده من لوحة الإدارة.', 'The map will appear here once the branch location is set in the dashboard.') }}</p>
                  </div>
                }
              </div>
            </div>
          </article>
        } @empty {
          <div class="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><span class="text-4xl">📍</span><p class="mt-4 font-bold text-slate-700">{{ language.t('لا توجد فروع متاحة حالياً.', 'No branches are available right now.') }}</p></div>
        }
      </section>
    </main>
  `
})
export class ContactComponent implements OnInit {
  private api = inject(ApiService);
  language = inject(LanguageService);

  branches = signal<Branch[]>([
    {
      branchId: 1,
      nameAr: 'فرع الكورنيش - أبوظبي',
      nameEn: 'Corniche Branch - Abu Dhabi',
      addressAr: 'أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين',
      addressEn: 'Abu Dhabi - Corniche - Opposite Al Madina Fresh Mart and Al Nilein Bank',
      phone: '02 633 3136',
      whatsApp: '+971 50 315 7884',
      isActive: true
    }
  ]);

  ngOnInit() {
    this.api.getBranches().subscribe({
      next: data => { if (data?.length) this.branches.set(data); },
      error: () => { /* Keep the built-in branch details if the API is unavailable. */ }
    });
  }

  mapsLink(branch: Branch): string {
    return `https://www.google.com/maps/search/?api=1&query=${branch.latitude},${branch.longitude}`;
  }
}
