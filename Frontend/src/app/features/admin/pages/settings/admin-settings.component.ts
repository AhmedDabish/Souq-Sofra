import { LanguageService } from '../../../../core/services/language.service';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Branch, SiteSettings, DeliveryZone } from '../../../../core/models/models';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { forkJoin } from 'rxjs';

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
            (click)="saveSettings()"
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
                  <button type="button" (click)="addDeliveryZone()" class="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white">+ {{ language.t('إضافة منطقة', 'Add area') }}</button>
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
                      <button type="button" (click)="removeDeliveryZone(i)" class="rounded-lg px-2 py-2 text-xs font-bold text-red-600 hover:bg-red-50 sm:col-span-1" [attr.aria-label]="language.t('حذف ', 'Delete ') + (language.isEnglish() ? (zone.nameEn || zone.name) : zone.name)">{{ language.t('حذف', 'Delete') }}</button>
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
            <div class="flex items-center gap-4"><img [src]="logoPreview()" [alt]="language.t('معاينة شعار الموقع', 'Store logo preview')" class="h-24 w-24 rounded-full border bg-orange-50 object-cover"><div><label class="inline-flex cursor-pointer rounded-xl bg-orange-50 px-4 py-3 text-xs font-bold text-orange-800 hover:bg-orange-100">{{ uploadingLogo() ? language.t('جارٍ الرفع…', 'Uploading…') : language.t('اختيار شعار ورفعه', 'Choose and upload logo') }}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="uploadLogo($event)" class="sr-only"></label><p class="mt-2 text-[10px] text-gray-400">{{ language.t('سيتم حفظ مسار الصورة في إعدادات المتجر.', 'The image path will be saved in store settings.') }}</p></div></div>
          </div>

          <!-- Homepage banner management -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <div class="border-b border-gray-100 pb-4">
              <h2 class="text-base font-bold font-baloo text-gray-800">{{ language.t('صور واجهة المتجر', 'Storefront images') }}</h2>
              <p class="text-[11px] text-gray-400">{{ language.t('اختيار ورفع صور شرائح الصفحة الرئيسية إلى مجلد wwwroot/uploads/banners', 'Upload homepage slide images') }}</p>
            </div>
            <div class="grid grid-cols-1 gap-4">
              @for (index of [1, 2, 3]; track index) {
                <div class="flex items-center gap-4 rounded-2xl border border-gray-100 p-3">
                  <img [src]="bannerPreview(index)" [alt]="language.t('معاينة الشريحة', 'Slide preview') + ' ' + index" class="w-28 h-16 rounded-xl object-cover bg-orange-50">
                  <div class="flex-1">
                    <p class="font-bold text-xs text-gray-700 mb-2">{{ language.t('الشريحة', 'Slide') }} {{ index }}</p>
                    <label class="inline-flex cursor-pointer rounded-lg bg-orange-50 px-3 py-2 text-[11px] font-bold text-orange-700 hover:bg-orange-100">
                      {{ language.t('اختيار صورة ورفعها', 'Choose and upload image') }}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="uploadBanner($event, index)" class="sr-only">
                    </label>
                    @if (uploadingBanner() === index) { <span class="mr-2 text-[10px] text-gray-500">{{ language.t('جارٍ الرفع...', 'Uploading...') }}</span> }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Additional homepage promo banners -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <div class="border-b border-gray-100 pb-4"><h2 class="text-base font-bold font-baloo text-gray-800">{{ language.t('بنرات العروض الإضافية', 'Additional promotion banners') }}</h2><p class="text-[11px] text-gray-400">{{ language.t('إدارة الصور الإضافية الظاهرة في الصفحة الرئيسية.', 'Manage additional homepage images.') }}</p></div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              @for (index of [1, 2]; track index) {
                <div class="rounded-2xl border border-gray-100 p-3"><img [src]="promoBannerPreview(index)" [alt]="language.t('بنر عرض', 'Promotion banner') + ' ' + index" class="mb-3 h-32 w-full rounded-xl bg-orange-50 object-cover"><p class="mb-2 text-xs font-bold">{{ language.t('بنر العرض', 'Promotion banner') }} {{ index }}</p><label class="inline-flex cursor-pointer rounded-lg bg-orange-50 px-3 py-2 text-[11px] font-bold text-orange-700">{{ language.t('اختيار صورة ورفعها', 'Choose and upload image') }}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="uploadPromoBanner($event, index)" class="sr-only"></label></div>
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
                (click)="showBranchModal.set(true)"
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

                  <div class="flex items-center gap-4 text-[11px] text-primary font-medium pt-2 border-t border-gray-100">
                    <div>📞 {{ branch.phone }}</div>
                    <div>💬 {{ branch.whatsApp }}</div>
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
              <h2 class="text-base font-bold font-baloo text-gray-800">{{ language.t('إضافة فرع جديد', 'Add branch') }}</h2>
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
                <button type="submit" [disabled]="isSavingBranch()" class="px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-bold shadow-md">
                  {{ language.t('إضافة الفرع', 'Add branch') }}
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
  private api = inject(ApiService);

  settings: SiteSettings = {
    Announcement: 'أهلاً بكم في مطعم ومخبز سوق وسفرة (Good Food, Good Mood) - التوصيل متاح الآن بأبوظبي!',
    AnnouncementEn: 'Welcome to Souq & Sofra Restaurant and Bakery - delivery is available in Abu Dhabi!',
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

  bannerPreview(index: number): string {
    const url = this.settings[`HeroBanner${index}`];
    if (!url) return `assets/banners/banner-${index}.jpg`;
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }

  logoPreview(): string {
    const url = this.settings['StoreLogo'];
    if (!url) return 'assets/MAIN.jpg';
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
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
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
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
      branches: this.api.getBranches()
    }).subscribe({
      next: (res) => {
        if (res.settings && Object.keys(res.settings).length > 0) {
          this.settings = { ...this.settings, ...res.settings };
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

  saveBranch() {
    if (!this.newBranch.nameAr || !this.newBranch.nameEn) {
      alert(this.language.t('يرجى كتابة اسم الفرع بالعربية والإنجليزية.', 'Enter the branch name in Arabic and English.'));
      return;
    }

    this.isSavingBranch.set(true);
    this.api.createBranch(this.newBranch).subscribe({
      next: (b) => {
        this.isSavingBranch.set(false);
        this.showBranchModal.set(false);
        this.branches.set([...this.branches(), b]);
        this.newBranch = { nameAr: '', nameEn: '', addressAr: '', addressEn: '', phone: '', whatsApp: '', isActive: true };
        this.showFeedback(this.language.t('تمت إضافة الفرع الجديد بنجاح.', 'Branch added successfully.'), 'success');
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
