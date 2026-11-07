import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, SiteAnalytics } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';

type ProductSort = 'unitsSold' | 'completedOrders' | 'orderSharePercent' | 'productPageViews';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
  template: `
    <div class="admin-shell min-h-screen bg-gray-50 flex font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">
      <app-admin-sidebar />
      <main class="min-w-0 flex-1 p-5 pt-20 md:p-8 lg:mr-64">
        <header class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h1 class="text-2xl font-black font-baloo text-gray-800">{{ language.t('تحليلات الموقع والمنتجات', 'Site & product analytics') }}</h1><p class="mt-1 text-xs text-gray-400">{{ language.t('اختر فترة لعرض الزيارات والطلبات والمبيعات خلالها.', 'Choose a date range for visits, orders, and sales.') }}</p></div>
          <div class="flex flex-wrap items-end gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <label class="text-[11px] font-bold text-gray-500">{{ language.t('من', 'From') }}<input type="date" [value]="fromDate()" (input)="fromDate.set($any($event.target).value)" class="mt-1 block rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs text-gray-700 outline-none focus:border-primary" /></label>
            <label class="text-[11px] font-bold text-gray-500">{{ language.t('إلى', 'To') }}<input type="date" [value]="toDate()" (input)="toDate.set($any($event.target).value)" class="mt-1 block rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs text-gray-700 outline-none focus:border-primary" /></label>
            <button type="button" (click)="load()" [disabled]="loading()" class="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50">{{ loading() ? language.t('جارٍ التحميل…', 'Loading…') : language.t('عرض الفترة', 'Apply dates') }}</button>
          </div>
        </header>

        @if (error()) { <div class="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">{{ error() }}</div> }
        @if (loading() && !data()) { <div class="rounded-3xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">{{ language.t('جارٍ تحميل التحليلات…', 'Loading analytics…') }}</div> }
        @if (data(); as analytics) {
          <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article class="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs"><p class="text-xs font-bold text-gray-400">{{ language.t('زيارات الصفحات', 'Page views') }}</p><p class="mt-3 text-3xl font-black text-gray-800">{{ analytics.visits.toLocaleString() }}</p><p class="mt-1 text-[11px] text-gray-400">{{ language.t('الفترة المحددة · تُحتسب زيارة جديدة بعد 30 دقيقة', 'Selected period · a new visit counts after 30 minutes') }}</p></article>
            <article class="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs"><p class="text-xs font-bold text-gray-400">{{ language.t('زوار مميزون تقريباً', 'Approx. unique visitors') }}</p><p class="mt-3 text-3xl font-black text-gray-800">{{ analytics.uniqueVisitors.toLocaleString() }}</p><p class="mt-1 text-[11px] text-gray-400">{{ language.t('متصفح مجهول، وليس ملفاً شخصياً', 'Anonymous browsers, not user profiles') }}</p></article>
            <article class="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs"><p class="text-xs font-bold text-gray-400">{{ language.t('طلبات مكتملة', 'Completed orders') }}</p><p class="mt-3 text-3xl font-black text-gray-800">{{ analytics.completedOrders.toLocaleString() }}</p><p class="mt-1 text-[11px] text-gray-400">{{ analytics.ordersFromWebsite }} {{ language.t('الموقع', 'website') }} · {{ analytics.ordersFromWhatsApp }} WhatsApp</p></article>
            <article class="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs"><p class="text-xs font-bold text-gray-400">{{ language.t('إيراد الطلبات المكتملة', 'Completed-order revenue') }}</p><p class="mt-3 text-3xl font-black text-gray-800">{{ analytics.completedRevenue.toLocaleString(language.isEnglish() ? 'en-AE' : 'ar-AE', { maximumFractionDigits: 2 }) }} <span class="text-sm text-primary">{{ language.isEnglish() ? 'AED' : 'درهم' }}</span></p><p class="mt-1 text-[11px] text-gray-400">{{ language.t('متوسط الطلب', 'Average order') }}: {{ analytics.averageCompletedOrder.toFixed(2) }}</p></article>
          </div>

          <div class="mb-6 grid gap-6 xl:grid-cols-5">
            <section class="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs xl:col-span-3">
              <div class="mb-5"><h2 class="font-black text-gray-800">{{ language.t('الزيارات اليومية', 'Daily visits') }}</h2><p class="mt-1 text-[11px] text-gray-400">{{ analytics.periodStart.slice(0, 10) }} – {{ analytics.periodEnd.slice(0, 10) }} · {{ language.t('حسب توقيت الخادم', 'server time') }}</p></div>
              <div class="flex h-52 items-end gap-2 overflow-x-auto border-b border-gray-100 pb-2">
                @for (day of analytics.dailyVisits; track day.date) {
                  <div class="flex h-full min-w-7 flex-1 flex-col items-center justify-end gap-1" [title]="day.date + ': ' + day.visits">
                    <span class="text-[9px] font-bold text-gray-500">{{ day.visits }}</span>
                    <div class="w-full max-w-9 rounded-t-lg bg-gradient-to-t from-orange-600 to-amber-400" [style.height.%]="barHeight(day.visits, analytics.dailyVisits)"></div>
                    <span class="text-[8px] text-gray-400">{{ day.date.slice(5) }}</span>
                  </div>
                }
              </div>
            </section>
            <section class="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs xl:col-span-2">
              <h2 class="mb-1 font-black text-gray-800">{{ language.t('أكثر الصفحات زيارة', 'Top pages') }}</h2><p class="mb-4 text-[11px] text-gray-400">{{ language.t('حسب عدد الزيارات المسجلة', 'Ranked by recorded page views') }}</p>
              @for (page of analytics.topPages; track page.path) { <div class="flex items-center justify-between gap-3 border-b border-gray-50 py-2.5 text-xs"><span class="min-w-0 truncate font-medium text-gray-700" [attr.dir]="isProductPage(page.path) ? 'rtl' : 'ltr'">@if (isProductPage(page.path) && (language.isEnglish() ? page.displayNameEn : page.displayNameAr)) { {{ language.isEnglish() ? (page.displayNameEn || page.displayNameAr) : (page.displayNameAr || page.displayNameEn) }} } @else { {{ page.path }} }</span><span class="shrink-0 font-black text-primary">{{ page.visits }}</span></div> }
              @if (!analytics.topPages.length) { <p class="rounded-xl bg-gray-50 p-4 text-xs text-gray-500">{{ language.t('ستظهر البيانات بعد بدء تسجيل الزيارات الجديدة.', 'Data will appear after new visits are recorded.') }}</p> }
            </section>
          </div>

          <section class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xs">
            <div class="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-end lg:justify-between">
              <div><h2 class="font-black text-gray-800">{{ language.t('أداء كل منتج', 'Product performance') }}</h2><p class="mt-1 text-[11px] text-gray-400">{{ language.t('المبيعات محسوبة من الطلبات المكتملة. حصة الطلبات = الطلبات المكتملة التي تضمنت المنتج ÷ كل الطلبات المكتملة.', 'Sales use completed orders. Order share = completed orders containing the product ÷ all completed orders.') }}</p></div>
              <div class="grid gap-2 sm:grid-cols-2 lg:min-w-[420px]">
                <label class="text-[11px] font-bold text-gray-500">{{ language.t('ابحث عن منتج', 'Search products') }}<input type="search" [value]="productSearch()" (input)="productSearch.set($any($event.target).value)" [placeholder]="language.t('اكتب اسم المنتج…', 'Type a product name…')" class="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs outline-none focus:border-primary" /></label>
                <label class="text-[11px] font-bold text-gray-500">{{ language.t('ترتيب من الأعلى', 'Sort highest first') }}<select [value]="sortBy()" (change)="setSortBy($any($event.target).value)" class="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-primary"><option value="unitsSold">{{ language.t('الكمية المباعة', 'Units sold') }}</option><option value="completedOrders">{{ language.t('طلبات المنتج', 'Product orders') }}</option><option value="orderSharePercent">{{ language.t('حصة الطلبات', 'Order share') }}</option><option value="productPageViews">{{ language.t('مشاهدات المنتج', 'Product views') }}</option></select></label>
              </div>
            </div>
            <div class="overflow-x-auto"><table class="w-full min-w-[760px] text-right text-xs"><thead class="bg-gray-50 text-gray-500"><tr><th class="p-4">{{ language.t('المنتج', 'Product') }}</th><th class="p-4">{{ language.t('الكمية المباعة', 'Units sold') }}</th><th class="p-4">{{ language.t('طلبات المنتج', 'Product orders') }}</th><th class="p-4">{{ language.t('حصة الطلبات', 'Order share') }}</th><th class="p-4">{{ language.t('مشاهدات الصفحة', 'Page views') }}</th></tr></thead><tbody class="divide-y divide-gray-100">
              @for (product of visibleProducts(); track product.productId) { <tr><td class="p-4 font-bold text-gray-800">{{ language.isEnglish() ? (product.nameEn || product.nameAr) : product.nameAr }}</td><td class="p-4">{{ product.unitsSold }}</td><td class="p-4">{{ product.completedOrders }}</td><td class="p-4"><span class="rounded-full bg-orange-50 px-2.5 py-1 font-bold text-orange-700">{{ product.orderSharePercent }}%</span></td><td class="p-4">{{ product.productPageViews }}</td></tr> }
              @if (!visibleProducts().length) { <tr><td colspan="5" class="p-8 text-center text-gray-400">{{ language.t('لا توجد منتجات تطابق البحث في الفترة المحددة.', 'No products match your search in this period.') }}</td></tr> }
            </tbody></table></div>
            <p class="border-t border-gray-100 px-5 py-3 text-[10px] leading-5 text-gray-400">{{ language.t('ملاحظة: لا يتوفر سجل زيارات تاريخي قبل نشر هذه النسخة؛ لذلك قد تكون مشاهدات المنتجات والتحويل صفراً في البداية. قياس الزائر يعتمد على معرّف مجهول في المتصفح وقد لا يساوي شخصاً واحداً.', 'Note: historical visits cannot be backfilled, so product views and conversion may initially be zero. Visitor counts use an anonymous browser identifier and are not guaranteed to represent individual people.') }}</p>
          </section>
        }
      </main>
    </div>
  `
})
export class AdminAnalyticsComponent implements OnInit {
  language = inject(LanguageService);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  data = signal<SiteAnalytics | null>(null);
  loading = signal(false);
  error = signal('');
  fromDate = signal(this.defaultFromDate());
  toDate = signal(this.defaultToDate());
  productSearch = signal('');
  sortBy = signal<ProductSort>('unitsSold');
  visibleProducts = computed(() => {
    const analytics = this.data();
    if (!analytics) return [];
    const query = this.productSearch().trim().toLocaleLowerCase();
    return analytics.productSales
      .filter(product => !query || `${product.nameAr} ${product.nameEn}`.toLocaleLowerCase().includes(query))
      .slice()
      .sort((a, b) => b[this.sortBy()] - a[this.sortBy()] || a.nameAr.localeCompare(b.nameAr));
  });

  ngOnInit() { this.load(); }
  load() {
    if (!this.auth.hasPermission('analytics.view')) { this.error.set(this.language.t('ليس لديك صلاحية عرض التحليلات.', 'You do not have permission to view analytics.')); return; }
    if (!this.fromDate() || !this.toDate() || this.fromDate() > this.toDate()) {
      this.error.set(this.language.t('اختار تاريخ بداية ونهاية صحيحين.', 'Choose a valid start and end date.'));
      return;
    }
    this.loading.set(true); this.error.set('');
    this.api.getAnalytics(this.fromDate(), this.toDate()).subscribe({
      next: result => { this.data.set(result); this.loading.set(false); },
      error: response => { this.loading.set(false); this.error.set(response?.error?.message || this.language.t('تعذر تحميل التحليلات. تأكد من تشغيل الخادم وتحديث قاعدة البيانات.', 'Could not load analytics. Check the server and database migration.')); }
    });
  }

  setSortBy(value: string) {
    if (['unitsSold', 'completedOrders', 'orderSharePercent', 'productPageViews'].includes(value)) this.sortBy.set(value as ProductSort);
  }

  isProductPage(path: string): boolean { return path.startsWith('/product/'); }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  private defaultToDate(): string { return this.formatLocalDate(new Date()); }
  private defaultFromDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return this.formatLocalDate(date);
  }
  barHeight(value: number, days: SiteAnalytics['dailyVisits']): number {
    const max = Math.max(1, ...days.map(day => day.visits));
    return value === 0 ? 2 : Math.max(6, Math.round(value * 100 / max));
  }
}
