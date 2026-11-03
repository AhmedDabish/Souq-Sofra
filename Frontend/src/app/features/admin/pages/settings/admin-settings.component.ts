import { LanguageService } from '../../../../core/services/language.service';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Branch, SiteSettings, DeliveryZone } from '../../../../core/models/models';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { forkJoin } from 'rxjs';

type HeroSlide = { image: string; title: string; titleEn: string; subtitle: string; subtitleEn: string };

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="admin-shell min-h-screen bg-gray-50 flex font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">

      <!-- Shared Sidebar -->
      <app-admin-sidebar />

      <!-- Main Settings Content -->
      <main class="min-w-0 flex-1 p-5 pt-20 md:p-8 lg:mr-64">

        <!-- Header -->
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-black font-baloo text-gray-800">{{ language.t('إعدادات المتجر والفروع', 'Store & branches settings') }}</h1>
            <p class="text-xs text-gray-400">{{ language.t('إدارة معلومات الاتصال، شريط الإعلانات، رسوم التوصيل وفروع المطعم', 'Manage contact details, announcement banner, delivery fees, and branches') }}</p>
          </div>
          <button
            [hidden]="!auth.hasPermission('settings.update')" (click)="saveSettings()"
            [disabled]="isSaving()"
            class="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primaryHover text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto">
            @if (isSaving()) {
              <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            }
            <span>💾 {{ language.t('حفظ التغييرات','Save changes') }}</span>
          </button>
        </header>

        <!-- Feedback Alert -->
        @if (feedbackMessage()) {
          <div [class]="feedbackType() === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'"
               class="mb-6 p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between">
            <span>{{ feedbackMessage() }}</span>
            <button (click)="feedbackMessage.set('')" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <!-- General Store Configuration -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div class="border-b border-gray-100 pb-4">
              <h2 class="text-base font-bold font-baloo text-gray-800">{{ language.t('إعدادات الواجهة والطلبات', 'Storefront & order settings') }}</h2>
              <p class="text-[11px] text-gray-400">{{ language.t('القيم المعروضة للزبائن في المتجر وشريط الإعلانات', 'Information shown on the storefront') }}</p>
            </div>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-gray-700 mb-1">{{ language.t('نص شريط الإعلانات بالعربية', 'Announcement in Arabic') }}</label>
                <input
                  type="text"
                  [(ngModel)]="settings.Announcement"
                  name="announcement"
                  [placeholder]="language.t('مثال: خصم 15% على الفطير المشلتت لطلبات الأونلاين!', 'Example: 15% off feteer orders!')"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
              </div>
              <div>
                <label class="block font-bold text-gray-700 mb-1">{{ language.t('نص شريط الإعلانات بالإنجليزية', 'Announcement in English') }}</label>
                <input type="text" [(ngModel)]="settings.AnnouncementEn" name="announcementEn" dir="auto" [placeholder]="language.t('أدخل النص بالإنجليزية', 'Enter the announcement in English')" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('رقم هاتف الاتصال الرئيسي', 'Main contact phone') }}</label>
                  <input
                    type="text"
                    [(ngModel)]="settings.PhoneNumber"
                    name="phone"
                    placeholder="02 633 3136"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
                </div>

                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('رقم خدمة الواتساب', 'WhatsApp number') }}</label>
                  <input
                    type="text"
                    [(ngModel)]="settings.WhatsApp"
                    name="whatsapp"
                    placeholder="+971 50 315 7884"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('رسوم التوصيل الافتراضية (درهم)', 'Default delivery fee (AED)') }}</label>
                  <input
                    type="text"
                    [(ngModel)]="settings.DeliveryFee"
                    name="deliveryFee"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
                </div>

                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('الحد الأدنى للطلب (درهم)', 'Minimum order (AED)') }}</label>
                  <input
                    type="text"
                    [(ngModel)]="settings.MinOrderAmount"
                    name="minOrder"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
                </div>
              </div>

              <section class="rounded-2xl border border-orange-100 bg-orange-50/40 p-4 space-y-4">
                <div class="flex items-start justify-between gap-3">
                  <div><h3 class="font-bold text-sm text-gray-800">{{ language.t('مناطق ورسوم التوصيل', 'Delivery areas & fees') }}</h3><p class="mt-1 text-[11px] text-gray-500">{{ language.t('ابدأ بالإمارات السبع، وأضف مناطق فرعية وحدد رسوم كل منطقة أو أوقف التوصيل إليها.', 'Start with the seven emirates, add areas, set fees, or disable delivery.') }}</p></div>
                  <button type="button" [hidden]="!auth.hasPermission('settings.update')" (click)="addDeliveryZone()" class="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white">+ {{ language.t('إضافة منطقة', 'Add area') }}</button>
                </div>
                <div class="space-y-3">
                  @for (zone of deliveryZones(); track zone.id; let i = $index) {
                    <div class="grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-white p-3 sm:grid-cols-12 sm:items-end">
                      <label class="text-[11px] font-bold text-gray-600 sm:col-span-3">{{ language.t('الإمارة', 'Emirate') }}
                        <select [ngModel]="zone.emirate" (ngModelChange)="updateDeliveryZone(i, 'emirate', $event)" [name]="'emirate' + i" class="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-xs">
                          @for (emirate of emirates; track emirate) { <option [value]="emirate">{{ language.isEnglish() ? emirateEn(emirate) : emirate }}</option> }
                        </select>
                      </label>
                      <label class="text-[11px] font-bold text-gray-600 sm:col-span-3">{{ language.t('المنطقة / الحي بالعربية', 'Area in Arabic') }}
                        <input [ngModel]="zone.name" (ngModelChange)="updateDeliveryZone(i, 'name', $event)" [name]="'zoneName' + i" class="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-xs" [placeholder]="language.t('مثال: الكورنيش', 'Arabic area name')">
                      </label>
                      <label class="text-[11px] font-bold text-gray-600 sm:col-span-3">{{ language.t('المنطقة / الحي بالإنجليزية', 'Area in English') }}
                        <input [ngModel]="zone.nameEn || ''" (ngModelChange)="updateDeliveryZone(i, 'nameEn', $event)" [name]="'zoneNameEn' + i" class="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-xs" dir="ltr" [placeholder]="language.t('الترجمة الإنجليزية', 'English area name')">
                      </label>
                      <label class="text-[11px] font-bold text-gray-600 sm:col-span-1">{{ language.t('الرسوم (درهم)', 'Fee (AED)') }}
                        <input type="number" min="0" step="0.5" [ngModel]="zone.fee" (ngModelChange)="updateDeliveryZone(i, 'fee', $event)" [name]="'zoneFee' + i" class="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-xs">
                      </label>
                      <label class="flex items-center gap-2 text-[11px] font-bold text-gray-600 sm:col-span-1"><input type="checkbox" [ngModel]="zone.enabled" (ngModelChange)="updateDeliveryZone(i, 'enabled', $event)" [name]="'zoneEnabled' + i" class="accent-orange-500"> {{ language.t('متاح', 'Available') }}</label>
                      <button type="button" [hidden]="!auth.hasPermission('settings.update')" (click)="removeDeliveryZone(i)" class="rounded-lg px-2 py-2 text-xs font-bold text-red-600 hover:bg-red-50 sm:col-span-1" [attr.aria-label]="language.t('حذف ', 'Delete ') + (language.isEnglish() ? (zone.nameEn || zone.name) : zone.name)">{{ language.t('حذف', 'Delete') }}</button>
                    </div>
                  }
                </div>
              </section>

              <div>
                <label class="block font-bold text-gray-700 mb-1">{{ language.t('ساعات عمل المطعم والتوصيل', 'Restaurant & delivery hours') }}</label>
                <input
                  type="text"
                  [(ngModel)]="settings.WorkingHours"
                  name="workingHours"
                  [placeholder]="language.t('يومياً من 7:00 ص وحتى 12:00 منتصف الليل', 'Daily, 7:00 AM to midnight')"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">{{ language.t('نسبة ضريبة القيمة المضافة (VAT %)', 'VAT rate (%)') }}</label>
                <input
                  type="text"
                  [(ngModel)]="settings.VATPercentage"
                  name="vat"
                  placeholder="5%"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
              </div>
            </div>
          </div>

          <!-- Site logo management -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <div class="border-b border-gray-100 pb-4"><h2 class="text-base font-bold font-baloo text-gray-800">{{ language.t('شعار الموقع', 'Store logo') }}</h2><p class="text-[11px] text-gray-400">{{ language.t('رفع شعار المتجر وحفظه ضمن إعدادات الموقع على الخادم', 'Upload and save the store logo in site settings') }}</p></div>
            <div class="flex items-center gap-4"><img [src]="logoPreview()" [alt]="language.t('معاينة شعار الموقع', 'Store logo preview')" class="h-24 w-24 rounded-full border bg-orange-50 object-cover"><div><label class="inline-flex cursor-pointer rounded-xl bg-orange-50 px-4 py-3 text-xs font-bold text-orange-800 hover:bg-orange-100">{{ uploadingLogo() ? language.t('جارٍ الرفع…', 'Uploading…') : language.t('اختيار شعار ورفعه', 'Choose and upload logo') }}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" [disabled]="!auth.hasPermission('media.upload')" (change)="uploadLogo($event)" class="sr-only"></label><p class="mt-2 text-[10px] text-gray-400">{{ language.t('سيتم حفظ مسار الصورة في إعدادات المتجر.', 'The image path will be saved in store settings.') }}</p></div></div>
          </div>

          <!-- Homepage hero carousel management -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5 lg:col-span-2">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h2 class="text-base font-bold font-baloo text-gray-800">{{ language.t('صور ونصوص واجهة المتجر', 'Storefront slides & text') }}</h2>
                <p class="text-[11px] text-gray-400">{{ language.t('أضف حتى 30 شريحة، ارفع صورها، وعدّل العناوين والوصف بالعربي والإنجليزي.', 'Add up to 30 slides, upload images, and edit Arabic and English headings and descriptions.') }}</p>
              </div>
              <button type="button" [hidden]="!auth.hasPermission('settings.update')" [disabled]="heroSlides().length >= 30" (click)="addHeroSlide()" class="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">+ {{ language.t('إضافة شريحة', 'Add slide') }}</button>
            </div>
            <div class="grid gap-4 xl:grid-cols-2">
              @for (slide of heroSlides(); track $index; let index = $index) {
                <article class="min-w-0 space-y-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <h3 class="text-sm font-black text-gray-800">{{ language.t('الشريحة', 'Slide') }} {{ index + 1 }}</h3>
                    <button type="button" [hidden]="!auth.hasPermission('settings.update')" (click)="removeHeroSlide(index)" class="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">{{ language.t('حذف الشريحة', 'Delete slide') }}</button>
                  </div>
                  <div class="flex flex-wrap items-center gap-4">
                    <img [src]="heroSlidePreview(slide, index)" [alt]="language.t('معاينة الشريحة', 'Slide preview') + ' ' + (index + 1)" class="h-24 w-40 rounded-xl border bg-white object-cover">
                    <div class="flex flex-wrap items-center gap-2">
                      <label class="inline-flex cursor-pointer rounded-lg bg-orange-50 px-3 py-2.5 text-xs font-bold text-orange-800 hover:bg-orange-100">
                        {{ uploadingHeroSlide() === index ? language.t('جارٍ الرفع...', 'Uploading...') : language.t('اختيار صورة ورفعها', 'Choose and upload image') }}
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" [disabled]="!auth.hasPermission('media.upload') || uploadingHeroSlide() !== null" (change)="uploadHeroSlide($event, index)" class="sr-only">
                      </label>
                    </div>
                  </div>
                  <label class="block text-xs font-bold text-gray-700">{{ language.t('العنوان بالعربية', 'Arabic heading') }}
                    <input type="text" [ngModel]="slide.title" (ngModelChange)="updateHeroSlide(index, 'title', $event)" [name]="'heroTitleAr' + index" class="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal" [placeholder]="language.t('عنوان الشريحة', 'Slide heading')">
                  </label>
                  <label class="block text-xs font-bold text-gray-700">{{ language.t('العنوان بالإنجليزية', 'English heading') }}
                    <input type="text" dir="ltr" [ngModel]="slide.titleEn" (ngModelChange)="updateHeroSlide(index, 'titleEn', $event)" [name]="'heroTitleEn' + index" class="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left font-normal" placeholder="Slide heading">
                  </label>
                  <label class="block text-xs font-bold text-gray-700">{{ language.t('الوصف بالعربية', 'Arabic description') }}
                    <textarea rows="2" [ngModel]="slide.subtitle" (ngModelChange)="updateHeroSlide(index, 'subtitle', $event)" [name]="'heroSubtitleAr' + index" class="mt-1 w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal" [placeholder]="language.t('وصف مختصر يظهر على الصورة', 'Short description shown on the image')"></textarea>
                  </label>
                  <label class="block text-xs font-bold text-gray-700">{{ language.t('الوصف بالإنجليزية', 'English description') }}
                    <textarea rows="2" dir="ltr" [ngModel]="slide.subtitleEn" (ngModelChange)="updateHeroSlide(index, 'subtitleEn', $event)" [name]="'heroSubtitleEn' + index" class="mt-1 w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left font-normal" placeholder="Short description shown on the image"></textarea>
                  </label>
                </article>
              } @empty {
                <div class="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 xl:col-span-2">{{ language.t('لا توجد شرائح ظاهرة في واجهة المتجر. أضف شريحة للبدء.', 'No storefront slides are shown. Add a slide to get started.') }}</div>
              }
            </div>
            <section class="grid gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div class="sm:col-span-2 lg:col-span-4"><h3 class="text-sm font-black text-gray-800">{{ language.t('الشارة أعلى الصورة', 'Badge on the image') }}</h3><p class="mt-1 text-[11px] text-gray-500">{{ language.t('اترك النص فارغًا لإخفاء الشارة. إعدادات الحجم واللون تطبق على الشارة.', 'Leave the text empty to hide the badge. Size and color apply to the badge text.') }}</p></div>
              <label class="block text-xs font-bold text-gray-700">{{ language.t('نص الشارة بالعربية', 'Badge text in Arabic') }}
                <input type="text" [(ngModel)]="settings['HeroBadgeAr']" name="heroBadgeAr" class="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal">
              </label>
              <label class="block text-xs font-bold text-gray-700">{{ language.t('نص الشارة بالإنجليزية', 'Badge text in English') }}
                <input type="text" dir="ltr" [(ngModel)]="settings['HeroBadgeEn']" name="heroBadgeEn" class="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left font-normal">
              </label>
              <label class="block text-xs font-bold text-gray-700">{{ language.t('حجم الخط (بكسل)', 'Font size (px)') }}
                <input type="number" min="8" max="48" [(ngModel)]="settings['HeroBadgeFontSize']" name="heroBadgeFontSize" class="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal">
              </label>
              <label class="block text-xs font-bold text-gray-700">{{ language.t('لون الخط', 'Text color') }}
                <span class="mt-1 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2"><input type="color" [(ngModel)]="settings['HeroBadgeColor']" name="heroBadgeColor" class="h-8 w-10 cursor-pointer border-0 bg-transparent p-0"><span dir="ltr" class="text-xs font-medium text-gray-500">{{ settings['HeroBadgeColor'] }}</span></span>
              </label>
              <div class="sm:col-span-2 lg:col-span-4"><span class="inline-flex rounded-full bg-[#f47621] px-3 py-1.5 font-bold shadow" [style.fontSize.px]="badgeFontSize()" [style.color]="settings['HeroBadgeColor'] || '#ffffff'">{{ language.isEnglish() ? (settings['HeroBadgeEn'] || '') : (settings['HeroBadgeAr'] || '') }}</span></div>
            </section>
          </div>

          <!-- Additional homepage promo banners -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <div class="border-b border-gray-100 pb-4"><h2 class="text-base font-bold font-baloo text-gray-800">{{ language.t('بنرات العروض الإضافية', 'Additional promotion banners') }}</h2><p class="text-[11px] text-gray-400">{{ language.t('إدارة الصور الإضافية الظاهرة في الصفحة الرئيسية.', 'Manage additional homepage images.') }}</p></div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              @for (index of [1, 2]; track index) {
                <div class="rounded-2xl border border-gray-100 p-3"><img [src]="promoBannerPreview(index)" [alt]="language.t('بنر عرض', 'Promotion banner') + ' ' + index" class="mb-3 h-32 w-full rounded-xl bg-orange-50 object-cover"><p class="mb-2 text-xs font-bold">{{ language.t('بنر العرض', 'Promotion banner') }} {{ index }}</p><label class="inline-flex cursor-pointer rounded-lg bg-orange-50 px-3 py-2 text-[11px] font-bold text-orange-700">{{ language.t('اختيار صورة ورفعها', 'Choose and upload image') }}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" [disabled]="!auth.hasPermission('media.upload')" (change)="uploadPromoBanner($event, index)" class="sr-only"></label></div>
              }
            </div>
          </div>

          <!-- Restaurant Branches Management -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div class="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 class="text-base font-bold font-baloo text-gray-800">{{ language.t('فروع سوق وسفرة', 'Souq & Sofra branches') }}</h2>
                <p class="text-[11px] text-gray-400">{{ language.t('الفروع المتاحة لاستلام وتوصيل الطلبات', 'Branches available for pickup and delivery') }}</p>
              </div>
              <button
                [hidden]="!auth.hasPermission('branches.create')" (click)="openNewBranch()"
                class="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors">
                + {{ language.t('إضافة فرع', 'Add branch') }}
              </button>
            </div>

            <div class="space-y-4">
              @for (branch of branches(); track branch.branchId) {
                <div class="p-4 rounded-2xl border border-gray-100 hover:border-primary/30 transition-colors flex flex-col justify-between gap-3 bg-gray-50/50">
                  <div class="flex items-center justify-between">
                    <div class="font-bold text-xs text-gray-800 flex items-center gap-2">
                      <span class="text-base">📍</span>
                      <span>{{ language.isEnglish() ? (branch.nameEn || branch.nameAr) : branch.nameAr }}</span>

                    </div>
                    <span class="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                      {{ language.t(branch.isActive ? 'نشط' : 'معطل', branch.isActive ? 'Active' : 'Disabled') }}
                    </span>
                  </div>

                  <div class="text-[11px] text-gray-500">
                    <div>{{ language.isEnglish() ? (branch.addressEn || branch.addressAr) : branch.addressAr }}</div>

                  </div>

                  <div class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-2">
                    <div class="flex flex-wrap items-center gap-4 text-[11px] text-primary font-medium"><div>📞 {{ branch.phone }}</div><div>💬 {{ branch.whatsApp }}</div></div>
                    <div class="flex gap-2"><button type="button" [hidden]="!auth.hasPermission('branches.update')" (click)="openEditBranch(branch)" class="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">{{language.t('تعديل','Edit')}}</button><button type="button" [hidden]="!auth.hasPermission('branches.delete')" (click)="deleteBranch(branch)" class="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{{language.t('حذف','Delete')}}</button></div>
                  </div>
                </div>
              } @empty {
                <div class="p-8 text-center text-gray-400 text-xs">
                  {{ language.t('لا توجد فروع مسجلة حالياً', 'No branches have been recorded yet') }}
                </div>
              }
            </div>
          </div>

        </div>

      </main>

      <!-- Add Branch Modal -->
      @if (showBranchModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 class="text-base font-bold font-baloo text-gray-800">{{ editingBranchId() ? language.t('تعديل الفرع', 'Edit branch') : language.t('إضافة فرع جديد', 'Add branch') }}</h2>
              <button (click)="showBranchModal.set(false)" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-sm font-bold">✕</button>
            </div>

            <form (ngSubmit)="saveBranch()" class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-gray-700 mb-1">{{ language.t('اسم الفرع بالعربية *', 'Branch name in Arabic *') }}</label>
                <input type="text" [(ngModel)]="newBranch.nameAr" name="nameAr" required [placeholder]="language.t('مثال: فرع الخالدية', 'e.g. Al Khalidiyah Branch')"
                       class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">{{ language.t('اسم الفرع بالإنجليزية *', 'Branch name in English *') }}</label>
                <input type="text" [(ngModel)]="newBranch.nameEn" name="nameEn" required placeholder="e.g. Al Khalidiyah Branch"
                       class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">{{ language.t('العنوان بالعربية', 'Address in Arabic') }}</label>
                <input type="text" [(ngModel)]="newBranch.addressAr" name="addressAr" [placeholder]="language.t('أبوظبي - الخالدية', 'Abu Dhabi - Al Khalidiyah')"
                       class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">{{ language.t('العنوان بالإنجليزية', 'Address in English') }}</label>
                <input type="text" [(ngModel)]="newBranch.addressEn" name="addressEn" placeholder="Abu Dhabi - Al Khalidiyah"
                       class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('رقم الهاتف', 'Phone number') }}</label>
                  <input type="text" [(ngModel)]="newBranch.phone" name="phone" placeholder="02 633 3136"
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
                </div>
                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('رقم الواتساب', 'WhatsApp number') }}</label>
                  <input type="text" [(ngModel)]="newBranch.whatsApp" name="whatsApp" placeholder="+971503157884"
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" (click)="showBranchModal.set(false)" class="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">
                  {{ language.t('إلغاء', 'Cancel') }}
                </button>
                <button type="submit" [disabled]="isSavingBranch() || !auth.hasPermission('branches.create')" class="px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-bold shadow-md">
                  {{ editingBranchId() ? language.t('حفظ التعديلات', 'Save changes') : language.t('إضافة الفرع', 'Add branch') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  language = inject(LanguageService);
  auth = inject(AuthService);
  private api = inject(ApiService);

  settings: SiteSettings = {
    Announcement: '',
    AnnouncementEn: '',
    HeroBadgeAr: 'طازج يومياً من سوق وسفرة',
    HeroBadgeEn: 'Fresh every day from Souq & Sofra',
    HeroBadgeFontSize: '12',
    HeroBadgeColor: '#ffffff',
    PhoneNumber: '02 633 3136',
    WhatsApp: '+971 50 315 7884',
    DeliveryFee: '10.00',
    MinOrderAmount: '30.00',
    WorkingHours: 'يومياً من 7:00 ص وحتى 12:00 منتصف الليل',
    VATPercentage: '5%'
  };

  branches = signal<Branch[]>([]);
  readonly emirates = ['أبوظبي', 'دبي', 'الشارقة', 'عجمان', 'أم القيوين', 'رأس الخيمة', 'الفجيرة'];
  emirateEn(name: string): string { return ({'أبوظبي':'Abu Dhabi','دبي':'Dubai','الشارقة':'Sharjah','عجمان':'Ajman','أم القيوين':'Umm Al Quwain','رأس الخيمة':'Ras Al Khaimah','الفجيرة':'Fujairah'} as Record<string,string>)[name] || name; }
  deliveryZones = signal<DeliveryZone[]>(this.emirates.map((emirate, index) => ({
    id: `uae-${index + 1}`, emirate, emirateEn: this.emirateEn(emirate), name: emirate, nameEn: this.emirateEn(emirate), fee: 10, enabled: true
  })));

  isSaving = signal<boolean>(false);
  uploadingBanner = signal<number | null>(null);
  uploadingHeroSlide = signal<number | null>(null);
  heroSlides = signal<HeroSlide[]>([]);
  uploadingLogo = signal(false);
  isSavingBranch = signal<boolean>(false);
  showBranchModal = signal<boolean>(false);

  feedbackMessage = signal<string>('');
  feedbackType = signal<'success' | 'error'>('success');

  newBranch: Partial<Branch> = {
    nameAr: '',
    nameEn: '',
    addressAr: '',
    addressEn: '',
    phone: '',
    whatsApp: '',
    isActive: true
  };

  private readonly defaultHeroSlides: HeroSlide[] = [
    { image: 'assets/banners/banner-1.jpg', title: 'سفرة عامرة.. بطعم أصيل', titleEn: 'A table full of authentic flavor', subtitle: 'اختار من أشهى الأطباق والمخبوزات، ونحضّر طلبك طازج بكل حب.', subtitleEn: 'Choose from our favorite dishes and baked goods, freshly prepared with care.' },
    { image: 'assets/banners/banner-2.jpg', title: 'كل اللي بتحبه.. في مكان واحد', titleEn: 'Everything you love, all in one place', subtitle: 'من الفطائر والمخبوزات إلى الوجبات اليومية، تجربة تناسب كل سفرة.', subtitleEn: 'From feteer and bakery favorites to everyday meals, there is something for every table.' },
    { image: 'assets/banners/banner-3.jpg', title: 'اختار وجبتك واطلبها بسهولة', titleEn: 'Choose your meal and order with ease', subtitle: 'تصفح القائمة، أضف اختياراتك للسلة، واستمتع بطلبك من سوق وسفرة.', subtitleEn: 'Browse the menu, add your favorites to the cart, and enjoy your Souq & Sofra order.' }
  ];

  badgeFontSize(): number {
    const value = Number(this.settings['HeroBadgeFontSize'] || 12);
    return Number.isFinite(value) ? Math.min(48, Math.max(8, value)) : 12;
  }

  heroSlidePreview(slide: HeroSlide, index: number): string {
    return slide.image ? this.imageUrl(slide.image) : this.defaultHeroSlides[index % this.defaultHeroSlides.length].image;
  }

  private imageUrl(url: string): string {
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }

  updateHeroSlide(index: number, key: keyof HeroSlide, value: string) {
    this.heroSlides.update(slides => slides.map((slide, i) => i === index ? { ...slide, [key]: value } : slide));
  }

  addHeroSlide() {
    if (this.heroSlides().length >= 30) return;
    this.heroSlides.update(slides => [...slides, { image: '', title: '', titleEn: '', subtitle: '', subtitleEn: '' }]);
  }

  removeHeroSlide(index: number) {
    this.heroSlides.update(slides => slides.filter((_, i) => i !== index));
  }

  uploadHeroSlide(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      this.showFeedback(this.language.t('حجم الصورة أكبر من 10 ميجابايت.', 'Image exceeds 10 MB.'), 'error');
      input.value = '';
      return;
    }
    this.uploadingHeroSlide.set(index);
    this.api.uploadImage(file, 'banners').subscribe({
      next: result => {
        this.updateHeroSlide(index, 'image', result.url);
        this.uploadingHeroSlide.set(null);
        this.showFeedback(this.language.t('تم رفع الصورة. اضغط حفظ التغييرات لنشر الشريحة.', 'Image uploaded. Save changes to publish the slide.'), 'success');
      },
      error: () => {
        this.uploadingHeroSlide.set(null);
        this.showFeedback(this.language.t('تعذر رفع صورة الشريحة.', 'Could not upload the slide image.'), 'error');
      }
    });
    input.value = '';
  }

  private syncHeroSlidesToSettings() {
    this.settings['HeroSlideCount'] = String(this.heroSlides().length);
    this.heroSlides().forEach((slide, index) => {
      const slot = index + 1;
      this.settings[`HeroBanner${slot}`] = slide.image;
      this.settings[`HeroSlideTitleAr${slot}`] = slide.title;
      this.settings[`HeroSlideTitleEn${slot}`] = slide.titleEn;
      this.settings[`HeroSlideSubtitleAr${slot}`] = slide.subtitle;
      this.settings[`HeroSlideSubtitleEn${slot}`] = slide.subtitleEn;
    });
    this.settings['HeroBadgeFontSize'] = String(this.badgeFontSize());
  }

  bannerPreview(index: number): string {
    const url = this.settings[`HeroBanner${index}`];
    if (!url) return `assets/banners/banner-${index}.jpg`;
    return this.imageUrl(url);
  }

  logoPreview(): string {
    const url = this.settings['StoreLogo'];
    if (!url) return 'assets/MAIN.jpg';
    return this.imageUrl(url);
  }

  uploadLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { this.showFeedback(this.language.t('حجم الصورة أكبر من 10 ميجابايت.', 'Image exceeds 10 MB.'), 'error'); input.value = ''; return; }
    this.uploadingLogo.set(true);
    this.api.uploadImage(file, 'logo').subscribe({
      next: result => this.api.updateSetting('StoreLogo', result.url).subscribe({
        next: () => { this.settings['StoreLogo'] = result.url; this.uploadingLogo.set(false); this.showFeedback(this.language.t('تم رفع شعار الموقع وحفظه.', 'Store logo uploaded and saved.'), 'success'); },
        error: () => { this.uploadingLogo.set(false); this.showFeedback(this.language.t('تم الرفع لكن تعذر حفظ إعداد الشعار.', 'Logo uploaded, but its setting could not be saved.'), 'error'); }
      }),
      error: () => { this.uploadingLogo.set(false); this.showFeedback(this.language.t('تعذر رفع الشعار إلى الخادم.', 'Could not upload the logo.'), 'error'); }
    });
    input.value = '';
  }

  promoBannerPreview(index: number): string {
    const url = this.settings[`PromoBanner${index}`];
    if (!url) return index === 1 ? 'assets/morein-banner-1.png' : 'assets/morein-banner-2.jpg';
    return this.imageUrl(url);
  }

  uploadPromoBanner(event: Event, index: number) {
    const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) { this.showFeedback(this.language.t('حجم الصورة أكبر من 10 ميجابايت.', 'Image exceeds 10 MB.'), 'error'); input.value = ''; return; }
    this.api.uploadImage(file, 'banners').subscribe({ next: result => this.api.updateSetting(`PromoBanner${index}`, result.url).subscribe({
      next: () => { this.settings[`PromoBanner${index}`] = result.url; this.showFeedback(this.language.t('تم حفظ بنر العرض.', 'Promotion banner saved.'), 'success'); },
      error: () => this.showFeedback(this.language.t('تم رفع الصورة لكن تعذر حفظ إعداد البنر.', 'Image uploaded, but the banner setting could not be saved.'), 'error')
    }), error: () => this.showFeedback(this.language.t('تعذر رفع بنر العرض.', 'Could not upload the promotion banner.'), 'error') }); input.value = '';
  }

  uploadBanner(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      this.showFeedback(this.language.t('حجم الصورة أكبر من 10 ميجابايت.', 'Image exceeds 10 MB.'), 'error');
      input.value = '';
      return;
    }
    this.uploadingBanner.set(index);
    this.api.uploadImage(file, 'banners').subscribe({
      next: result => {
        const key = `HeroBanner${index}`;
        this.api.updateSetting(key, result.url).subscribe({
          next: () => {
            this.settings[key] = result.url;
            this.uploadingBanner.set(null);
            this.showFeedback(this.language.t('تم رفع صورة الشريحة وحفظها بنجاح.', 'Slide image uploaded and saved.'), 'success');
          },
          error: () => {
            this.uploadingBanner.set(null);
            this.showFeedback(this.language.t('تم رفع الصورة لكن تعذر حفظ إعدادها.', 'Image uploaded, but its setting could not be saved.'), 'error');
          }
        });
      },
      error: () => {
        this.uploadingBanner.set(null);
        this.showFeedback(this.language.t('تعذر رفع الصورة. تأكد من تشغيل الباك إند وتسجيل الدخول.', 'Could not upload the image. Check the server and admin sign-in.'), 'error');
      }
    });
    input.value = '';
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      settings: this.api.getSettings(),
      branches: this.auth.hasPermission('branches.view') ? this.api.getAdminBranches() : this.api.getBranches()
    }).subscribe({
      next: (res) => {
        if (res.settings && Object.keys(res.settings).length > 0) {
          this.settings = { ...this.settings, ...res.settings };
        }
        const configuredCount = res.settings?.['HeroSlideCount'];
        if (configuredCount !== undefined) {
          const count = Math.max(0, Math.min(30, Number.parseInt(configuredCount, 10) || 0));
          this.heroSlides.set(Array.from({ length: count }, (_, index) => {
            const slot = index + 1;
            return {
              image: res.settings?.[`HeroBanner${slot}`] || '',
              title: res.settings?.[`HeroSlideTitleAr${slot}`] || '',
              titleEn: res.settings?.[`HeroSlideTitleEn${slot}`] || '',
              subtitle: res.settings?.[`HeroSlideSubtitleAr${slot}`] || '',
              subtitleEn: res.settings?.[`HeroSlideSubtitleEn${slot}`] || ''
            };
          }));
        } else {
          this.heroSlides.set(this.defaultHeroSlides.map((slide, index) => ({
            ...slide,
            image: res.settings?.[`HeroBanner${index + 1}`] || slide.image
          })));
        }
        this.branches.set(res.branches || []);
        try {
          const savedZones = JSON.parse(res.settings?.['DeliveryZones'] || '[]') as DeliveryZone[];
          if (savedZones.length) this.deliveryZones.set(savedZones);
        } catch { /* Keep the seven emirate defaults until corrected in settings. */ }
      },
      error: () => {
        // Keep defaults on connection error
      }
    });
  }

  saveSettings() {
    this.isSaving.set(true);

    this.syncHeroSlidesToSettings();
    this.settings['DeliveryZones'] = JSON.stringify(this.deliveryZones());
    const keys = Object.keys(this.settings) as (keyof SiteSettings)[];
    const updates = keys
      .filter((k) => this.settings[k] !== undefined)
      .map((k) => this.api.updateSetting(k as string, this.settings[k] as string));

    if (updates.length === 0) {
      this.isSaving.set(false);
      return;
    }

    forkJoin(updates).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showFeedback(this.language.t('تم حفظ وتحديث إعدادات المتجر بنجاح.', 'Store settings saved successfully.'), 'success');
      },
      error: () => {
        this.isSaving.set(false);
        this.showFeedback(this.language.t('فشل حفظ بعض الإعدادات على الخادم.', 'Some settings could not be saved to the server.'), 'error');
      }
    });
  }

  updateDeliveryZone(index: number, key: 'emirate' | 'name' | 'nameEn' | 'fee' | 'enabled', value: string | number | boolean) {
    this.deliveryZones.update(zones => zones.map((zone, i) => i !== index ? zone : {
      ...zone,
      [key]: key === 'fee' ? Math.max(0, Number(value) || 0) : value
    }));
  }

  addDeliveryZone() {
    const id = `zone-${Date.now()}`;
    this.deliveryZones.update(zones => [...zones, { id, emirate: 'أبوظبي', emirateEn: 'Abu Dhabi', name: '', nameEn: '', fee: 10, enabled: true }]);
  }

  removeDeliveryZone(index: number) {
    this.deliveryZones.update(zones => zones.filter((_, i) => i !== index));
  }

  editingBranchId = signal<number | null>(null);

  openNewBranch() { this.editingBranchId.set(null); this.newBranch = { nameAr: '', nameEn: '', addressAr: '', addressEn: '', phone: '', whatsApp: '', isActive: true }; this.showBranchModal.set(true); }

  openEditBranch(branch: Branch) {
    this.editingBranchId.set(branch.branchId);
    this.newBranch = { nameAr: branch.nameAr, nameEn: branch.nameEn, addressAr: branch.addressAr, addressEn: branch.addressEn, phone: branch.phone, whatsApp: branch.whatsApp, latitude: branch.latitude, longitude: branch.longitude, isActive: branch.isActive };
    this.showBranchModal.set(true);
  }

  deleteBranch(branch: Branch) {
    if (!confirm(this.language.t(`حذف الفرع «${branch.nameAr}»؟`, `Delete branch “${branch.nameEn || branch.nameAr}”?`))) return;
    this.api.deleteBranch(branch.branchId).subscribe({ next: () => { this.branches.update(items => items.filter(item => item.branchId !== branch.branchId)); this.showFeedback(this.language.t('تم حذف الفرع.','Branch deleted.'),'success'); }, error: err => this.showFeedback(this.language.isEnglish() ? 'Could not delete this branch.' : (err.error?.message || 'تعذر حذف الفرع.'), 'error') });
  }

  saveBranch() {
    if (!this.newBranch.nameAr || !this.newBranch.nameEn) {
      alert(this.language.t('يرجى كتابة اسم الفرع بالعربية والإنجليزية.', 'Enter the branch name in Arabic and English.'));
      return;
    }

    this.isSavingBranch.set(true);
    const branchId = this.editingBranchId();
    const request = branchId ? this.api.updateBranch(branchId, this.newBranch) : this.api.createBranch(this.newBranch);
    request.subscribe({
      next: (b) => {
        this.isSavingBranch.set(false);
        this.showBranchModal.set(false);
        this.branches.update(items => branchId ? items.map(item => item.branchId === branchId ? b : item) : [...items, b]);
        this.editingBranchId.set(null);
        this.newBranch = { nameAr: '', nameEn: '', addressAr: '', addressEn: '', phone: '', whatsApp: '', isActive: true };
        this.showFeedback(branchId ? this.language.t('تم تحديث الفرع.', 'Branch updated.') : this.language.t('تمت إضافة الفرع الجديد بنجاح.', 'Branch added successfully.'), 'success');
      },
      error: () => {
        this.isSavingBranch.set(false);
        this.showFeedback(this.language.t('فشل إضافة الفرع على الخادم.', 'Could not add the branch.'), 'error');
      }
    });
  }

  private showFeedback(msg: string, type: 'success' | 'error') {
    this.feedbackMessage.set(msg);
    this.feedbackType.set(type);
    setTimeout(() => {
      if (this.feedbackMessage() === msg) this.feedbackMessage.set('');
    }, 4000);
  }
}
