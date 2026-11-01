import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { AdminOrder, Product, Branch } from '../../../../core/models/models';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex font-cairo" dir="rtl">
      
      <!-- Shared Sidebar -->
      <app-admin-sidebar />

      <!-- Main Content -->
      <main class="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-black font-baloo text-gray-800">لوحة المؤشرات والتحليلات</h1>
            <p class="text-xs text-gray-400">متابعة فورية لنشاط مطعم ومخبز سوق وسفرة</p>
          </div>
          <div class="flex items-center gap-3">
            <button 
              (click)="loadData()" 
              [disabled]="isLoading()"
              class="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 shadow-xs transition-colors">
              <span [class.animate-spin]="isLoading()">🔄</span>
              <span>تحديث البيانات</span>
            </button>
            <span class="text-xs font-bold bg-green-100 text-green-700 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>متصل مباشر بالخادم</span>
            </span>
          </div>
        </header>

        @if (errorMessage()) {
          <div class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ errorMessage() }}</span>
            </div>
            <button (click)="loadData()" class="underline font-bold hover:text-amber-900">إعادة المحاولة</button>
          </div>
        }

        <!-- Metrics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-400 font-bold">إجمالي المبيعات</span>
              <span class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">💰</span>
            </div>
            <div class="text-2xl font-black text-gray-800">
              {{ totalRevenue().toLocaleString('ar-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              <span class="text-xs text-primary font-bold">درهم</span>
            </div>
            <span class="text-[11px] text-gray-400 mt-1 block">من كافة الطلبات المسجلة</span>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-400 font-bold">إجمالي الطلبات</span>
              <span class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">📦</span>
            </div>
            <div class="text-2xl font-black text-gray-800">
              {{ orders().length }}
              <span class="text-xs text-gray-400 font-medium">طلب</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {{ pendingOrdersCount() }} قيد المراجعة
              </span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-400 font-bold">أصناف المنيو</span>
              <span class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">🍔</span>
            </div>
            <div class="text-2xl font-black text-gray-800">
              {{ products().length }}
              <span class="text-xs text-gray-400 font-medium">صنف</span>
            </div>
            <span class="text-[11px] text-emerald-600 font-medium mt-1 block">
              {{ activeProductsCount() }} صنف متاح للطلب الآن
            </span>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-400 font-bold">الفروع النشطة</span>
              <span class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">📍</span>
            </div>
            <div class="text-2xl font-black text-gray-800">
              {{ branches().length || 1 }}
              <span class="text-xs text-gray-400 font-medium">فرع</span>
            </div>
            <span class="text-[11px] text-gray-400 mt-1 block truncate">
              {{ branches().length ? branches()[0].nameAr : 'أبوظبي - الكورنيش' }}
            </span>
          </div>

        </div>

        <!-- Orders Breakdown & Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs lg:col-span-1 space-y-4">
            <h3 class="font-bold text-gray-800 text-sm font-baloo">توزيع حالات الطلبات</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between text-xs p-3 rounded-2xl bg-gray-50">
                <span class="font-bold text-gray-700 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> جديد (قيد المراجعة)
                </span>
                <span class="font-black text-gray-800">{{ getCountByStatus('Pending') }}</span>
              </div>
              <div class="flex items-center justify-between text-xs p-3 rounded-2xl bg-gray-50">
                <span class="font-bold text-gray-700 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-400"></span> قيد التجهيز بالمطبخ
                </span>
                <span class="font-black text-gray-800">{{ getCountByStatus('Preparing') }}</span>
              </div>
              <div class="flex items-center justify-between text-xs p-3 rounded-2xl bg-gray-50">
                <span class="font-bold text-gray-700 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span> جاري التوصيل
                </span>
                <span class="font-black text-gray-800">{{ getCountByStatus('OutForDelivery') }}</span>
              </div>
              <div class="flex items-center justify-between text-xs p-3 rounded-2xl bg-gray-50">
                <span class="font-bold text-gray-700 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> تم التسليم بنجاح
                </span>
                <span class="font-black text-gray-800">{{ getCountByStatus('Completed') }}</span>
              </div>
            </div>

            <div class="pt-2">
              <a routerLink="/admin/orders" class="w-full py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                <span>📦</span>
                <span>الانتقال لإدارة كافة الطلبات</span>
              </a>
            </div>
          </div>

          <!-- Recent Orders Table -->
          <div class="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden lg:col-span-2">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-gray-800 text-base font-baloo">أحدث طلبات الزبائن</h3>
                <p class="text-[11px] text-gray-400">آخر 5 طلبات مسجلة على النظام</p>
              </div>
              <a routerLink="/admin/orders" class="text-xs text-primary font-bold hover:underline">عرض الكل ←</a>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-right text-xs">
                <thead class="bg-gray-50 text-gray-500">
                  <tr>
                    <th class="p-4">رقم الطلب</th>
                    <th class="p-4">العميل</th>
                    <th class="p-4">العنوان</th>
                    <th class="p-4">القيمة</th>
                    <th class="p-4">الحالة</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (order of recentOrders(); track order.orderId) {
                    <tr class="hover:bg-gray-50/60 transition-colors">
                      <td class="p-4 font-bold text-gray-900">{{ order.orderNumber }}</td>
                      <td class="p-4">
                        <div class="font-bold text-gray-800">{{ order.customerName }}</div>
                        <div class="text-[10px] text-gray-400 dir-ltr text-right">{{ order.customerPhone }}</div>
                      </td>
                      <td class="p-4 text-gray-500 max-w-xs truncate">{{ order.deliveryAddress }}</td>
                      <td class="p-4 font-black text-primary">{{ order.totalAmount }} درهم</td>
                      <td class="p-4">
                        <span [class]="getStatusClass(order.orderStatus)" class="text-[10px] px-2.5 py-1 rounded-full font-bold">
                          {{ getStatusLabel(order.orderStatus) }}
                        </span>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="p-8 text-center text-gray-400 text-xs">
                        لا توجد طلبات مسجلة حالياً
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
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

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      orders: this.api.getAdminOrders(),
      products: this.api.getAllAdminProducts(),
      branches: this.api.getBranches()
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
        this.errorMessage.set('تعذر جلب البيانات من الخادم، يرجى التأكد من تشغيل الـ API وتسجيل الدخول.');
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

  getCountByStatus(status: string): number {
    return this.orders().filter(o => o.orderStatus === status).length;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Pending': return 'قيد المراجعة';
      case 'Preparing': return 'قيد التجهيز';
      case 'OutForDelivery': return 'جاري التوصيل';
      case 'Completed': return 'تم التسليم';
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
