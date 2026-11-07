import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { DeliveryZone } from '../../../../core/models/models';
import { chunkDeliveryZones, mergeDeliveryZones, readDeliveryZones } from '../../../../core/utils/delivery-zone-settings';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-delivery-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-shell min-h-screen bg-gray-50 flex font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">
      <app-admin-sidebar />
      <main class="min-w-0 flex-1 p-5 pt-20 md:p-8 lg:mr-64">
        <header class="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h1 class="text-2xl font-black font-baloo text-gray-800">{{ language.t('مناطق ورسوم التوصيل', 'Delivery areas & fees') }}</h1><p class="mt-1 text-xs text-gray-400">{{ language.t('اختر المناطق التي يصل إليها التوصيل وحدد رسوم كل منطقة.', 'Choose the areas you serve and set a fee for each one.') }}</p></div>
          <button type="button" [hidden]="!auth.hasPermission('settings.update')" (click)="saveSettings()" [disabled]="saving()" class="rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50">{{ saving() ? language.t('جارٍ الحفظ…','Saving…') : language.t('💾 حفظ التغييرات','💾 Save changes') }}</button>
        </header>
        @if (feedback()) { <div [class]="feedbackError() ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'" class="mb-5 rounded-2xl border p-4 text-xs font-semibold">{{ feedback() }}</div> }
        <div class="mb-6 grid gap-4 lg:grid-cols-2">
          <label class="rounded-2xl border border-gray-100 bg-white p-5 text-xs font-bold text-gray-700 shadow-xs">{{ language.t('رسوم التوصيل الافتراضية (درهم)', 'Default delivery fee (AED)') }}<input type="number" min="0" step="0.5" [(ngModel)]="defaultDeliveryFee" name="defaultDeliveryFee" class="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" [disabled]="!auth.hasPermission('settings.update')"></label>
          <div class="rounded-2xl border border-gray-100 bg-white p-5 text-xs leading-6 text-gray-500 shadow-xs">{{ language.t('رسوم المنطقة المحددة هي التي تُطبق على الطلب عند اختيارها. المناطق الجديدة تبدأ غير مفعلة حتى تختار مناطق الخدمة بنفسك.', 'The selected area fee is charged for each delivery order. New areas start disabled so you can choose exactly where you deliver.') }}</div>
        </div>
        <div class="rounded-3xl border border-gray-100 bg-white p-4 shadow-xs sm:p-6">
                        <section class="rounded-2xl border border-orange-100 bg-orange-50/40 p-4 space-y-4">
                <div class="flex items-start justify-between gap-3">
                  <div><h3 class="font-bold text-sm text-gray-800">{{ language.t('مناطق ورسوم التوصيل', 'Delivery areas & fees') }}</h3><p class="mt-1 text-[11px] text-gray-500">{{ language.t('ابدأ بالإمارات السبع، وأضف مناطق فرعية وحدد رسوم كل منطقة أو أوقف التوصيل إليها.', 'Start with the seven emirates, add areas, set fees, or disable delivery.') }}</p></div>
                  <button type="button" [hidden]="!auth.hasPermission('settings.update')" (click)="addDeliveryZone()" class="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white">+ {{ language.t('إضافة منطقة', 'Add area') }}</button>
                </div>
                <p class="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[11px] leading-5 text-sky-800">{{ language.t('تضم القائمة أسماء المناطق والأحياء المتاحة في OpenStreetMap للإمارات السبع. المناطق المضافة تبدأ غير متاحة للتوصيل، فعّل فقط المناطق التي تخدمها. © OpenStreetMap contributors.', 'The list includes named places and neighborhoods available in OpenStreetMap for all seven emirates. New areas start unavailable; enable only the areas you serve. © OpenStreetMap contributors.') }}</p>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <label class="text-[11px] font-bold text-gray-600">{{ language.t('تصفية حسب الإمارة', 'Filter by emirate') }}
                    <select [disabled]="!auth.hasPermission('settings.update')" [ngModel]="deliveryZoneEmirateFilter()" (ngModelChange)="deliveryZoneEmirateFilter.set($event); deliveryZonePage.set(0)" name="deliveryZoneFilterEmirate" class="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs">
                      <option value="">{{ language.t('كل الإمارات', 'All emirates') }}</option>
                      @for (emirate of emirates; track emirate) { <option [value]="emirate">{{ language.isEnglish() ? emirateEn(emirate) : emirate }}</option> }
                    </select>
                  </label>
                  <label class="text-[11px] font-bold text-gray-600 sm:col-span-2">{{ language.t('بحث عن منطقة', 'Search areas') }}
                    <input [disabled]="!auth.hasPermission('settings.update')" [ngModel]="deliveryZoneSearch()" (ngModelChange)="deliveryZoneSearch.set($event); deliveryZonePage.set(0)" name="deliveryZoneSearch" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs" [placeholder]="language.t('اكتب اسم المنطقة أو الإمارة', 'Type an area or emirate name')">
                  </label>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 text-xs">
                  <span class="font-bold text-gray-600">{{ filteredDeliveryZones().length }} {{ language.t('منطقة مطابقة', 'matching areas') }} · {{ deliveryZones().filter(isZoneEnabled).length }} {{ language.t('متاحة', 'enabled') }}</span>
                  <div class="flex flex-wrap gap-2">
                    <button type="button" [disabled]="!auth.hasPermission('settings.update')" (click)="setFilteredDeliveryZonesEnabled(true)" class="rounded-lg border border-emerald-200 px-3 py-1.5 font-bold text-emerald-700 hover:bg-emerald-50">{{ language.t('تفعيل نتائج البحث', 'Enable search results') }}</button>
                    <button type="button" [disabled]="!auth.hasPermission('settings.update')" (click)="setFilteredDeliveryZonesEnabled(false)" class="rounded-lg border border-gray-200 px-3 py-1.5 font-bold text-gray-600 hover:bg-gray-50">{{ language.t('إيقاف نتائج البحث', 'Disable search results') }}</button>
                  </div>
                </div>
                <div class="space-y-3">
                  @for (entry of visibleDeliveryZones(); track entry.zone.id) {
                    @let zone = entry.zone;
                    @let i = entry.index;
                    <div class="grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-white p-3 sm:grid-cols-12 sm:items-end">
                      <label class="text-[11px] font-bold text-gray-600 sm:col-span-3">{{ language.t('الإمارة', 'Emirate') }}
                        <select [disabled]="!auth.hasPermission('settings.update')" [ngModel]="zone.emirate" (ngModelChange)="updateDeliveryZone(i, 'emirate', $event)" [name]="'emirate' + i" class="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-xs">
                          @for (emirate of emirates; track emirate) { <option [value]="emirate">{{ language.isEnglish() ? emirateEn(emirate) : emirate }}</option> }
                        </select>
                      </label>
                      <label class="text-[11px] font-bold text-gray-600 sm:col-span-3">{{ language.t('المنطقة / الحي بالعربية', 'Area in Arabic') }}
                        <input [disabled]="!auth.hasPermission('settings.update')" [ngModel]="zone.name" (ngModelChange)="updateDeliveryZone(i, 'name', $event)" [name]="'zoneName' + i" class="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-xs" [placeholder]="language.t('مثال: الكورنيش', 'Arabic area name')">
                      </label>
                      <label class="text-[11px] font-bold text-gray-600 sm:col-span-3">{{ language.t('المنطقة / الحي بالإنجليزية', 'Area in English') }}
                        <input [disabled]="!auth.hasPermission('settings.update')" [ngModel]="zone.nameEn || ''" (ngModelChange)="updateDeliveryZone(i, 'nameEn', $event)" [name]="'zoneNameEn' + i" class="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-xs" dir="ltr" [placeholder]="language.t('الترجمة الإنجليزية', 'English area name')">
                      </label>
                      <label class="text-[11px] font-bold text-gray-600 sm:col-span-1">{{ language.t('الرسوم (درهم)', 'Fee (AED)') }}
                        <input type="number" min="0" step="0.5" [disabled]="!auth.hasPermission('settings.update')" [ngModel]="zone.fee" (ngModelChange)="updateDeliveryZone(i, 'fee', $event)" [name]="'zoneFee' + i" class="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 text-xs">
                      </label>
                      <label class="flex items-center gap-2 text-[11px] font-bold text-gray-600 sm:col-span-1"><input type="checkbox" [disabled]="!auth.hasPermission('settings.update')" [ngModel]="zone.enabled" (ngModelChange)="updateDeliveryZone(i, 'enabled', $event)" [name]="'zoneEnabled' + i" class="accent-orange-500"> {{ language.t('متاح', 'Available') }}</label>
                      <button type="button" [hidden]="!auth.hasPermission('settings.update')" (click)="removeDeliveryZone(i)" class="rounded-lg px-2 py-2 text-xs font-bold text-red-600 hover:bg-red-50 sm:col-span-1" [attr.aria-label]="language.t('حذف ', 'Delete ') + (language.isEnglish() ? (zone.nameEn || zone.name) : zone.name)">{{ language.t('حذف', 'Delete') }}</button>
                    </div>
                  }
                  @if (filteredDeliveryZones().length === 0) {
                    <p class="rounded-xl bg-white p-5 text-center text-xs text-gray-500">{{ language.t('لا توجد مناطق مطابقة للبحث.', 'No areas match your search.') }}</p>
                  }
                </div>
                <div class="flex items-center justify-center gap-3">
                  <button type="button" (click)="previousDeliveryZonePage()" [disabled]="deliveryZonePage() === 0" class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40">{{ language.t('السابق', 'Previous') }}</button>
                  <span class="text-xs font-bold text-gray-600">{{ deliveryZonePage() + 1 }} / {{ deliveryZonePageCount() }}</span>
                  <button type="button" (click)="nextDeliveryZonePage()" [disabled]="deliveryZonePage() + 1 >= deliveryZonePageCount()" class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40">{{ language.t('التالي', 'Next') }}</button>
                </div>
              </section>
        </div>
      </main>
    </div>
  `
})
export class AdminDeliverySettingsComponent implements OnInit {
  language = inject(LanguageService);
  auth = inject(AuthService);
  private api = inject(ApiService);
  private notifications = inject(NotificationService);
  readonly emirates = ['أبوظبي', 'دبي', 'الشارقة', 'عجمان', 'أم القيوين', 'رأس الخيمة', 'الفجيرة'];
  emirateEn(name: string): string { return ({'أبوظبي':'Abu Dhabi','دبي':'Dubai','الشارقة':'Sharjah','عجمان':'Ajman','أم القيوين':'Umm Al Quwain','رأس الخيمة':'Ras Al Khaimah','الفجيرة':'Fujairah'} as Record<string,string>)[name] || name; }
  deliveryZones = signal<DeliveryZone[]>(mergeDeliveryZones([]));
  deliveryZoneEmirateFilter = signal('');
  deliveryZoneSearch = signal('');
  deliveryZonePage = signal(0);
  readonly deliveryZonesPerPage = 40;
  defaultDeliveryFee = '10.00';
  saving = signal(false);
  feedback = signal('');
  feedbackError = signal(false);
  filteredDeliveryZones = computed(() => {
    const search = this.deliveryZoneSearch().trim().toLocaleLowerCase();
    const emirate = this.deliveryZoneEmirateFilter();
    return this.deliveryZones().map((zone, index) => ({ zone, index })).filter(({ zone }) => {
      const matchesEmirate = !emirate || zone.emirate === emirate;
      const haystack = `${zone.name} ${zone.nameEn || ''} ${zone.emirate} ${zone.emirateEn || ''}`.toLocaleLowerCase();
      return matchesEmirate && (!search || haystack.includes(search));
    });
  });
  visibleDeliveryZones = computed(() => { const start = this.deliveryZonePage() * this.deliveryZonesPerPage; return this.filteredDeliveryZones().slice(start, start + this.deliveryZonesPerPage); });
  deliveryZonePageCount = computed(() => Math.max(1, Math.ceil(this.filteredDeliveryZones().length / this.deliveryZonesPerPage)));

  ngOnInit() {
    this.api.getSettings().subscribe({
      next: settings => { this.defaultDeliveryFee = settings['DeliveryFee'] || '10.00'; this.deliveryZones.set(mergeDeliveryZones(readDeliveryZones(settings))); },
      error: () => this.setFeedback(this.language.t('تعذر تحميل إعدادات التوصيل.', 'Could not load delivery settings.'), true)
    });
  }

  saveSettings() {
    if (!this.auth.hasPermission('settings.update')) return;
    this.saving.set(true); this.feedback.set('');
    const settings = { DeliveryFee: String(Math.max(0, Number(this.defaultDeliveryFee) || 0)), ...chunkDeliveryZones(this.deliveryZones()) };
    this.api.updateSettings(settings).subscribe({
      next: () => { this.saving.set(false); this.setFeedback(this.language.t('تم حفظ مناطق ورسوم التوصيل بنجاح.', 'Delivery areas and fees saved successfully.'), false); },
      error: () => { this.saving.set(false); this.setFeedback(this.language.t('تعذر حفظ إعدادات التوصيل.', 'Could not save delivery settings.'), true); }
    });
  }

  isZoneEnabled(zone: DeliveryZone): boolean { return zone.enabled; }
  previousDeliveryZonePage() { this.deliveryZonePage.update(page => Math.max(0, page - 1)); }
  nextDeliveryZonePage() { this.deliveryZonePage.update(page => Math.min(this.deliveryZonePageCount() - 1, page + 1)); }
  setFilteredDeliveryZonesEnabled(enabled: boolean) {
    if (!this.auth.hasPermission('settings.update')) return;
    const ids = new Set(this.filteredDeliveryZones().map(({ zone }) => zone.id));
    this.deliveryZones.update(zones => zones.map(zone => ids.has(zone.id) ? { ...zone, enabled } : zone));
  }
  updateDeliveryZone(index: number, key: 'emirate' | 'name' | 'nameEn' | 'fee' | 'enabled', value: string | number | boolean) {
    if (!this.auth.hasPermission('settings.update')) return;
    this.deliveryZones.update(zones => zones.map((zone, i) => i !== index ? zone : { ...zone, [key]: key === 'fee' ? Math.max(0, Number(value) || 0) : value }));
  }
  addDeliveryZone() {
    if (!this.auth.hasPermission('settings.update')) return;
    const id = `zone-${Date.now()}`;
    this.deliveryZones.update(zones => [...zones, { id, emirate: 'أبوظبي', emirateEn: 'Abu Dhabi', name: '', nameEn: '', fee: 10, enabled: false }]);
  }
  async removeDeliveryZone(index: number) {
    if (!this.auth.hasPermission('settings.update')) return;
    const zone = this.deliveryZones()[index]; if (!zone) return;
    const label = this.language.isEnglish() ? (zone.nameEn || zone.name) : zone.name;
    if (!(await this.notifications.confirm(this.language.t(`حذف أو إيقاف منطقة «${label}»؟`, `Remove or disable “${label}”?`)))) return;
    if (zone.id.startsWith('osm-') || zone.id.startsWith('uae-')) { this.updateDeliveryZone(index, 'enabled', false); return; }
    this.deliveryZones.update(zones => zones.filter((_, i) => i !== index));
  }
  private setFeedback(message: string, error: boolean) { this.feedback.set(message); this.feedbackError.set(error); this.notifications.show(message, error ? 'error' : 'success'); }
}
