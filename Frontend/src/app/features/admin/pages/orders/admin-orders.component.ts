import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { AdminOrder } from '../../../../core/models/models';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex font-cairo" dir="rtl">
      
      <!-- Shared Sidebar -->
      <app-admin-sidebar />

      <!-- Main Orders Content -->
      <main class="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        
        <!-- Header -->
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-black font-baloo text-gray-800">إدارة ومتابعة طلبات الزبائن</h1>
            <p class="text-xs text-gray-400">تحديث الحالات ومتابعة تفاصيل وتوصيل الطلبات لحظة بلحظة</p>
          </div>
          <button 
            (click)="loadOrders()" 
            [disabled]="isLoading()"
            class="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto">
            <span [class.animate-spin]="isLoading()">🔄</span>
            <span>تحديث الطلبات</span>
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
              الكل ({{ orders().length }})
            </button>
            <button 
              (click)="selectedStatus.set('Pending')"
              [class]="selectedStatus() === 'Pending' ? 'bg-amber-500 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-3.5 py-2 rounded-xl text-xs transition-all shrink-0">
              جديد ({{ countStatus('Pending') }})
            </button>
            <button 
              (click)="selectedStatus.set('Preparing')"
              [class]="selectedStatus() === 'Preparing' ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-3.5 py-2 rounded-xl text-xs transition-all shrink-0">
              قيد التجهيز ({{ countStatus('Preparing') }})
            </button>
            <button 
              (click)="selectedStatus.set('OutForDelivery')"
              [class]="selectedStatus() === 'OutForDelivery' ? 'bg-purple-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-3.5 py-2 rounded-xl text-xs transition-all shrink-0">
              جاري التوصيل ({{ countStatus('OutForDelivery') }})
            </button>
            <button 
              (click)="selectedStatus.set('Completed')"
              [class]="selectedStatus() === 'Completed' ? 'bg-green-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-3.5 py-2 rounded-xl text-xs transition-all shrink-0">
              تم التسليم ({{ countStatus('Completed') }})
            </button>
          </div>

          <!-- Search Input -->
          <div class="w-full md:w-72">
            <input 
              type="text" 
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="ابحث برقم الطلب، اسم العميل، الهاتف..."
              class="w-full text-xs px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
          </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-right text-xs">
              <thead class="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th class="p-4">رقم الطلب</th>
                  <th class="p-4">العميل والهاتف</th>
                  <th class="p-4">العنوان</th>
                  <th class="p-4">القيمة الإجمالية</th>
                  <th class="p-4">الدفع</th>
                  <th class="p-4">الحالة الحالية</th>
                  <th class="p-4">تحديث الحالة</th>
                  <th class="p-4 text-center">التفاصيل</th>
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
                    <td class="p-4 text-gray-500 max-w-xs truncate">{{ order.deliveryAddress }}</td>
                    <td class="p-4 font-black text-primary">
                      {{ order.totalAmount }} درهم
                    </td>
                    <td class="p-4">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {{ order.paymentMethod === 'CashOnDelivery' ? 'دفع عند الاستلام' : 'بطاقة ائتمان' }}
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
                        (change)="changeStatus(order, $any($event.target).value)"
                        class="text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary">
                        <option value="Pending">جديد (قيد المراجعة)</option>
                        <option value="Preparing">قيد التجهيز بالمطبخ</option>
                        <option value="OutForDelivery">جاري التوصيل</option>
                        <option value="Completed">تم التسليم بنجاح</option>
                      </select>
                    </td>
                    <td class="p-4 text-center">
                      <button 
                        (click)="viewOrderDetails(order)"
                        class="px-3 py-1 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">
                        عرض الأصناف ({{ order.items ? order.items.length : 0 }})
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="p-10 text-center text-gray-400 text-xs">
                      لا توجد طلبات تطابق المعايير المحددة
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
                  تفاصيل الطلب: {{ selectedOrder()!.orderNumber }}
                </h2>
                <span class="text-[10px] text-gray-400">{{ formatDate(selectedOrder()!.createdAt) }}</span>
              </div>
              <button (click)="selectedOrder.set(null)" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-sm font-bold">✕</button>
            </div>

            <!-- Customer & Delivery Summary -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 text-xs">
              <div>
                <span class="text-gray-400 block mb-0.5">اسم العميل:</span>
                <strong class="text-gray-800 text-sm">{{ selectedOrder()!.customerName }}</strong>
                <div class="text-gray-500 dir-ltr text-right mt-1">{{ selectedOrder()!.customerPhone }}</div>
              </div>
              <div>
                <span class="text-gray-400 block mb-0.5">عنوان التوصيل:</span>
                <strong class="text-gray-800">{{ selectedOrder()!.deliveryAddress }}</strong>
                @if (selectedOrder()!.notes) {
                  <div class="text-primary text-[11px] mt-1 font-medium">ملاحظات: {{ selectedOrder()!.notes }}</div>
                }
              </div>
            </div>

            <!-- Items List -->
            <div class="space-y-3">
              <h3 class="font-bold text-xs text-gray-700">الأصناف المطلوبة:</h3>
              <div class="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                @for (item of selectedOrder()!.items; track item.orderItemId) {
                  <div class="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div class="font-bold text-gray-800">{{ item.productNameAr }}</div>
                      <div class="text-[10px] text-gray-400">{{ item.productNameEn }}</div>
                      @if (item.variantNameAr) {
                        <span class="text-[10px] text-primary">الحجم: {{ item.variantNameAr }}</span>
                      }
                    </div>
                    <div class="text-left font-bold">
                      <span class="text-gray-500">{{ item.quantity }} × {{ item.unitPrice }} درهم = </span>
                      <span class="text-primary font-black">{{ item.totalPrice }} درهم</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Cost Breakdown -->
            <div class="p-4 rounded-2xl bg-primary/5 space-y-2 text-xs">
              <div class="flex justify-between text-gray-600">
                <span>المجموع الفرعي للأصناف:</span>
                <span class="font-bold">{{ selectedOrder()!.subTotal }} درهم</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>رسوم التوصيل:</span>
                <span class="font-bold">{{ selectedOrder()!.deliveryFee }} درهم</span>
              </div>
              <div class="flex justify-between text-gray-900 font-black text-sm pt-2 border-t border-primary/20">
                <span>الإجمالي الكلي:</span>
                <span class="text-primary font-black">{{ selectedOrder()!.totalAmount }} درهم</span>
              </div>
            </div>

            <div class="flex justify-between items-center pt-2">
              <button 
                (click)="deleteOrder(selectedOrder()!)" 
                class="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors">
                حذف الطلب
              </button>

              <button 
                (click)="selectedOrder.set(null)" 
                class="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors">
                إغلاق
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private api = inject(ApiService);

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
        this.showFeedback('تعذر تحميل الطلبات من الخادم.', 'error');
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
        this.showFeedback(`تم تحديث حالة الطلب (${order.orderNumber}) إلى "${this.getStatusLabel(newStatus)}".`, 'success');
      },
      error: () => {
        this.showFeedback('فشل تحديث حالة الطلب.', 'error');
      }
    });
  }

  deleteOrder(order: AdminOrder) {
    if (!confirm(`هل أنت متأكد من حذف الطلب "${order.orderNumber}" نهائياً؟`)) return;

    this.api.deleteOrder(order.orderId).subscribe({
      next: () => {
        this.orders.set(this.orders().filter(o => o.orderId !== order.orderId));
        this.selectedOrder.set(null);
        this.showFeedback(`تم حذف الطلب (${order.orderNumber}) بنجاح.`, 'success');
      },
      error: () => this.showFeedback('تعذر حذف الطلب من الخادم.', 'error')
    });
  }

  viewOrderDetails(order: AdminOrder) {
    this.selectedOrder.set(order);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-AE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
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

  private showFeedback(msg: string, type: 'success' | 'error') {
    this.feedbackMessage.set(msg);
    this.feedbackType.set(type);
    setTimeout(() => {
      if (this.feedbackMessage() === msg) this.feedbackMessage.set('');
    }, 4000);
  }
}
