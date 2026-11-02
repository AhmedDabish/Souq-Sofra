import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { Branch } from '../../../../core/models/models';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 font-cairo">

      <!-- Title Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl sm:text-4xl font-extrabold font-baloo text-primaryDark">{{ language.t('فروع ومعلومات الاتصال', 'Branches & Contact Information') }}</h1>
        <p class="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
          {{ language.t('أهلاً بكم في مطعم ومخبز سوق وسفرة (Good Food, Good Mood). نسعد باستقبالكم وتوصيل طلباتكم يومياً.', 'Welcome to Souq & Sofra Restaurant and Bakery. We are happy to serve you and deliver your orders every day.') }}
        </p>
      </div>

      <!-- Branches List -->
      <div class="space-y-8">
        @for (branch of branches(); track branch.branchId) {
          <div class="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-primary/20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            <div class="space-y-6">
              <div class="inline-block bg-primary/10 text-primaryDark font-bold text-xs px-3 py-1 rounded-full">
                📍 {{ language.t('فرع مطعم ومخبز سوق وسفرة', 'Souq & Sofra Restaurant and Bakery Branch') }}
              </div>

              <div>
                <h2 class="text-2xl font-bold font-baloo text-primaryDark">{{ language.isEnglish() ? (branch.nameEn || branch.nameAr) : branch.nameAr }}</h2>
              </div>

              <div class="space-y-4 text-xs text-gray-600">
                <div class="flex items-start gap-3">
                  <span class="text-base text-primary">🏢</span>
                  <div>
                    <strong class="text-gray-800 block mb-0.5">{{ language.t('العنوان بالتفصيل:', 'Full address:') }}</strong>
                    {{ language.isEnglish() ? (branch.addressEn || branch.addressAr) : branch.addressAr }}

                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <span class="text-base text-primary">🕒</span>
                  <div>
                    <strong class="text-gray-800 block mb-0.5">{{ language.t('ساعات العمل:', 'Opening hours:') }}</strong>
                    {{ language.t('يومياً من الساعة 7:00 صباحاً وحتى 12:00 منتصف الليل.', 'Daily, 7:00 AM to 12:00 midnight.') }}
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <span class="text-base text-primary">📞</span>
                  <div>
                    <strong class="text-gray-800 block mb-0.5">{{ language.t('هاتف الطلبات والتوصيل:', 'Orders & delivery phone:') }}</strong>
                    <a [href]="'tel:' + branch.phone" class="text-primary font-bold hover:underline dir-ltr inline-block">{{ branch.phone }}</a>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <span class="text-base text-green-600">💬</span>
                  <div>
                    <strong class="text-gray-800 block mb-0.5">{{ language.t('خدمة الواتساب المباشرة:', 'WhatsApp service:') }}</strong>
                    <a [href]="'https://wa.me/' + branch.whatsApp.replace('+', '')" target="_blank" class="text-green-600 font-bold hover:underline dir-ltr inline-block">
                      {{ branch.whatsApp }}
                    </a>
                  </div>
                </div>
              </div>

              <div class="pt-2 flex flex-wrap gap-3">
                <a [href]="'tel:' + branch.phone" class="px-5 py-3 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primaryHover transition-colors flex items-center gap-2">
                  <span>📞</span> {{ language.t('اتصل بالفرع', 'Call branch') }}
                </a>
                <a [href]="'https://wa.me/' + branch.whatsApp.replace('+', '')" target="_blank" class="px-5 py-3 rounded-2xl bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition-colors flex items-center gap-2">
                  <span>💬</span> {{ language.t('تواصل واتساب', 'Chat on WhatsApp') }}
                </a>
                <a routerLink="/menu" class="px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors">
                  {{ language.t('اطلب أونلاين الآن', 'Order online now') }}
                </a>
              </div>
            </div>

            <!-- Visual / Map Card -->
            <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center space-y-4 min-h-[280px]">
              <img src="assets/MAIN.jpg" [alt]="language.t('سوق وسفرة', 'Souq & Sofra')" class="w-24 h-24 rounded-full border-2 border-primary/40 shadow-md object-cover">
              <div class="space-y-1">
                <h3 class="font-bold text-base text-primaryDark font-baloo">{{ language.isEnglish() ? 'Souq & Sofra' : 'سوق وسفرة - Souq & Sofra' }}</h3>
                <p class="text-xs text-gray-500">Good Food, Good Mood</p>
              </div>
              <p class="text-xs text-gray-400 max-w-xs">
                {{ language.t('أفضل فطير مشلتت وحواوشي ومناقيش طازجة في قلب أبوظبي.', 'Enjoy fresh feteer, hawawshi, and manakeesh in the heart of Abu Dhabi.') }}
              </p>
            </div>

          </div>
        }
      </div>

    </div>
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
      next: (data) => {
        if (data && data.length > 0) {
          this.branches.set(data);
        }
      },
      error: () => {
        // Keeps default branch info
      }
    });
  }
}
