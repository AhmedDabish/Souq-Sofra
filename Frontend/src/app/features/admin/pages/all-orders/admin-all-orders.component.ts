import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminOrder } from '../../../../core/models/models';
import { ApiService } from '../../../../core/services/api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-all-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-[#f7f8fa] font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">
      <app-admin-sidebar />
      <main class="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:mr-64 lg:px-8">
        <header class="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div class="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold text-orange-800">
              <span class="h-2 w-2 rounded-full bg-orange-500"></span>
              {{ language.t('أرشيف الطلبات', 'Orders archive') }}
            </div>
            <h1 class="text-2xl font-black text-slate-900 sm:text-3xl">{{ language.t('كل الطلبات', 'All orders') }}</h1>
            <p class="mt-1 text-sm text-slate-500">{{ language.t('استعرض وابحث في جميع الطلبات المسجلة بالمطعم.', 'Browse and search every order recorded by the restaurant.') }}</p>
          </div>
          <button type="button" (click)="loadOrders()" [disabled]="isLoading()" class="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-800 disabled:cursor-wait disabled:opacity-60 sm:self-auto">
            <span [class.animate-spin]="isLoading()">↻</span>
            {{ language.t('تحديث القائمة', 'Refresh list') }}
          </button>
        </header>

        <section class="mb-5 grid gap-3 sm:grid-cols-2">
          <article class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p class="text-xs font-semibold text-slate-500">{{ language.t('إجمالي الطلبات المحمّلة', 'Total loaded orders') }}</p>
            <p class="mt-2 text-2xl font-black text-slate-900">{{ orders().length }}</p>
          </article>
          <article class="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm">
            <p class="text-xs font-semibold text-orange-800">{{ language.t('الطلبات المطابقة للبحث والفترة', 'Orders matching search and date range') }}</p>
            <p class="mt-2 text-2xl font-black text-orange-900">{{ filteredOrders().length }}</p>
          </article>
        </section>

        <section class="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5" aria-label="Order filters">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="font-extrabold text-slate-800">{{ language.t('البحث والتصفية', 'Search and filter') }}</h2>
              <p class="mt-1 text-xs text-slate-500">{{ language.t('ابحث برقم الطلب أو اسم العميل أو رقم هاتفه، وحدد الفترة عند الحاجة.', 'Search by order number, customer name, or phone, and optionally choose a date range.') }}</p>
            </div>
            <button type="button" (click)="resetFilters()" [disabled]="!hasFilters()" class="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-orange-800 disabled:cursor-default disabled:opacity-40">
              {{ language.t('مسح الفلاتر', 'Clear filters') }}
            </button>
          </div>
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.6fr)_minmax(150px,.7fr)_minmax(150px,.7fr)]">
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold text-slate-600">{{ language.t('بحث سريع', 'Quick search') }}</span>
              <div class="relative">
                <svg class="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" [class.right-3]="!language.isEnglish()" [class.left-3]="language.isEnglish()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
                <input type="search" [ngModel]="searchQuery()" (ngModelChange)="updateSearch($event)" [placeholder]="language.t('رقم الطلب، الاسم، أو رقم الهاتف', 'Order number, name, or phone')" class="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" />
              </div>
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold text-slate-600">{{ language.t('من تاريخ', 'From date') }}</span>
              <input type="date" [ngModel]="dateFrom()" (ngModelChange)="updateDateFrom($event || '')" class="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold text-slate-600">{{ language.t('إلى تاريخ', 'To date') }}</span>
              <input type="date" [ngModel]="dateTo()" (ngModelChange)="updateDateTo($event || '')" [min]="dateFrom() || null" class="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" />
            </label>
          </div>
          @if (dateFrom() && dateTo() && dateFrom() > dateTo()) {
            <p class="mt-3 text-xs font-semibold text-rose-600">{{ language.t('تاريخ البداية يجب أن يكون قبل تاريخ النهاية.', 'The start date must be on or before the end date.') }}</p>
          }
        </section>

        @if (errorMessage()) {
          <div class="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center">
            <span>{{ errorMessage() }}</span>
            <button type="button" (click)="loadOrders()" class="rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 shadow-sm">{{ language.t('إعادة المحاولة', 'Try again') }}</button>
          </div>
        }

        <section class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
            <h2 class="font-extrabold text-slate-800">{{ language.t('سجل الطلبات', 'Order history') }}</h2>
            @if (isLoading()) { <span class="text-xs font-semibold text-slate-400">{{ language.t('جارٍ تحميل الطلبات...', 'Loading orders...') }}</span> }
            @else { <span class="text-xs font-semibold text-slate-500">{{ filteredOrders().length }} {{ language.t('طلب', 'orders') }}</span> }
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[850px] text-right text-sm">
              <thead class="bg-slate-50 text-xs font-bold text-slate-500">
                <tr>
                  <th class="px-4 py-3.5">{{ language.t('الطلب والتاريخ', 'Order & date') }}</th>
                  <th class="px-4 py-3.5">{{ language.t('العميل', 'Customer') }}</th>
                  <th class="px-4 py-3.5">{{ language.t('قناة الطلب', 'Channel') }}</th>
                  <th class="px-4 py-3.5">{{ language.t('الإجمالي', 'Total') }}</th>
                  <th class="px-4 py-3.5">{{ language.t('الحالة', 'Status') }}</th>
                  <th class="px-4 py-3.5 text-center">{{ language.t('التفاصيل', 'Details') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @if (isLoading() && !orders().length) {
                  <tr><td colspan="6" class="px-4 py-16 text-center text-sm text-slate-400"><span class="mb-3 inline-block h-7 w-7 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600 align-middle"></span><br />{{ language.t('نحمّل الطلبات الآن...', 'Loading your orders...') }}</td></tr>
                } @else {
                  @for (order of pagedOrders(); track order.orderId) {
                    <tr class="transition hover:bg-orange-50/40">
                      <td class="px-4 py-4"><span class="font-black text-slate-900">#{{ order.orderNumber }}</span><span class="mt-1 block text-[11px] text-slate-400">{{ formatDate(order.createdAt) }}</span></td>
                      <td class="px-4 py-4"><span class="block font-bold text-slate-800">{{ order.customerName }}</span><span class="mt-1 block text-xs text-slate-500" dir="ltr">{{ order.customerPhone }}</span></td>
                      <td class="px-4 py-4"><span [class]="order.orderChannel === 'WhatsApp' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'" class="rounded-full px-2.5 py-1 text-[11px] font-bold">{{ language.t(order.orderChannel === 'WhatsApp' ? 'واتساب' : 'الموقع', order.orderChannel === 'WhatsApp' ? 'WhatsApp' : 'Website') }}</span></td>
                      <td class="px-4 py-4 font-black text-orange-800">{{ order.totalAmount }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</td>
                      <td class="px-4 py-4"><span [class]="statusClass(order.orderStatus)" class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold">{{ statusLabel(order.orderStatus) }}</span></td>
                      <td class="px-4 py-4 text-center"><button type="button" (click)="selectedOrder.set(order)" class="rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800 transition hover:bg-orange-100">{{ language.t('عرض الطلب', 'View order') }}</button></td>
                    </tr>
                  } @empty {
                    @if (!isLoading()) {
                      <tr><td colspan="6" class="px-4 py-16 text-center"><div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-xl">⌕</div><p class="font-bold text-slate-700">{{ language.t('لا توجد طلبات مطابقة', 'No matching orders') }}</p><p class="mt-1 text-xs text-slate-400">{{ language.t('جرّب تغيير كلمات البحث أو نطاق التاريخ.', 'Try changing your search or date range.') }}</p></td></tr>
                    }
                  }
                }
              </tbody>
            </table>
          </div>
          @if (!isLoading() && filteredOrders().length > 0) {
            <div class="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p class="text-xs font-medium text-slate-500">{{ language.t('عرض', 'Showing') }} <span class="font-extrabold text-slate-800">{{ pageStart() }}–{{ pageEnd() }}</span> {{ language.t('من', 'of') }} <span class="font-extrabold text-slate-800">{{ filteredOrders().length }}</span> {{ language.t('طلب', 'orders') }}</p>
              <div class="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                <label class="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>{{ language.t('لكل صفحة', 'Per page') }}</span>
                  <select [ngModel]="pageSize()" (ngModelChange)="changePageSize($event)" class="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
                    <option [ngValue]="10">10</option><option [ngValue]="25">25</option><option [ngValue]="50">50</option>
                  </select>
                </label>
                <nav class="flex items-center gap-1" [attr.aria-label]="language.t('التنقل بين الصفحات', 'Pagination')">
                  <button type="button" (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() <= 1" [attr.aria-label]="language.t('الصفحة السابقة', 'Previous page')" class="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-bold text-slate-600 transition hover:border-orange-200 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-40">{{ language.isEnglish() ? '←' : '→' }}</button>
                  @for (item of paginationItems(); track $index) {
                    @if (item === 'ellipsis') { <span class="px-1 text-sm text-slate-400">…</span> }
                    @else { <button type="button" (click)="goToPage(item)" [attr.aria-current]="currentPage() === item ? 'page' : null" [class.border-orange-600]="currentPage() === item" [class.bg-orange-600]="currentPage() === item" [class.text-white]="currentPage() === item" [class.border-slate-200]="currentPage() !== item" [class.bg-white]="currentPage() !== item" [class.text-slate-600]="currentPage() !== item" class="h-9 min-w-9 rounded-lg border px-2 text-xs font-extrabold transition hover:border-orange-300">{{ item }}</button> }
                  }
                  <button type="button" (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages()" [attr.aria-label]="language.t('الصفحة التالية', 'Next page')" class="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-bold text-slate-600 transition hover:border-orange-200 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-40">{{ language.isEnglish() ? '→' : '←' }}</button>
                </nav>
              </div>
            </div>
          }
        </section>
      </main>

      @if (selectedOrder(); as order) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6" (click)="selectedOrder.set(null)">
          <section role="dialog" aria-modal="true" class="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl" (click)="$event.stopPropagation()">
            <header class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 p-5 backdrop-blur sm:p-6">
              <div><p class="text-xs font-bold text-orange-700">{{ language.t('تفاصيل الطلب', 'Order details') }}</p><h2 class="mt-1 text-xl font-black text-slate-900">#{{ order.orderNumber }}</h2><p class="mt-1 text-xs text-slate-500">{{ formatDate(order.createdAt) }}</p></div>
              <button type="button" (click)="selectedOrder.set(null)" class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" [attr.aria-label]="language.t('إغلاق', 'Close')">×</button>
            </header>
            <div class="space-y-5 p-5 sm:p-6">
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl bg-slate-50 p-4"><p class="text-[11px] font-bold text-slate-400">{{ language.t('العميل', 'Customer') }}</p><p class="mt-1 font-extrabold text-slate-800">{{ order.customerName }}</p><p class="mt-1 text-sm text-slate-600" dir="ltr">{{ order.customerPhone }}</p></div>
                <div class="rounded-2xl bg-slate-50 p-4"><p class="text-[11px] font-bold text-slate-400">{{ language.t('الحالة وطريقة الدفع', 'Status & payment') }}</p><p class="mt-1 font-extrabold text-slate-800">{{ statusLabel(order.orderStatus) }}</p><p class="mt-1 text-sm text-slate-600">{{ language.t(order.paymentMethod === 'CashOnDelivery' ? 'الدفع عند الاستلام' : 'بطاقة ائتمان', order.paymentMethod === 'CashOnDelivery' ? 'Cash on delivery' : 'Credit card') }}</p></div>
              </div>
              <div class="rounded-2xl border border-slate-100 p-4"><p class="text-[11px] font-bold text-slate-400">{{ language.t('عنوان التوصيل', 'Delivery address') }}</p><p class="mt-1 text-sm font-semibold leading-6 text-slate-700">{{ order.deliveryAddress }}</p>@if (getAddressMapUrl(order.deliveryAddress); as mapUrl) { <a [href]="mapUrl" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex text-xs font-bold text-blue-700 underline">{{ language.t('فتح الموقع على الخريطة', 'Open location in maps') }}</a> }</div>
              <div><h3 class="mb-2 font-extrabold text-slate-800">{{ language.t('الأصناف', 'Items') }}</h3><div class="divide-y divide-slate-100 rounded-2xl border border-slate-100 px-4">@for (item of order.items || []; track item.orderItemId) { <div class="flex items-start justify-between gap-3 py-3"><div><p class="font-bold text-slate-800">{{ language.isEnglish() ? (item.productNameEn || item.productNameAr) : item.productNameAr }}<span class="text-slate-500"> × {{ item.quantity }}</span></p>@if (item.variantNameAr || item.variantNameEn) { <p class="mt-1 text-xs text-slate-500">{{ language.isEnglish() ? (item.variantNameEn || item.variantNameAr) : item.variantNameAr }}</p> }</div><span class="shrink-0 text-sm font-bold text-slate-700">{{ item.totalPrice }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span></div> } @empty { <p class="py-4 text-sm text-slate-400">{{ language.t('لا توجد تفاصيل للأصناف.', 'No item details available.') }}</p> }</div></div>
              @if (order.notes) { <div class="rounded-2xl bg-amber-50 p-4"><p class="text-[11px] font-bold text-amber-800">{{ language.t('ملاحظات', 'Notes') }}</p><p class="mt-1 text-sm text-amber-900">{{ order.notes }}</p></div> }
              <div class="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm"><div class="flex justify-between"><span class="text-slate-500">{{ language.t('قيمة الأصناف', 'Subtotal') }}</span><b>{{ order.subTotal }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</b></div><div class="flex justify-between"><span class="text-slate-500">{{ language.t('التوصيل', 'Delivery') }}</span><b>{{ order.deliveryFee }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</b></div><div class="flex justify-between border-t border-slate-200 pt-2 text-base"><span class="font-extrabold text-slate-800">{{ language.t('الإجمالي', 'Total') }}</span><b class="text-orange-800">{{ order.totalAmount }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</b></div></div>
            </div>
          </section>
        </div>
      }
    </div>
  `
})
export class AdminAllOrdersComponent implements OnInit {
  language = inject(LanguageService);
  private api = inject(ApiService);

  orders = signal<AdminOrder[]>([]);
  searchQuery = signal('');
  dateFrom = signal('');
  dateTo = signal('');
  isLoading = signal(false);
  errorMessage = signal('');
  selectedOrder = signal<AdminOrder | null>(null);
  currentPage = signal(1);
  pageSize = signal(10);

  hasFilters = computed(() => !!this.searchQuery().trim() || !!this.dateFrom() || !!this.dateTo());
  filteredOrders = computed(() => {
    const query = this.normalizeSearch(this.searchQuery());
    const from = this.dateFrom();
    const to = this.dateTo();
    if (from && to && from > to) return [];
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTime = to ? new Date(`${to}T23:59:59.999`).getTime() : null;

    return this.orders().filter(order => {
      if (query) {
        const searchable = this.normalizeSearch(`${order.orderNumber} ${order.customerName} ${order.customerPhone} ${order.orderId}`);
        if (!searchable.includes(query)) return false;
      }
      if (fromTime !== null || toTime !== null) {
        const createdAt = new Date(order.createdAt).getTime();
        if (!Number.isFinite(createdAt)) return false;
        if (fromTime !== null && createdAt < fromTime) return false;
        if (toTime !== null && createdAt > toTime) return false;
      }
      return true;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredOrders().length / this.pageSize())));
  pagedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredOrders().slice(start, start + this.pageSize());
  });
  pageStart = computed(() => this.filteredOrders().length ? (this.currentPage() - 1) * this.pageSize() + 1 : 0);
  pageEnd = computed(() => Math.min(this.currentPage() * this.pageSize(), this.filteredOrders().length));
  paginationItems = computed((): (number | 'ellipsis')[] => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
    if (current <= 3) return [1, 2, 3, 4, 'ellipsis', total];
    if (current >= total - 2) return [1, 'ellipsis', total - 3, total - 2, total - 1, total];
    return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
  });

  ngOnInit() { this.loadOrders(); }

  updateSearch(value: string) { this.searchQuery.set(value); this.currentPage.set(1); }
  updateDateFrom(value: string) { this.dateFrom.set(value); this.currentPage.set(1); }
  updateDateTo(value: string) { this.dateTo.set(value); this.currentPage.set(1); }
  goToPage(page: number | 'ellipsis') {
    if (page === 'ellipsis') return;
    this.currentPage.set(Math.min(Math.max(page, 1), this.totalPages()));
  }
  changePageSize(value: number) { this.pageSize.set(Number(value) || 10); this.currentPage.set(1); }

  loadOrders() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.api.getAdminOrders().subscribe({
      next: data => { this.orders.set(data || []); this.currentPage.set(1); this.isLoading.set(false); },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(this.language.t('تعذر تحميل الطلبات. تحقق من الاتصال ثم أعد المحاولة.', 'Could not load orders. Check your connection and try again.'));
      }
    });
  }

  resetFilters() { this.searchQuery.set(''); this.dateFrom.set(''); this.dateTo.set(''); this.currentPage.set(1); }

  private normalizeSearch(value: string): string {
    return value.toLocaleLowerCase()
      .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
      .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/[^\p{L}\p{N}]/gu, '');
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return value || '';
    return date.toLocaleString(this.language.isEnglish() ? 'en-AE' : 'ar-AE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  statusLabel(status: string): string {
    const labels: Record<string, [string, string]> = {
      Pending: ['قيد المراجعة', 'Pending'], Preparing: ['قيد التجهيز', 'Preparing'],
      OutForDelivery: ['جاري التوصيل', 'Out for delivery'], Completed: ['تم التسليم', 'Completed']
    };
    const label = labels[status];
    return label ? this.language.t(label[0], label[1]) : status;
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      Pending: 'bg-amber-50 text-amber-800', Preparing: 'bg-blue-50 text-blue-800',
      OutForDelivery: 'bg-purple-50 text-purple-800', Completed: 'bg-green-50 text-green-800'
    };
    return classes[status] || 'bg-slate-100 text-slate-700';
  }

  getAddressMapUrl(address?: string): string | null {
    if (!address) return null;
    const match = address.match(/(?:الموقع:\s*)?(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
    if (!match) return null;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }
}
