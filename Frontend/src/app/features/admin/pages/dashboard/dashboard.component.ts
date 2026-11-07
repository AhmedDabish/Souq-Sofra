import { LanguageService } from '../../../../core/services/language.service';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { AdminOrder, Product, Branch } from '../../../../core/models/models';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="admin-shell min-h-screen bg-gray-50 flex font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">

      <!-- Shared Sidebar -->
      <app-admin-sidebar />

      <!-- Main Content -->
      <main class="admin-dashboard-main min-w-0 flex-1 p-5 pt-20 md:p-8 lg:mr-64">
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-black font-baloo text-gray-800">{{ language.t('لوحة المؤشرات والتحليلات', 'Dashboard & analytics') }}</h1>
            <p class="text-xs text-gray-400">{{ language.t('متابعة فورية لنشاط مطعم ومخبز سوق وسفرة', 'Live activity for Souq & Sofra restaurant and bakery') }}</p>
          </div>
          <div class="admin-dashboard-header-actions flex items-center gap-3">
            <button
              (click)="loadData()"
              [disabled]="isLoading()"
              class="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 shadow-xs transition-colors">
              <span [class.animate-spin]="isLoading()">🔄</span>
              <span>{{ language.t('تحديث البيانات', 'Refresh data') }}</span>
            </button>
            <span class="dashboard-connection-status text-xs font-bold bg-green-100 text-green-700 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>{{ language.t('متصل مباشر بالخادم', 'Connected to server') }}</span>
            </span>
          </div>
        </header>

        @if (errorMessage()) {
          <div class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ errorMessage() }}</span>
            </div>
            <button (click)="loadData()" class="underline font-bold hover:text-amber-900">{{ language.t('إعادة المحاولة', 'Try again') }}</button>
          </div>
        }

        <!-- Metrics Cards -->
        <div class="admin-dashboard-metrics grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-400 font-bold">{{ language.t('إجمالي المبيعات', 'Total sales') }}</span>
              <span class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">💰</span>
            </div>
            <div class="text-2xl font-black text-gray-800">
              {{ totalRevenue().toLocaleString(this.language.isEnglish() ? 'en-AE' : 'ar-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              <span class="text-xs text-primary font-bold">{{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
            </div>
            <span class="text-[11px] text-gray-400 mt-1 block">{{ language.t('من كافة الطلبات المسجلة', 'Across all recorded orders') }}</span>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-400 font-bold">{{ language.t('إجمالي الطلبات', 'Total orders') }}</span>
              <span class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">📦</span>
            </div>
            <div class="text-2xl font-black text-gray-800">
              {{ orders().length }}
              <span class="text-xs text-gray-400 font-medium">{{ language.t('طلب', 'orders') }}</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {{ pendingOrdersCount() }} {{ language.t('قيد المراجعة', 'pending') }}
              </span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-400 font-bold">{{ language.t('أصناف المنيو', 'Menu items') }}</span>
              <span class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">🍔</span>
            </div>
            <div class="text-2xl font-black text-gray-800">
              {{ products().length }}
              <span class="text-xs text-gray-400 font-medium">{{ language.t('صنف', 'items') }}</span>
            </div>
            <span class="text-[11px] text-emerald-600 font-medium mt-1 block">
              {{ activeProductsCount() }} {{ language.t('صنف متاح للطلب الآن', 'items currently available') }}
            </span>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-400 font-bold">{{ language.t('الفروع النشطة', 'Active branches') }}</span>
              <span class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">📍</span>
            </div>
            <div class="text-2xl font-black text-gray-800">
              {{ branches().length || 1 }}
              <span class="text-xs text-gray-400 font-medium">{{ language.t('فرع', 'branches') }}</span>
            </div>
            <span class="text-[11px] text-gray-400 mt-1 block truncate">
              {{ branches().length ? (language.isEnglish() ? (branches()[0].nameEn || branches()[0].nameAr) : branches()[0].nameAr) : language.t('أبوظبي - الكورنيش', 'Abu Dhabi - Corniche') }}
            </span>
          </div>

        </div>

        <!-- Orders Breakdown & Quick Actions -->
        <div class="admin-dashboard-orders grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs lg:col-span-1 space-y-4">
            <h3 class="font-bold text-gray-800 text-sm font-baloo">{{ language.t('توزيع حالات الطلبات', 'Order status overview') }}</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between text-xs p-3 rounded-2xl bg-gray-50">
                <span class="font-bold text-gray-700 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> {{ language.t('جديد (قيد المراجعة)', 'New (pending review)') }}
                </span>
                <span class="font-black text-gray-800">{{ getCountByStatus('Pending') }}</span>
              </div>
              <div class="flex items-center justify-between text-xs p-3 rounded-2xl bg-gray-50">
                <span class="font-bold text-gray-700 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-400"></span> {{ language.t('قيد التجهيز بالمطبخ', 'Preparing in kitchen') }}
                </span>
                <span class="font-black text-gray-800">{{ getCountByStatus('Preparing') }}</span>
              </div>
              <div class="flex items-center justify-between text-xs p-3 rounded-2xl bg-gray-50">
                <span class="font-bold text-gray-700 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span> {{ language.t('جاري التوصيل', 'Out for delivery') }}
                </span>
                <span class="font-black text-gray-800">{{ getCountByStatus('OutForDelivery') }}</span>
              </div>
              <div class="flex items-center justify-between text-xs p-3 rounded-2xl bg-gray-50">
                <span class="font-bold text-gray-700 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> {{ language.t('تم التسليم بنجاح', 'Delivered successfully') }}
                </span>
                <span class="font-black text-gray-800">{{ getCountByStatus('Completed') }}</span>
              </div>
            </div>

            <div class="pt-2">
              <a routerLink="/admin/orders" class="w-full py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                <span>📦</span>
                <span>{{ language.t('الانتقال لإدارة كافة الطلبات', 'Go to all orders') }}</span>
              </a>
            </div>
          </div>

          <!-- Recent Orders Table -->
          <div class="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden lg:col-span-2">
            <div class="recent-orders-header p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-gray-800 text-base font-baloo">{{ language.t('أحدث طلبات الزبائن', 'Latest customer orders') }}</h3>
                <p class="text-[11px] text-gray-400">{{ language.t('آخر 5 طلبات مسجلة على النظام', 'Last 5 orders recorded') }}</p>
              </div>
              <a routerLink="/admin/orders" class="text-xs text-primary font-bold hover:underline">{{ language.t('عرض الكل ←', 'View all →') }}</a>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-right text-xs">
                <thead class="bg-gray-50 text-gray-500">
                  <tr>
                    <th class="p-4">{{ language.t('رقم الطلب', 'Order number') }}</th>
                    <th class="p-4">{{ language.t('العميل', 'Customer') }}</th>
                    <th class="p-4">{{ language.t('قناة الطلب', 'Order channel') }}</th>
                    <th class="p-4">{{ language.t('العنوان', 'Address') }}</th>
                    <th class="p-4">{{ language.t('القيمة', 'Amount') }}</th>
                    <th class="p-4">{{ language.t('الحالة', 'Status') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (order of recentOrders(); track order.orderId) {
                    <tr (click)="viewOrderDetails(order)" (keydown.enter)="viewOrderDetails(order)" tabindex="0" role="button" [attr.aria-label]="language.t('عرض تفاصيل الطلب', 'View order details') + ' ' + order.orderNumber" class="cursor-pointer hover:bg-orange-50/60 focus:bg-orange-50/60 transition-colors">
                      <td class="p-4 font-bold text-gray-900"><button type="button" (click)="$event.stopPropagation(); viewOrderDetails(order)" class="rounded-lg px-2 py-1 text-primary hover:bg-primary/10">{{ order.orderNumber }}</button></td>
                      <td class="p-4">
                        <div class="font-bold text-gray-800">{{ order.customerName }}</div>
                        <div class="text-[10px] text-gray-400 dir-ltr text-right">{{ order.customerPhone }}</div>
                      </td>
                      <td class="p-4"><span [class]="order.orderChannel === 'WhatsApp' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'" class="rounded-full px-2.5 py-1 text-xs font-bold">{{ language.t(order.orderChannel === 'WhatsApp' ? 'واتساب' : 'الموقع', order.orderChannel === 'WhatsApp' ? 'WhatsApp' : 'Website') }}</span></td>
                      <td class="p-4 text-gray-500 max-w-xs" (click)="$event.stopPropagation()">
                        <span class="block truncate" [title]="order.deliveryAddress">{{ order.deliveryAddress }}</span>
                        @if (getAddressMapUrl(order.deliveryAddress); as mapUrl) {
                          <a [href]="mapUrl" target="_blank" rel="noopener noreferrer" class="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline" (click)="$event.stopPropagation()">
                            📍 {{ language.t('فتح الموقع', 'Open map') }}
                          </a>
                        }
                      </td>
                      <td class="p-4 font-black text-primary">{{ order.totalAmount }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</td>
                      <td class="p-4">
                        <span [class]="getStatusClass(order.orderStatus)" class="text-[10px] px-2.5 py-1 rounded-full font-bold">
                          {{ getStatusLabel(order.orderStatus) }}
                        </span>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="p-8 text-center text-gray-400 text-sm">
                        {{ language.t('لا توجد طلبات مسجلة حالياً', 'No orders recorded yet') }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>

      @if (selectedOrder(); as order) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6" (click)="selectedOrder.set(null)" (keydown.escape)="selectedOrder.set(null)">
          <section role="dialog" aria-modal="true" [attr.aria-label]="language.t('تفاصيل الطلب', 'Order details')" class="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl" (click)="$event.stopPropagation()">
            <header class="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 px-5 py-5 sm:px-7">
              <div class="pointer-events-none absolute -end-10 -top-16 h-40 w-40 rounded-full bg-orange-200/40 blur-3xl"></div>
              <div class="relative flex items-start justify-between gap-4">
                <div>
                  <span class="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-primary shadow-sm">{{ language.t('تفاصيل الطلب', 'Order details') }}</span>
                  <h2 class="mt-2 font-baloo text-2xl font-black text-primaryDark">#{{ order.orderNumber }}</h2>
                  <p class="mt-1 text-xs text-gray-500">{{ formatDate(order.createdAt) }}</p>
                </div>
                <button type="button" (click)="selectedOrder.set(null)" [attr.aria-label]="language.t('إغلاق', 'Close')" class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-orange-100 hover:text-primary">✕</button>
              </div>
            </header>
            <div class="max-h-[70vh] space-y-5 overflow-y-auto p-5 sm:p-7">
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p class="text-[11px] font-bold text-gray-400">{{ language.t('العميل', 'Customer') }}</p>
                  <p class="mt-1 font-extrabold text-gray-800">{{ order.customerName }}</p>
                  <a [href]="'tel:' + order.customerPhone" dir="ltr" class="mt-1 inline-block text-sm font-semibold text-primary">{{ order.customerPhone }}</a>
                </div>
                <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p class="text-[11px] font-bold text-gray-400">{{ language.t('حالة الطلب', 'Order status') }}</p>
                  <span [class]="getStatusClass(order.orderStatus)" class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-extrabold">{{ getStatusLabel(order.orderStatus) }}</span>
                  <p class="mt-2 text-[11px] text-gray-500">{{ language.t(order.orderChannel === 'WhatsApp' ? 'طلب واتساب' : 'طلب من الموقع', order.orderChannel === 'WhatsApp' ? 'WhatsApp order' : 'Website order') }}</p>
                </div>
              </div>
              <div class="rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
                <p class="text-[11px] font-bold text-gray-400">{{ language.t('عنوان التوصيل', 'Delivery address') }}</p>
                <p class="mt-1 text-sm font-bold leading-6 text-gray-800">{{ order.deliveryAddress }}</p>
                @if (getAddressMapUrl(order.deliveryAddress); as mapUrl) {
                  <a [href]="mapUrl" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-primaryDark">📍 {{ language.t('فتح الموقع على الخريطة', 'Open location in map') }}</a>
                }
              </div>
              @if (order.notes) { <div class="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><p class="text-[11px] font-bold text-blue-500">{{ language.t('ملاحظات', 'Notes') }}</p><p class="mt-1 text-sm leading-6 text-gray-700">{{ order.notes }}</p></div> }
              <div>
                <div class="mb-2 flex items-center justify-between"><h3 class="font-extrabold text-gray-800">{{ language.t('الأصناف المطلوبة', 'Items ordered') }}</h3><span class="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-500">{{ order.items.length || 0 }} {{ language.t('صنف', 'items') }}</span></div>
                <div class="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
                  @for (item of order.items || []; track item.orderItemId) {
                    <div class="flex items-center justify-between gap-4 p-3.5">
                      <div class="min-w-0"><p class="font-bold text-gray-800">{{ language.isEnglish() ? (item.productNameEn || item.productNameAr) : item.productNameAr }}</p>
                        @if (item.variantNameAr) { <p class="mt-0.5 text-[11px] text-primary">{{ language.isEnglish() ? (item.variantNameEn || item.variantNameAr) : item.variantNameAr }}</p> }
                        @if (item.addons?.length) { <p class="mt-0.5 text-[11px] text-gray-500">{{ language.t('إضافات: ', 'Extras: ') }}{{ formatAddonNames(item.addons) }}</p> }
                      </div>
                      <div class="shrink-0 text-left"><p class="text-xs text-gray-500">{{ item.quantity }} × {{ item.unitPrice }}</p><p class="font-black text-primary">{{ item.totalPrice }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</p></div>
                    </div>
                  }
                </div>
              </div>
              <div class="space-y-2 rounded-2xl bg-gray-50 p-4 text-sm">
                <div class="flex justify-between text-gray-500"><span>{{ language.t('المجموع الفرعي', 'Subtotal') }}</span><span class="font-bold text-gray-800">{{ order.subTotal }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span></div>
                <div class="flex justify-between text-gray-500"><span>{{ language.t('رسوم التوصيل', 'Delivery fee') }}</span><span class="font-bold text-gray-800">{{ order.deliveryFee }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span></div>
                <div class="flex justify-between border-t border-dashed border-gray-200 pt-3 text-base font-black text-primaryDark"><span>{{ language.t('الإجمالي', 'Total') }}</span><span class="text-primary">{{ order.totalAmount }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span></div>
              </div>
            </div>
            <footer class="border-t border-gray-100 bg-white px-5 py-4 text-end sm:px-7"><button type="button" (click)="selectedOrder.set(null)" class="rounded-xl bg-gray-100 px-5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-200">{{ language.t('إغلاق', 'Close') }}</button></footer>
          </section>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  language = inject(LanguageService);
  auth = inject(AuthService);
  private api = inject(ApiService);

  orders = signal<AdminOrder[]>([]);
  products = signal<Product[]>([]);
  branches = signal<Branch[]>([]);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  totalRevenue = signal<number>(0);
  pendingOrdersCount = signal<number>(0);
  activeProductsCount = signal<number>(0);
  recentOrders = signal<AdminOrder[]>([]);
  selectedOrder = signal<AdminOrder | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      orders: this.auth.hasPermission('orders.view') ? this.api.getAdminOrders() : of([]),
      products: this.auth.hasPermission('products.view') ? this.api.getAllAdminProducts() : of([]),
      branches: this.auth.hasPermission('branches.view') ? this.api.getAdminBranches() : of([])
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.orders.set(res.orders || []);
        this.products.set(res.products || []);
        this.branches.set(res.branches || []);

        this.calculateMetrics(res.orders || [], res.products || []);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.language.t('تعذر جلب البيانات من الخادم، يرجى التأكد من تشغيل الـ API وتسجيل الدخول.', 'Could not load dashboard data. Check the server connection and sign in again.'));
      }
    });
  }

  private calculateMetrics(orders: AdminOrder[], products: Product[]) {
    const rev = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    this.totalRevenue.set(rev);

    const pending = orders.filter(o => o.orderStatus === 'Pending').length;
    this.pendingOrdersCount.set(pending);

    const activeProds = products.filter(p => p.isAvailable).length;
    this.activeProductsCount.set(activeProds);

    this.recentOrders.set(orders.slice(0, 5));
  }

  viewOrderDetails(order: AdminOrder) {
    this.selectedOrder.set(order);
  }

  formatDate(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString(this.language.isEnglish() ? 'en-AE' : 'ar-AE', { dateStyle: 'medium', timeStyle: 'short' });
  }

  getAddressMapUrl(address?: string): string | null {
    if (!address) return null;
    const match = address.match(/(?:الموقع:\s*)?(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
    if (!match) return null;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  formatAddonNames(addons?: Array<{ nameAr: string; nameEn?: string }>): string {
    return (addons || []).map(addon => this.language.isEnglish() ? (addon.nameEn || addon.nameAr) : addon.nameAr).join(this.language.isEnglish() ? ', ' : '، ');
  }

  getCountByStatus(status: string): number {
    return this.orders().filter(o => o.orderStatus === status).length;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Pending': return this.language.t('قيد المراجعة', 'Pending review');
      case 'Preparing': return this.language.t('قيد التجهيز', 'Preparing');
      case 'OutForDelivery': return this.language.t('جاري التوصيل', 'Out for delivery');
      case 'Completed': return this.language.t('تم التسليم', 'Delivered');
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Preparing': return 'bg-blue-100 text-blue-800';
      case 'OutForDelivery': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
