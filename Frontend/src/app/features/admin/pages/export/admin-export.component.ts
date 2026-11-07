import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminOrder, Category, Product } from '../../../../core/models/models';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';

type ExportEntity = 'products' | 'categories' | 'orders';
type ExportFormat = 'xlsx' | 'docx' | 'pdf';
type ActiveFilter = 'all' | 'active' | 'inactive';
type Row = Record<string, string | number>;

@Component({
  selector: 'app-admin-export', standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-[#f7f8fa] font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'"><app-admin-sidebar />
      <main class="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:mr-64 lg:px-8">
        <header class="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div class="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold text-orange-800"><span class="h-2 w-2 rounded-full bg-orange-500"></span>{{ language.t('مركز الملفات', 'Data exports') }}</div><h1 class="text-2xl font-black text-slate-900 sm:text-3xl">{{ language.t('التصدير', 'Export') }}</h1><p class="mt-1 text-sm text-slate-500">{{ language.t('نزّل بيانات المنتجات والأقسام والطلبات بصيغة تناسبك.', 'Download product, category, and order data in the format you need.') }}</p></div><button type="button" (click)="loadData()" [disabled]="loading()" class="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-orange-200 disabled:opacity-50 sm:self-auto"><span [class.animate-spin]="loading()">↻</span>{{ language.t('تحديث البيانات', 'Refresh data') }}</button></header>
        <section class="mb-5 grid gap-3 sm:grid-cols-3">
          @if (canProducts()) { <button type="button" (click)="selectEntity('products')" [class.border-orange-300]="entity() === 'products'" [class.ring-2]="entity() === 'products'" [class.ring-orange-100]="entity() === 'products'" class="rounded-2xl border border-slate-100 bg-white p-4 text-start shadow-sm transition hover:border-orange-200"><span class="text-xs font-bold text-slate-500">{{ language.t('المنتجات', 'Products') }}</span><span class="mt-2 block text-2xl font-black text-slate-900">{{ products().length }}</span><span class="mt-1 block text-[11px] text-slate-400">{{ language.t('كتالوج المنتجات', 'Product catalog') }}</span></button> }
          @if (canCategories()) { <button type="button" (click)="selectEntity('categories')" [class.border-orange-300]="entity() === 'categories'" [class.ring-2]="entity() === 'categories'" [class.ring-orange-100]="entity() === 'categories'" class="rounded-2xl border border-slate-100 bg-white p-4 text-start shadow-sm transition hover:border-orange-200"><span class="text-xs font-bold text-slate-500">{{ language.t('الأقسام', 'Categories') }}</span><span class="mt-2 block text-2xl font-black text-slate-900">{{ categories().length }}</span><span class="mt-1 block text-[11px] text-slate-400">{{ language.t('أقسام المنيو', 'Menu categories') }}</span></button> }
          @if (canOrders()) { <button type="button" (click)="selectEntity('orders')" [class.border-orange-300]="entity() === 'orders'" [class.ring-2]="entity() === 'orders'" [class.ring-orange-100]="entity() === 'orders'" class="rounded-2xl border border-slate-100 bg-white p-4 text-start shadow-sm transition hover:border-orange-200"><span class="text-xs font-bold text-slate-500">{{ language.t('الطلبات', 'Orders') }}</span><span class="mt-2 block text-2xl font-black text-slate-900">{{ orders().length }}</span><span class="mt-1 block text-[11px] text-slate-400">{{ language.t('فلترة التاريخ والحالة', 'Filter by date and status') }}</span></button> }
        </section>
        @if (error()) { <div class="mb-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800">{{ error() }}</div> }
        @if (loading() && !loaded()) { <div class="mb-5 rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">{{ language.t('جارٍ تحميل البيانات…', 'Loading data…') }}</div> }
        @if (loaded()) { <section class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div class="border-b border-slate-100 p-5 sm:p-6"><div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 class="font-black text-slate-900">{{ entityLabel() }}</h2><p class="mt-1 text-xs text-slate-500">{{ language.t('حدّد البيانات المطلوبة ثم اختر صيغة الملف.', 'Choose the data you need, then select a file format.') }}</p></div><div class="rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800">{{ filteredRows().length }} {{ language.t('سجل جاهز للتصدير', 'records ready to export') }}</div></div>
            <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label class="text-xs font-bold text-slate-600">{{ entity() === 'orders' ? language.t('بحث سريع', 'Search') : language.t('بحث بالاسم', 'Search by name') }}<input type="search" [ngModel]="search()" (ngModelChange)="updateSearch($event)" [placeholder]="entity() === 'orders' ? language.t('رقم الطلب أو الاسم أو الهاتف', 'Order number, name, or phone') : language.t('اكتب الاسم…', 'Type a name…')" class="mt-1.5 min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-normal outline-none focus:border-orange-400 focus:bg-white" /></label>
              @if (entity() === 'products') { <label class="text-xs font-bold text-slate-600">{{ language.t('القسم', 'Category') }}<select [ngModel]="categoryFilter()" (ngModelChange)="updateCategoryFilter($event)" class="mt-1.5 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400"><option value="all">{{ language.t('كل الأقسام', 'All categories') }}</option>@for (c of categories(); track c.categoryId) { <option [value]="c.categoryId">{{ categoryName(c) }}</option> }</select></label> }
              @if (entity() !== 'orders') { <label class="text-xs font-bold text-slate-600">{{ language.t('حالة الظهور', 'Visibility') }}<select [ngModel]="activeFilter()" (ngModelChange)="updateActiveFilter($event)" class="mt-1.5 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400"><option value="all">{{ language.t('الكل', 'All') }}</option><option value="active">{{ language.t('المفعّل فقط', 'Active only') }}</option><option value="inactive">{{ language.t('غير المفعّل فقط', 'Inactive only') }}</option></select></label> }
              @if (entity() === 'orders') { <label class="text-xs font-bold text-slate-600">{{ language.t('الحالة', 'Status') }}<select [ngModel]="statusFilter()" (ngModelChange)="updateStatusFilter($event)" class="mt-1.5 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400"><option value="all">{{ language.t('كل الحالات', 'All statuses') }}</option><option value="Pending">{{ language.t('قيد المراجعة', 'Pending') }}</option><option value="Preparing">{{ language.t('قيد التجهيز', 'Preparing') }}</option><option value="OutForDelivery">{{ language.t('جاري التوصيل', 'Out for delivery') }}</option><option value="Completed">{{ language.t('تم التسليم', 'Completed') }}</option><option value="Cancelled">{{ language.t('ملغي', 'Cancelled') }}</option></select></label><label class="text-xs font-bold text-slate-600">{{ language.t('قناة الطلب', 'Channel') }}<select [ngModel]="channelFilter()" (ngModelChange)="updateChannelFilter($event)" class="mt-1.5 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400"><option value="all">{{ language.t('كل القنوات', 'All channels') }}</option><option value="Website">{{ language.t('الموقع', 'Website') }}</option><option value="WhatsApp">WhatsApp</option></select></label><div class="grid grid-cols-2 gap-2"><label class="text-xs font-bold text-slate-600">{{ language.t('من تاريخ', 'From') }}<input type="date" [ngModel]="dateFrom()" (ngModelChange)="updateDateFrom($event || '')" class="mt-1.5 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs outline-none focus:border-orange-400" /></label><label class="text-xs font-bold text-slate-600">{{ language.t('إلى تاريخ', 'To') }}<input type="date" [ngModel]="dateTo()" (ngModelChange)="updateDateTo($event || '')" [min]="dateFrom() || null" class="mt-1.5 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs outline-none focus:border-orange-400" /></label></div> }
            </div>
            @if (entity() === 'orders' && dateFrom() && dateTo() && dateFrom() > dateTo()) { <p class="mt-3 text-xs font-bold text-rose-600">{{ language.t('تاريخ البداية يجب أن يكون قبل تاريخ النهاية.', 'Start date must not be after end date.') }}</p> }
            @if (entity() === 'orders') { <div class="mt-4 grid gap-2 sm:grid-cols-3"><div class="rounded-xl bg-slate-50 p-3"><span class="text-[10px] font-bold text-slate-500">{{ language.t('عدد الطلبات المطابقة','Matching orders') }}</span><b class="mt-1 block text-lg text-slate-900">{{ filteredRows().length }}</b></div><div class="rounded-xl bg-orange-50 p-3"><span class="text-[10px] font-bold text-orange-700">{{ language.t('إجمالي قيمة الطلبات','Total order value') }}</span><b class="mt-1 block text-lg text-orange-900">{{ orderTotals().amount.toLocaleString(language.isEnglish() ? 'en-AE' : 'ar-AE', { maximumFractionDigits: 2 }) }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</b></div><div class="rounded-xl bg-emerald-50 p-3"><span class="text-[10px] font-bold text-emerald-700">{{ language.t('رسوم التوصيل','Delivery fees') }}</span><b class="mt-1 block text-lg text-emerald-900">{{ orderTotals().delivery.toLocaleString(language.isEnglish() ? 'en-AE' : 'ar-AE', { maximumFractionDigits: 2 }) }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</b></div></div> }
            <div class="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><p class="text-xs text-slate-500">{{ language.t('ملف التصدير يشمل كل النتائج المطابقة', 'The export file includes all matching results') }} <b class="font-extrabold text-slate-800">{{ filteredRows().length }}</b> {{ language.t('سجلًا.', 'records.') }} {{ language.t('المعاينة تعرض', 'Previewing') + ' ' + productPageStart() + '–' + productPageEnd() + ' ' + language.t('من', 'of') + ' ' + filteredRows().length }}</p><div class="flex flex-wrap gap-2"><button type="button" (click)="exportFile('xlsx')" [disabled]="busy() || !filteredRows().length" class="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50">▦ {{ busy() === 'xlsx' ? language.t('جارٍ التجهيز…', 'Preparing…') : 'Excel' }}</button><button type="button" (click)="exportFile('docx')" [disabled]="busy() || !filteredRows().length" class="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-xs font-extrabold text-white hover:bg-blue-800 disabled:opacity-50">W {{ busy() === 'docx' ? language.t('جارٍ التجهيز…', 'Preparing…') : 'Word' }}</button><button type="button" (click)="exportFile('pdf')" [disabled]="busy() || !filteredRows().length" class="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-extrabold text-white hover:bg-rose-700 disabled:opacity-50">▤ {{ busy() === 'pdf' ? language.t('جارٍ التجهيز…', 'Preparing…') : 'PDF' }}</button></div></div>
            @if (exportError()) { <p class="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{{ exportError() }}</p> }
          </div>
          @if (filteredRows().length > 0) {
            <div class="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <label class="flex items-center gap-2 text-xs font-bold text-slate-600">{{ language.t(entity() === 'products' ? 'عدد المنتجات في الصفحة' : entity() === 'categories' ? 'عدد الأقسام في الصفحة' : 'عدد الطلبات في الصفحة', entity() === 'products' ? 'Products per page' : entity() === 'categories' ? 'Categories per page' : 'Orders per page') }}
                <select [ngModel]="productPageSize()" (ngModelChange)="setProductPageSize($event)" class="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-orange-400">
                  <option value="all">{{ language.t('عرض الكل', 'Show all') }}</option><option value="10">10</option><option value="25">25</option><option value="50">50</option>
                </select>
              </label>
              <div class="flex items-center justify-between gap-3 sm:justify-end">
                <span class="text-[11px] text-slate-500">{{ productPageStart() }}–{{ productPageEnd() }} {{ language.t('من', 'of') }} {{ filteredRows().length }}</span>
                <nav class="flex items-center gap-1" [attr.aria-label]="language.t('صفحات المعاينة', 'Preview pages')">
                  <button type="button" (click)="goToProductPage(productPage() - 1)" [disabled]="productPage() <= 1" class="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 disabled:opacity-40">{{ language.isEnglish() ? 'Previous' : 'السابق' }}</button>
                  <span class="min-w-16 text-center text-xs font-bold text-slate-600">{{ productPage() }} / {{ productTotalPages() }}</span>
                  <button type="button" (click)="goToProductPage(productPage() + 1)" [disabled]="productPage() >= productTotalPages()" class="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 disabled:opacity-40">{{ language.isEnglish() ? 'Next' : 'التالي' }}</button>
                </nav>
              </div>
            </div>
          }
          <div class="overflow-x-auto"><table class="w-full min-w-[620px] text-right text-xs"><thead class="bg-slate-50 text-slate-500"><tr>@for (column of columns(); track column) { <th class="px-4 py-3 font-extrabold">{{ column }}</th> }</tr></thead><tbody class="divide-y divide-slate-100 text-slate-700">@for (row of previewRows(); track $index) { <tr class="hover:bg-orange-50/40">@for (column of columns(); track column) { <td class="max-w-[280px] px-4 py-3">{{ row[column] }}</td> }</tr> } @if (!filteredRows().length) { <tr><td [attr.colspan]="columns().length" class="px-4 py-10 text-center text-slate-400">{{ language.t('لا توجد سجلات تطابق الفلاتر.', 'No records match these filters.') }}</td></tr> }</tbody></table></div>
          <div class="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-[11px] leading-5 text-slate-500">{{ language.t('الملفات تُنشأ وتُنزّل مباشرة إلى جهازك ولا تُحفظ على الخادم. يتضمن تصدير الطلبات بيانات العملاء، فاحفظها بأمان.', 'Files are generated and downloaded directly to your device, not stored on the server. Order exports contain customer data, so store them securely.') }}</div>
        </section> }
      </main>
    </div>
  `
})
export class AdminExportComponent implements OnInit {
  language = inject(LanguageService);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  products = signal<Product[]>([]); categories = signal<Category[]>([]); orders = signal<AdminOrder[]>([]);
  loaded = signal(false); loading = signal(false); error = signal(''); exportError = signal(''); busy = signal<ExportFormat | ''>('');
  entity = signal<ExportEntity>('products'); search = signal(''); productPageSize = signal<number | 'all'>('all'); productPage = signal(1); activeFilter = signal<ActiveFilter>('all'); categoryFilter = signal('all');
  statusFilter = signal('all'); channelFilter = signal('all'); dateFrom = signal(''); dateTo = signal('');
  canProducts = computed(() => this.auth.hasPermission('products.view'));
  canCategories = computed(() => this.auth.hasPermission('categories.view'));
  canOrders = computed(() => this.auth.hasPermission('orders.view'));
  entityLabel = computed(() => ({ products: this.language.t('تصدير المنتجات', 'Export products'), categories: this.language.t('تصدير الأقسام', 'Export categories'), orders: this.language.t('تصدير الطلبات', 'Export orders') }[this.entity()]));
  columns = computed(() => this.columnsFor(this.entity()));
  filteredRows = computed((): Product[] | Category[] | AdminOrder[] => {
    const query = this.normalize(this.search());
    if (this.entity() === 'products') return this.products().filter(p => (!query || this.normalize(`${p.nameAr} ${p.nameEn} ${p.descriptionAr || ''} ${p.descriptionEn || ''}`).includes(query)) && (this.categoryFilter() === 'all' || String(p.categoryId) === this.categoryFilter()) && this.matchesActive(p.isAvailable));
    if (this.entity() === 'categories') return this.categories().filter(c => (!query || this.normalize(`${c.nameAr} ${c.nameEn} ${c.slug}`).includes(query)) && this.matchesActive(c.isActive ?? true));
    const from = this.dateFrom(), to = this.dateTo(); if (from && to && from > to) return [];
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null, toTime = to ? new Date(`${to}T23:59:59.999`).getTime() : null;
    return this.orders().filter(o => (!query || this.normalize(`${o.orderNumber} ${o.orderId} ${o.customerName} ${o.customerPhone} ${o.customerEmail || ''}`).includes(query)) && (this.statusFilter() === 'all' || o.orderStatus === this.statusFilter()) && (this.channelFilter() === 'all' || o.orderChannel === this.channelFilter()) && (fromTime === null || new Date(o.createdAt).getTime() >= fromTime) && (toTime === null || new Date(o.createdAt).getTime() <= toTime));
  });
  private exportRows = computed(() => this.rowsFor(this.entity(), this.filteredRows()));
  productTotalPages = computed(() => {
    const total = this.filteredRows().length;
    const pageSize = this.productPageSize();
    const size = pageSize === 'all' ? Math.max(total, 1) : pageSize;
    return Math.max(1, Math.ceil(total / size));
  });
  productPageStart = computed(() => {
    const total = this.filteredRows().length;
    const pageSize = this.productPageSize();
    if (!total) return 0;
    return pageSize === 'all' ? 1 : (this.productPage() - 1) * pageSize + 1;
  });
  productPageEnd = computed(() => {
    const total = this.filteredRows().length;
    const pageSize = this.productPageSize();
    return pageSize === 'all' ? total : Math.min(this.productPage() * pageSize, total);
  });
  previewRows = computed(() => {
    const rows = this.exportRows();
    const pageSize = this.productPageSize();
    if (pageSize === 'all') return rows;
    const start = (this.productPage() - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  });
  orderTotals = computed(() => { const rows = this.filteredRows() as AdminOrder[]; return { amount: rows.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0), delivery: rows.reduce((sum, order) => sum + (Number(order.deliveryFee) || 0), 0) }; });

  ngOnInit() { if (!this.canProducts() && !this.canCategories() && !this.canOrders()) { this.error.set(this.language.t('لا تملك صلاحية لتصدير البيانات.', 'You do not have permission to export data.')); return; } this.selectFirstAllowedEntity(); this.productPageSize.set(this.entity() === 'products' ? 'all' : 10); this.loadData(); }
  selectEntity(entity: ExportEntity) { if ((entity === 'products' && this.canProducts()) || (entity === 'categories' && this.canCategories()) || (entity === 'orders' && this.canOrders())) { this.entity.set(entity); this.search.set(''); this.productPage.set(1); this.productPageSize.set(entity === 'products' ? 'all' : 10); } }
  updateSearch(value: string) { this.search.set(value); this.productPage.set(1); }
  updateCategoryFilter(value: string) { this.categoryFilter.set(value); this.productPage.set(1); }
  updateActiveFilter(value: ActiveFilter) { this.activeFilter.set(value); this.productPage.set(1); }
  updateStatusFilter(value: string) { this.statusFilter.set(value); this.productPage.set(1); }
  updateChannelFilter(value: string) { this.channelFilter.set(value); this.productPage.set(1); }
  updateDateFrom(value: string) { this.dateFrom.set(value); this.productPage.set(1); }
  updateDateTo(value: string) { this.dateTo.set(value); this.productPage.set(1); }
  setProductPageSize(value: string | number) { this.productPageSize.set(value === 'all' ? 'all' : Number(value)); this.productPage.set(1); }
  goToProductPage(page: number) { this.productPage.set(Math.max(1, Math.min(page, this.productTotalPages()))); }
  private selectFirstAllowedEntity() { if (this.canProducts()) this.entity.set('products'); else if (this.canCategories()) this.entity.set('categories'); else if (this.canOrders()) this.entity.set('orders'); }
  loadData() {
    this.loading.set(true); this.error.set('');
    const failed = { products: false, categories: false, orders: false };
    forkJoin({
      products: this.canProducts() ? this.api.getAllAdminProducts().pipe(catchError(() => { failed.products = true; return of([] as Product[]); })) : of([] as Product[]),
      categories: this.canCategories() ? this.api.getAdminCategories().pipe(catchError(() => { failed.categories = true; return of([] as Category[]); })) : of([] as Category[]),
      orders: this.canOrders() ? this.api.getAdminOrders().pipe(catchError(() => { failed.orders = true; return of([] as AdminOrder[]); })) : of([] as AdminOrder[])
    }).subscribe({
      next: data => {
        this.products.set(data.products || []); this.categories.set(data.categories || []); this.orders.set(data.orders || []); this.productPage.set(1); this.loaded.set(true); this.loading.set(false);
        const unavailable = [failed.products && this.language.t('المنتجات','products'), failed.categories && this.language.t('الأقسام','categories'), failed.orders && this.language.t('الطلبات','orders')].filter(Boolean);
        if (unavailable.length) this.error.set(this.language.t(`تعذر تحميل: ${unavailable.join('، ')}. تحقق من الاتصال والصلاحيات.`, `Could not load: ${unavailable.join(', ')}. Check your connection and permissions.`));
      },
      error: () => { this.loading.set(false); this.error.set(this.language.t('تعذر تحميل بيانات التصدير. تحقق من الاتصال والصلاحيات.', 'Could not load export data. Check your connection and permissions.')); }
    });
  }
  private matchesActive(active: boolean) { return this.activeFilter() === 'all' || (this.activeFilter() === 'active' ? active : !active); }
  categoryName(c: Category) { return this.language.isEnglish() ? (c.nameEn || c.nameAr) : c.nameAr; }
  private normalize(value: string) { return value.toLocaleLowerCase().replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[^\p{L}\p{N}]/gu, ''); }
  private columnsFor(entity: ExportEntity): string[] {
    const t = (a: string, e: string) => this.language.t(a, e);
    if (entity === 'products') return [t('رقم المنتج','Product ID'),t('اسم المنتج','Product name'),t('الوصف','Description'),t('القسم','Category'),t('السعر الأساسي','Base price'),t('سعر العرض','Sale price'),t('التوفر','Availability'),t('مميز','Featured'),t('أفضل مبيعاً','Best seller'),t('المبيعات المكتملة','Completed sales'),t('التقييم','Rating'),t('عدد التقييمات','Reviews'),t('الصورة','Image URL'),t('الخيارات','Variants'),t('الإضافات','Add-ons')];
    if (entity === 'categories') return [t('رقم القسم','Category ID'),t('اسم القسم','Category name'),t('الرابط المختصر','Slug'),t('ترتيب العرض','Display order'),t('عدد المنتجات','Products'),t('الحالة','Status'),t('الأيقونة','Icon URL'),t('صورة القسم','Category image URL')];
    return [t('رقم الطلب','Order number'),t('تاريخ الطلب','Created at'),t('العميل','Customer'),t('الهاتف','Phone'),t('البريد الإلكتروني','Email'),t('الحالة','Status'),t('القناة','Channel'),t('الفرع','Branch ID'),t('عنوان التوصيل','Delivery address'),t('الأصناف','Items'),t('المجموع','Subtotal'),t('رسوم التوصيل','Delivery fee'),t('الإجمالي','Total'),t('طريقة الدفع','Payment'),t('ملاحظات','Notes')];
  }
  private rowsFor(entity: ExportEntity, values: Product[] | Category[] | AdminOrder[]): Row[] {
    const t = (a: string, e: string) => this.language.t(a, e), productCats = new Map(this.categories().map(c => [c.categoryId, this.categoryName(c)])), counts = new Map<number, number>();
    this.products().forEach(p => counts.set(p.categoryId, (counts.get(p.categoryId) || 0) + 1));
    if (entity === 'products') return (values as Product[]).map(p => ({ [t('رقم المنتج','Product ID')]:p.productId,[t('اسم المنتج','Product name')]:this.language.isEnglish()?(p.nameEn||p.nameAr):p.nameAr,[t('القسم','Category')]:productCats.get(p.categoryId)||'', [t('السعر','Price')]:p.basePrice,[t('سعر العرض','Sale price')]:p.discountPrice??'', [t('التوفر','Availability')]:p.isAvailable?t('متاح','Available'):t('غير متاح','Unavailable'),[t('مميز','Featured')]:p.isFeatured?t('نعم','Yes'):t('لا','No'),[t('أفضل مبيعاً','Best seller')]:p.isManuallyBestSelling?t('نعم','Yes'):t('لا','No'),[t('التقييم','Rating')]:p.averageRating??'', [t('عدد التقييمات','Reviews')]:p.reviewCount??0,[t('الوصف','Description')]:this.language.isEnglish()?(p.descriptionEn||p.descriptionAr||''):(p.descriptionAr||p.descriptionEn||''),[t('الصورة','Image URL')]:p.imageUrl||'', [t('المبيعات المكتملة','Completed sales')]:p.completedSalesQuantity??0,[t('الخيارات','Variants')]:(p.variants||[]).map(v=>`${this.language.isEnglish()?(v.nameEn||v.nameAr):v.nameAr}: ${v.price}${v.isDefault?' ★':''}`).join(' | '),[t('الإضافات','Add-ons')]:(p.addons||[]).map(a=>`${this.language.isEnglish()?(a.nameEn||a.nameAr):a.nameAr}: ${a.price}`).join(' | ') }));
    if (entity === 'categories') return (values as Category[]).map(c => ({ [t('رقم القسم','Category ID')]:c.categoryId,[t('اسم القسم','Category name')]:this.language.isEnglish()?(c.nameEn||c.nameAr):c.nameAr,[t('الرابط المختصر','Slug')]:c.slug,[t('ترتيب العرض','Display order')]:c.displayOrder,[t('عدد المنتجات','Products')]:counts.get(c.categoryId)||0,[t('الحالة','Status')]:(c.isActive??true)?t('مفعّل','Active'):t('غير مفعّل','Inactive'),[t('الأيقونة','Icon URL')]:c.iconUrl||'', [t('صورة القسم','Category image URL')]:c.imageUrl||'' }));
    const labels: Record<string,string> = { Pending:t('قيد المراجعة','Pending'),Preparing:t('قيد التجهيز','Preparing'),OutForDelivery:t('جاري التوصيل','Out for delivery'),Completed:t('تم التسليم','Completed'),Cancelled:t('ملغي','Cancelled') };
    return (values as AdminOrder[]).map(o => ({
      [t('رقم الطلب','Order number')]:o.orderNumber,
      [t('تاريخ الطلب','Created at')]:this.formatDate(o.createdAt),
      [t('العميل','Customer')]:o.customerName,
      [t('الهاتف','Phone')]:o.customerPhone,
      [t('البريد الإلكتروني','Email')]:o.customerEmail||'',
      [t('الحالة','Status')]:labels[o.orderStatus]||o.orderStatus,
      [t('القناة','Channel')]:o.orderChannel==='WhatsApp'?'WhatsApp':t('الموقع','Website'),
      [t('الفرع','Branch ID')]:o.branchId,
      [t('عنوان التوصيل','Delivery address')]:o.deliveryAddress||'',
      [t('الأصناف','Items')]:(o.items||[]).map(i=>{
        const variant = this.language.isEnglish() ? (i.variantNameEn||i.variantNameAr) : (i.variantNameAr||i.variantNameEn);
        const name = this.language.isEnglish() ? (i.productNameEn||i.productNameAr) : i.productNameAr;
        const addons = (i.addons||[]).map(a=>this.language.isEnglish()?(a.nameEn||a.nameAr):a.nameAr).join(', ');
        return `${name}${variant ? ` (${variant})` : ''} × ${i.quantity} = ${i.totalPrice}${addons ? ` [${addons}]` : ''}`;
      }).join('\n'),
      [t('المجموع','Subtotal')]:o.subTotal,
      [t('رسوم التوصيل','Delivery fee')]:o.deliveryFee,
      [t('الإجمالي','Total')]:o.totalAmount,
      [t('طريقة الدفع','Payment')]:o.paymentMethod==='CashOnDelivery'?t('الدفع عند الاستلام','Cash on delivery'):o.paymentMethod,
      [t('ملاحظات','Notes')]:o.notes||''
    }));
  }
  async exportFile(format: ExportFormat) {
    if (this.busy() || !this.exportRows().length) return; this.busy.set(format); this.exportError.set('');
    try { const columns=this.columns(), rows=this.exportRows(), filename=`${this.entity()}-${this.localDate()}`; if(format==='xlsx') await this.exportExcel(columns,rows,filename); else if(format==='docx') await this.exportWord(columns,rows,filename); else await this.exportPdf(columns,rows,filename); }
    catch (error) { console.error('Export failed',error); this.exportError.set(this.language.t('تعذر إنشاء الملف. حاول مرة أخرى.', 'Could not create the file. Please try again.')); }
    finally { this.busy.set(''); }
  }
  private async exportExcel(columns: string[], rows: Row[], filename: string) {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Souq Sofra';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet(this.entityLabel().slice(0, 31), { views: [{ rightToLeft: !this.language.isEnglish(), state: 'frozen', ySplit: 1 }] });
    sheet.columns = columns.map(column => ({ header: column, key: column, width: Math.min(42, Math.max(16, column.length + 5)), style: { alignment: { vertical: 'top', wrapText: true } } }));
    rows.forEach(row => sheet.addRow(row));
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
    sheet.getRow(1).height = 28;
    sheet.getRow(1).eachCell(cell => { cell.font = { bold: true, color: { argb: 'FF7C2D12' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E8' } }; cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; });
    if (this.entity() === 'orders') {
      const t=(a:string,e:string)=>this.language.t(a,e), totals=this.orderTotals();
      const summary = workbook.addWorksheet(t('الملخص','Summary').slice(0,31), { views: [{ rightToLeft: !this.language.isEnglish() }] });
      summary.addRows([[t('ملخص التصدير','Export summary')],[t('عدد الطلبات','Orders'),rows.length],[t('إجمالي قيمة الطلبات','Total order value'),totals.amount],[t('إجمالي رسوم التوصيل','Delivery fees'),totals.delivery],[t('تاريخ التصدير','Exported at'),this.formatDate(new Date().toISOString())],[t('من تاريخ','From date'),this.dateFrom() || t('كل الفترات','All dates')],[t('إلى تاريخ','To date'),this.dateTo() || t('كل الفترات','All dates')]]);
      summary.columns = [{width:30},{width:34}]; summary.getRow(1).font = {bold:true,size:14,color:{argb:'FF7C2D12'}};
    }
    const buffer = await workbook.xlsx.writeBuffer();
    this.downloadBlob(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${filename}.xlsx`);
  }
  private async exportWord(columns: string[], rows: Row[], filename: string) {
    const {Document,Packer,Paragraph,Table,TableCell,TableRow,TextRun,WidthType,AlignmentType,ShadingType}=await import('docx');
    const header=new TableRow({children:columns.map(c=>new TableCell({shading:{type:ShadingType.SOLID,color:'FFF3E8'},children:[new Paragraph({alignment:AlignmentType.RIGHT,bidirectional:true,children:[new TextRun({text:c,bold:true,rightToLeft:!this.language.isEnglish()})]})]}))});
    const body=rows.map(r=>new TableRow({children:columns.map(c=>new TableCell({children:[new Paragraph({alignment:AlignmentType.RIGHT,bidirectional:true,children:[new TextRun({text:String(r[c]??''),rightToLeft:!this.language.isEnglish()})]})]}))}));
    const doc=new Document({sections:[{properties:{page:{margin:{top:900,right:800,bottom:900,left:800}}},children:[new Paragraph({alignment:this.language.isEnglish()?AlignmentType.LEFT:AlignmentType.RIGHT,heading:'Heading1',children:[new TextRun({text:this.entityLabel(),bold:true,size:32,rightToLeft:!this.language.isEnglish()})]}),new Paragraph({alignment:this.language.isEnglish()?AlignmentType.LEFT:AlignmentType.RIGHT,children:[new TextRun({text:`${this.language.t('تاريخ التصدير','Exported')}: ${this.formatDate(new Date().toISOString())} · ${rows.length} ${this.language.t('سجل','records')}`,rightToLeft:!this.language.isEnglish()})]}),new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[header,...body]})]}]});
    this.downloadBlob(await Packer.toBlob(doc),`${filename}.docx`);
  }
  private async exportPdf(columns: string[], rows: Row[], filename: string) {
    const host=document.createElement('div'); Object.assign(host.style,{position:'fixed',left:'-10000px',top:'0',width:'1100px',padding:'28px',background:'#fff',color:'#172033',fontFamily:'Arial,sans-serif',direction:this.language.isEnglish()?'ltr':'rtl'});
    const title=document.createElement('h1'); title.textContent=this.entityLabel(); title.style.cssText='font-size:24px;margin:0 0 8px;font-weight:700'; host.appendChild(title);
    const subtitle=document.createElement('p'); subtitle.textContent=`${this.language.t('تاريخ التصدير','Exported')}: ${this.formatDate(new Date().toISOString())} · ${rows.length} ${this.language.t('سجل','records')}`; subtitle.style.cssText='font-size:12px;color:#64748b;margin:0 0 18px'; host.appendChild(subtitle);
    const table=document.createElement('table'); table.style.cssText='width:100%;border-collapse:collapse;font-size:10px;table-layout:fixed'; const head=document.createElement('thead'), trh=document.createElement('tr');
    for(const c of columns){const th=document.createElement('th');th.textContent=c;th.style.cssText='background:#fff3e8;border:1px solid #e2e8f0;padding:7px;text-align:right;word-break:break-word';trh.appendChild(th)} head.appendChild(trh);table.appendChild(head);const body=document.createElement('tbody');
    for(const row of rows){const tr=document.createElement('tr');for(const c of columns){const td=document.createElement('td');td.textContent=String(row[c]??'');td.style.cssText='border:1px solid #e2e8f0;padding:6px;text-align:right;vertical-align:top;word-break:break-word';tr.appendChild(td)}body.appendChild(tr)}table.appendChild(body);host.appendChild(table);document.body.appendChild(host);
    try {const module=await import('html2pdf.js');await module.default().set({filename:`${filename}.pdf`,margin:[8,7,8,7],image:{type:'jpeg',quality:.96},html2canvas:{scale:2,useCORS:true,backgroundColor:'#fff'},jsPDF:{unit:'mm',format:'a4',orientation:columns.length>7?'landscape':'portrait'}}).from(host).save()} finally {host.remove()}
  }
  private downloadBlob(blob: Blob, name: string) { const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  private formatDate(value:string) {const d=new Date(value);return Number.isFinite(d.getTime())?d.toLocaleString(this.language.isEnglish()?'en-AE':'ar-AE',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):value||''}
  private localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
}
