import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface AdminOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  itemsCount: number;
  total: number;
  status: 'Pending' | 'Preparing' | 'OutForDelivery' | 'Completed';
  createdAt: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex" dir="rtl">
      
      <!-- Sidebar -->
      <aside class="w-64 bg-primaryDark text-white flex flex-col justify-between p-6">
        <div>
          <div class="flex items-center gap-3 pb-6 border-b border-white/10 mb-6">
            <img src="assets/MAIN.jpg" class="w-10 h-10 rounded-full">
            <div>
              <h2 class="font-bold text-sm font-baloo">سوق وسفرة الإدارة</h2>
              <span class="text-[10px] text-gray-400">لوحة التحكم الشاملة</span>
            </div>
          </div>

          <nav class="space-y-2">
            <a routerLink="/admin" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 text-sm font-medium">
              <span>📊</span>
              <span>الإحصائيات العامة</span>
            </a>
            <a routerLink="/admin/products" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 text-sm font-medium">
              <span>🍔</span>
              <span>إدارة المنتجات والمنيو</span>
            </a>
            <a routerLink="/admin/orders" class="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold">
              <span>📦</span>
              <span>الطلبات المباشرة</span>
            </a>
          </nav>
        </div>

        <a routerLink="/" class="text-xs text-gray-400 hover:text-white flex items-center gap-2">
          <span>←</span>
          <span>العودة للمتجر العام</span>
        </a>
      </aside>

      <!-- Main Orders Table -->
      <main class="flex-1 p-8">
        <header class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-black font-baloo text-gray-800">إدارة ومتابعة طلبات الزبائن</h1>
            <p class="text-xs text-gray-400">تحديث حالات الطلبات من الاستلام وحتى التسليم</p>
          </div>
        </header>

        <div class="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <table class="w-full text-right text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th class="p-4">رقم الطلب</th>
                <th class="p-4">العميل والهاتف</th>
                <th class="p-4">العنوان</th>
                <th class="p-4">القيمة الكلية</th>
                <th class="p-4">الحالة الحالية</th>
                <th class="p-4">تحديث الحالة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (order of orders(); track order.id) {
                <tr>
                  <td class="p-4 font-bold text-gray-800">{{ order.orderNumber }}</td>
                  <td class="p-4">
                    <div class="font-bold text-xs">{{ order.customerName }}</div>
                    <div class="text-[11px] text-gray-400 dir-ltr text-right">{{ order.customerPhone }}</div>
                  </td>
                  <td class="p-4 text-xs text-gray-500 max-w-xs">{{ order.address }}</td>
                  <td class="p-4 font-black text-primary">{{ order.total }} درهم</td>
                  <td class="p-4">
                    <span [class]="getStatusClass(order.status)" class="text-xs px-2.5 py-1 rounded-full font-bold">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="p-4">
                    <select 
                      [value]="order.status"
                      (change)="updateStatus(order, $any($event.target).value)"
                      class="text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary">
                      <option value="Pending">جديد (قيد المراجعة)</option>
                      <option value="Preparing">قيد التجهيز بالمطبخ</option>
                      <option value="OutForDelivery">جاري التوصيل</option>
                      <option value="Completed">تم التسليم بنجاح</option>
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </main>

    </div>
  `
})
export class AdminOrdersComponent {
  orders = signal<AdminOrder[]>([
    {
      id: 1,
      orderNumber: '#SOFRA-90124',
      customerName: 'أحمد دبيش',
      customerPhone: '+971 50 123 4567',
      address: 'أبوظبي - الكورنيش - برج النخيل شقة 402',
      itemsCount: 3,
      total: 85,
      status: 'Preparing',
      createdAt: 'منذ 15 دقيقة'
    },
    {
      id: 2,
      orderNumber: '#SOFRA-90123',
      customerName: 'سارة خالد',
      customerPhone: '+971 52 987 6543',
      address: 'الخالدية - بجوار حديقة العائلة',
      itemsCount: 2,
      total: 48,
      status: 'OutForDelivery',
      createdAt: 'منذ 35 دقيقة'
    },
    {
      id: 3,
      orderNumber: '#SOFRA-90122',
      customerName: 'محمود عبد الله',
      customerPhone: '+971 55 456 7890',
      address: 'استلام من الفرع الرئيسي - الكورنيش',
      itemsCount: 1,
      total: 35,
      status: 'Completed',
      createdAt: 'منذ ساعتين'
    }
  ]);

  getStatusLabel(status: string) {
    switch (status) {
      case 'Pending': return 'جديد';
      case 'Preparing': return 'قيد التجهيز';
      case 'OutForDelivery': return 'جاري التوصيل';
      case 'Completed': return 'تم التسليم';
      default: return status;
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Pending': return 'bg-gray-100 text-gray-800';
      case 'Preparing': return 'bg-amber-100 text-amber-800';
      case 'OutForDelivery': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  updateStatus(order: AdminOrder, newStatus: any) {
    const list = this.orders().map(o => o.id === order.id ? { ...o, status: newStatus } : o);
    this.orders.set(list);
  }
}
