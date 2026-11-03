import { LanguageService } from '../../../../core/services/language.service';
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { AdminOrder, OrderItemAddon } from '../../../../core/models/models';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="admin-shell min-h-screen bg-gray-50 flex font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">

      <!-- Shared Sidebar -->
      <app-admin-sidebar />

      <!-- Main Orders Content -->
      <main class="min-w-0 flex-1 p-5 pt-20 md:p-8 lg:mr-64">

        <!-- Header -->
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-black font-baloo text-gray-800">{{ language.t('إدارة ومتابعة طلبات الزبائن', 'Manage customer orders') }}</h1>
            <p class="text-xs text-gray-400">{{ language.t('تحديث الحالات ومتابعة تفاصيل وتوصيل الطلبات لحظة بلحظة', 'Update order statuses and track deliveries') }}</p>
          </div>
          <button
            (click)="loadOrders()"
            [disabled]="isLoading()"
            class="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto">
            <span [class.animate-spin]="isLoading()">🔄</span>
            <span>{{ language.t('تحديث الطلبات', 'Refresh orders') }}</span>
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

        <!-- Filter Tabs & Search -->
        <div class="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <!-- Status Tabs -->
          <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              (click)="selectedStatus.set('ALL')"
              [class]="selectedStatus() === 'ALL' ? 'bg-primary text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-3.5 py-2 rounded-xl text-xs transition-all shrink-0">
              {{ language.t('الكل', 'All') }} ({{ orders().length }})
            </button>
            <button
              (click)="selectedStatus.set('Pending')"
              [class]="selectedStatus() === 'Pending' ? 'bg-amber-500 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-3.5 py-2 rounded-xl text-xs transition-all shrink-0">
              {{ language.t('جديد', 'New') }} ({{ countStatus('Pending') }})
            </button>
            <button
              (click)="selectedStatus.set('Preparing')"
              [class]="selectedStatus() === 'Preparing' ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-3.5 py-2 rounded-xl text-xs transition-all shrink-0">
              {{ language.t('قيد التجهيز', 'Preparing') }} ({{ countStatus('Preparing') }})
            </button>
            <button
              (click)="selectedStatus.set('OutForDelivery')"
              [class]="selectedStatus() === 'OutForDelivery' ? 'bg-purple-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-3.5 py-2 rounded-xl text-xs transition-all shrink-0">
              {{ language.t('جاري التوصيل', 'Out for delivery') }} ({{ countStatus('OutForDelivery') }})
            </button>
            <button
              (click)="selectedStatus.set('Completed')"
              [class]="selectedStatus() === 'Completed' ? 'bg-green-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-3.5 py-2 rounded-xl text-xs transition-all shrink-0">
              {{ language.t('تم التسليم', 'Delivered') }} ({{ countStatus('Completed') }})
            </button>
          </div>

          <!-- Search Input -->
          <div class="w-full md:w-72">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              [placeholder]="language.t('ابحث برقم الطلب، اسم العميل، الهاتف...', 'Search order number, customer, or phone...')"
              class="w-full text-xs px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
          </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-right text-xs">
              <thead class="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th class="p-4">{{ language.t('رقم الطلب', 'Order number') }}</th>
                  <th class="p-4">{{ language.t('العميل والهاتف', 'Customer & phone') }}</th>
                  <th class="p-4">{{ language.t('قناة الطلب', 'Order channel') }}</th>
                  <th class="p-4">{{ language.t('العنوان', 'Address') }}</th>
                  <th class="p-4">{{ language.t('القيمة الإجمالية', 'Total') }}</th>
                  <th class="p-4">{{ language.t('الدفع', 'Payment') }}</th>
                  <th class="p-4">{{ language.t('الحالة الحالية', 'Current status') }}</th>
                  <th class="p-4">{{ language.t('تحديث الحالة', 'Update status') }}</th>
                  <th class="p-4 text-center">{{ language.t('التفاصيل', 'Details') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (order of filteredOrders(); track order.orderId) {
                  <tr class="hover:bg-gray-50/50 transition-colors">
                    <td class="p-4 font-bold text-gray-900">
                      <div>{{ order.orderNumber }}</div>
                      <span class="text-[10px] text-gray-400 font-normal">
                        {{ formatDate(order.createdAt) }}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="font-bold text-gray-800">{{ order.customerName }}</div>
                      <div class="text-[11px] text-gray-500 dir-ltr text-right">{{ order.customerPhone }}</div>
                    </td>
                    <td class="p-4"><span [class]="order.orderChannel === 'WhatsApp' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'" class="inline-flex rounded-full px-3 py-1 text-xs font-bold">{{ language.t(order.orderChannel === 'WhatsApp' ? 'واتساب' : 'الموقع', order.orderChannel === 'WhatsApp' ? 'WhatsApp' : 'Website') }}</span></td>
                    <td class="p-4 text-gray-500 max-w-xs truncate">{{ order.deliveryAddress }}</td>
                    <td class="p-4 font-black text-primary">
                      {{ order.totalAmount }} {{ language.isEnglish() ? 'AED' : 'درهم' }}
                    </td>
                    <td class="p-4">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {{ language.t(order.paymentMethod === 'CashOnDelivery' ? 'دفع عند الاستلام' : 'بطاقة ائتمان', order.paymentMethod === 'CashOnDelivery' ? 'Cash on delivery' : 'Credit card') }}
                      </span>
                    </td>
                    <td class="p-4">
                      <span [class]="getStatusClass(order.orderStatus)" class="text-[11px] px-2.5 py-1 rounded-full font-bold">
                        {{ getStatusLabel(order.orderStatus) }}
                      </span>
                    </td>
                    <td class="p-4">
                      <select
                        [value]="order.orderStatus"
                        [disabled]="!auth.hasPermission('orders.update')" (change)="changeStatus(order, $any($event.target).value)"
                        class="text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary">
                        <option value="Pending">{{ language.t('جديد (قيد المراجعة)', 'New (pending review)') }}</option>
                        <option value="Preparing">{{ language.t('قيد التجهيز بالمطبخ', 'Preparing in kitchen') }}</option>
                        <option value="OutForDelivery">{{ language.t('جاري التوصيل', 'Out for delivery') }}</option>
                        <option value="Completed">{{ language.t('تم التسليم بنجاح', 'Delivered successfully') }}</option>
                      </select>
                    </td>
                    <td class="p-4 text-center">
                      <button
                        (click)="viewOrderDetails(order)"
                        class="px-3 py-1 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">
                        {{ language.t('عرض الأصناف', 'View items') }} ({{ order.items ? order.items.length : 0 }})
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="p-10 text-center text-gray-400 text-sm">
                      {{ language.t('لا توجد طلبات تطابق المعايير المحددة', 'No orders match the selected filters') }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <!-- Order Details Modal -->
      @if (selectedOrder()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl">

            <div class="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 class="text-base font-bold font-baloo text-gray-800">
                  {{ language.t('تفاصيل الطلب:', 'Order details:') }} {{ selectedOrder()!.orderNumber }}
                </h2>
                <div class="mt-1 flex items-center gap-2"><span class="text-xs text-gray-500">{{ formatDate(selectedOrder()!.createdAt) }}</span><span [class]="selectedOrder()!.orderChannel === 'WhatsApp' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'" class="rounded-full px-2.5 py-1 text-xs font-bold">{{ language.t(selectedOrder()!.orderChannel === 'WhatsApp' ? 'طلب واتساب' : 'طلب من الموقع', selectedOrder()!.orderChannel === 'WhatsApp' ? 'WhatsApp order' : 'Website order') }}</span></div>
              </div>
              <button (click)="selectedOrder.set(null)" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-sm font-bold">✕</button>
            </div>

            <!-- Customer & Delivery Summary -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 text-xs">
              <div>
                <span class="text-gray-400 block mb-0.5">{{ language.t('اسم العميل:', 'Customer name:') }}</span>
                <strong class="text-gray-800 text-sm">{{ selectedOrder()!.customerName }}</strong>
                <div class="text-gray-500 dir-ltr text-right mt-1">{{ selectedOrder()!.customerPhone }}</div>
              </div>
              <div>
                <span class="text-gray-400 block mb-0.5">{{ language.t('عنوان التوصيل:', 'Delivery address:') }}</span>
                <strong class="text-gray-800">{{ selectedOrder()!.deliveryAddress }}</strong>
                @if (selectedOrder()!.notes) {
                  <div class="text-primary text-[11px] mt-1 font-medium">{{ language.t('ملاحظات:', 'Notes:') }} {{ selectedOrder()!.notes }}</div>
                }
              </div>
            </div>

            <!-- Items List -->
            <div class="space-y-3">
              <h3 class="font-bold text-xs text-gray-700">{{ language.t('الأصناف المطلوبة:', 'Items ordered:') }}</h3>
              <div class="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                @for (item of selectedOrder()!.items; track item.orderItemId) {
                  <div class="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div class="font-bold text-gray-800">{{ language.isEnglish() ? (item.productNameEn || item.productNameAr) : item.productNameAr }}</div>
                      @if (item.variantNameAr) {
                        <span class="text-[10px] text-primary">{{ language.t('الحجم:', 'Option:') }} {{ language.isEnglish() ? (item.variantNameEn || item.variantNameAr) : item.variantNameAr }}</span>
                      }
                      @if (item.addons?.length) {
                        <span class="block text-[10px] text-gray-500">{{ language.t('الإضافات:', 'Extras:') }} {{ formatAddonNames(item.addons) }}</span>
                      }
                    </div>
                    <div class="text-left font-bold">
                      <span class="text-gray-500">{{ item.quantity }} × {{ item.unitPrice }} {{ language.isEnglish() ? 'AED' : 'درهم' }} = </span>
                      <span class="text-primary font-black">{{ item.totalPrice }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Cost Breakdown -->
            <div class="p-4 rounded-2xl bg-primary/5 space-y-2 text-xs">
              <div class="flex justify-between text-gray-600">
                <span>{{ language.t('المجموع الفرعي للأصناف:', 'Items subtotal:') }}</span>
                <span class="font-bold">{{ selectedOrder()!.subTotal }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>{{ language.t('رسوم التوصيل:', 'Delivery fee:') }}</span>
                <span class="font-bold">{{ selectedOrder()!.deliveryFee }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
              </div>
              <div class="flex justify-between text-gray-900 font-black text-sm pt-2 border-t border-primary/20">
                <span>{{ language.t('الإجمالي الكلي:', 'Grand total:') }}</span>
                <span class="text-primary font-black">{{ selectedOrder()!.totalAmount }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
              </div>
            </div>

            <div class="flex justify-between items-center pt-2">
              @if (auth.hasPermission('orders.delete')) {
              <button
                (click)="deleteOrder(selectedOrder()!)"
                class="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors">
                {{ language.t('حذف الطلب', 'Delete order') }}
              </button>

              }
              <button
                (click)="selectedOrder.set(null)"
                class="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors">
                {{ language.t('إغلاق', 'Close') }}
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  language = inject(LanguageService);
  private api = inject(ApiService);
  auth = inject(AuthService);

  orders = signal<AdminOrder[]>([]);
  selectedStatus = signal<string>('ALL');
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);

  feedbackMessage = signal<string>('');
  feedbackType = signal<'success' | 'error'>('success');

  selectedOrder = signal<AdminOrder | null>(null);

  filteredOrders = computed(() => {
    let list = this.orders();
    const st = this.selectedStatus();
    const q = this.searchQuery().trim().toLowerCase();

    if (st !== 'ALL') {
      list = list.filter(o => o.orderStatus === st);
    }

    if (q) {
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }

    return list;
  });

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.api.getAdminOrders().subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.orders.set(data || []);
      },
      error: () => {
        this.isLoading.set(false);
        this.showFeedback(this.language.t('تعذر تحميل الطلبات من الخادم.', 'Could not load orders from the server.'), 'error');
      }
    });
  }

  countStatus(status: string): number {
    return this.orders().filter(o => o.orderStatus === status).length;
  }

  changeStatus(order: AdminOrder, newStatus: string) {
    this.api.updateOrderStatus(order.orderId, newStatus).subscribe({
      next: () => {
        const updated = this.orders().map(o => o.orderId === order.orderId ? { ...o, orderStatus: newStatus } : o);
        this.orders.set(updated);
        this.showFeedback(this.language.t(`تم تحديث حالة الطلب (${order.orderNumber}) إلى "${this.getStatusLabel(newStatus)}".`, `Order ${order.orderNumber} updated to “${this.getStatusLabel(newStatus)}”.`), 'success');
      },
      error: () => {
        this.showFeedback(this.language.t('فشل تحديث حالة الطلب.', 'Could not update the order status.'), 'error');
      }
    });
  }

  deleteOrder(order: AdminOrder) {
    if (!confirm(this.language.t(`هل أنت متأكد من حذف الطلب "${order.orderNumber}" نهائياً؟`, `Permanently delete order "${order.orderNumber}"?`))) return;

    this.api.deleteOrder(order.orderId).subscribe({
      next: () => {
        this.orders.set(this.orders().filter(o => o.orderId !== order.orderId));
        this.selectedOrder.set(null);
        this.showFeedback(this.language.t(`تم حذف الطلب (${order.orderNumber}) بنجاح.`, `Order ${order.orderNumber} deleted.`), 'success');
      },
      error: () => this.showFeedback(this.language.t('تعذر حذف الطلب من الخادم.', 'Could not delete the order from the server.'), 'error')
    });
  }

  viewOrderDetails(order: AdminOrder) {
    this.selectedOrder.set(order);
  }

  formatAddonNames(addons?: OrderItemAddon[]): string {
    return (addons || []).map(addon => this.language.isEnglish() ? (addon.nameEn || addon.nameAr) : addon.nameAr).join(this.language.isEnglish() ? ', ' : '، ');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(this.language.isEnglish() ? 'en-AE' : 'ar-AE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
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

  private showFeedback(msg: string, type: 'success' | 'error') {
    this.feedbackMessage.set(msg);
    this.feedbackType.set(type);
    setTimeout(() => {
      if (this.feedbackMessage() === msg) this.feedbackMessage.set('');
    }, 4000);
  }
}
