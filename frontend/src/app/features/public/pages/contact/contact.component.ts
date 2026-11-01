import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      
      <!-- Title Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl sm:text-4xl font-extrabold font-baloo text-primaryDark">فروع ومعلومات الاتصال</h1>
        <p class="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
          أهلاً بكم في مطعم ومخبز سوق وسفرة (Good Food, Good Mood). نسعد باستقبالكم وتوصيل طلباتكم يومياً.
        </p>
      </div>

      <!-- Main Branch Card -->
      <div class="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-primary/20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        <div class="space-y-6">
          <div class="inline-block bg-primary/10 text-primaryDark font-bold text-xs px-3 py-1 rounded-full">
            📍 الفرع الرئيسي - أبوظبي
          </div>

          <h2 class="text-2xl font-bold font-baloo text-primaryDark">فرع الكورنيش</h2>

          <div class="space-y-4 text-xs text-gray-600">
            <div class="flex items-start gap-3">
              <span class="text-base text-primary">🏢</span>
              <div>
                <strong class="text-gray-800 block mb-0.5">العنوان بالتفصيل:</strong>
                أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين.
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="text-base text-primary">🕒</span>
              <div>
                <strong class="text-gray-800 block mb-0.5">ساعات العمل:</strong>
                يومياً من الساعة 7:00 صباحاً وحتى 12:00 منتصف الليل.
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="text-base text-primary">📞</span>
              <div>
                <strong class="text-gray-800 block mb-0.5">هاتف الطلبات والتوصيل:</strong>
                <a href="tel:026333136" class="text-primary font-bold hover:underline">02 633 3136</a>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="text-base text-green-600">💬</span>
              <div>
                <strong class="text-gray-800 block mb-0.5">خدمة الواتساب المباشرة:</strong>
                <a href="https://wa.me/971503157884" target="_blank" class="text-green-600 font-bold hover:underline">+971 50 315 7884</a>
              </div>
            </div>
          </div>

          <div class="pt-2 flex flex-wrap gap-3">
            <a href="tel:026333136" class="px-5 py-3 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primaryHover transition-colors flex items-center gap-2">
              <span>📞</span> اتصل بالفرع
            </a>
            <a href="https://wa.me/971503157884" target="_blank" class="px-5 py-3 rounded-2xl bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition-colors flex items-center gap-2">
              <span>💬</span> تواصل واتساب
            </a>
            <a routerLink="/menu" class="px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors">
              اطلب أونلاين الآن
            </a>
          </div>
        </div>

        <!-- Visual / Map Card -->
        <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center space-y-4 min-h-[280px]">
          <img src="assets/MAIN.jpg" alt="سوق وسفرة" class="w-24 h-24 rounded-full border-2 border-primary/40 shadow-md">
          <div class="space-y-1">
            <h3 class="font-bold text-base text-primaryDark font-baloo">سوق وسفرة - Souq & Sofra</h3>
            <p class="text-xs text-gray-500">Good Food, Good Mood</p>
          </div>
          <p class="text-xs text-gray-400 max-w-xs">
            أفضل فطير مشلتت وحواوشي ومناقيش طازجة في قلب أبوظبي.
          </p>
        </div>

      </div>

    </div>
  `
})
export class ContactComponent {}
