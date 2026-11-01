import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
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
            <a routerLink="/admin" class="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold">
              <span>📊</span>
              <span>الإحصائيات العامة</span>
            </a>
            <a routerLink="/admin/products" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 text-sm font-medium">
              <span>🍔</span>
              <span>إدارة المنتجات والمنيو</span>
            </a>
            <a routerLink="/admin/orders" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 text-sm font-medium">
              <span>📦</span>
              <span>الطلبات المباشرة</span>
            </a>
            <a routerLink="/admin/settings" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 text-sm font-medium">
              <span>⚙️</span>
              <span>إعدادات المتجر</span>
            </a>
          </nav>
        </div>

        <a routerLink="/" class="text-xs text-gray-400 hover:text-white flex items-center gap-2">
          <span>←</span>
          <span>العودة للمتجر العام</span>
        </a>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-8">
        <header class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-black font-baloo text-gray-800">نظرة عامة على المبيعات والطلبات</h1>
            <p class="text-xs text-gray-400">متابعة فورية لنشاط مطعم ومخبز سوق وسفرة</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">النظام متصل مباشر</span>
          </div>
        </header>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
            <span class="text-xs text-gray-400 font-bold">إجمالي المبيعات اليوم</span>
            <div class="text-2xl font-black text-gray-800 mt-2">1,840 <span class="text-xs text-primary font-bold">درهم</span></div>
          </div>
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
            <span class="text-xs text-gray-400 font-bold">عدد الطلبات الجديدة</span>
            <div class="text-2xl font-black text-gray-800 mt-2">38 طلب</div>
          </div>
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
            <span class="text-xs text-gray-400 font-bold">إجمالي الأصناف المتاحة</span>
            <div class="text-2xl font-black text-gray-800 mt-2">64 صنف</div>
          </div>
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
            <span class="text-xs text-gray-400 font-bold">الفرع النشط</span>
            <div class="text-sm font-black text-gray-800 mt-3 truncate">أبوظبي - الكورنيش</div>
          </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-bold text-gray-800 text-base">أحدث طلبات الزبائن</h3>
            <span class="text-xs text-primary font-bold">تحديث تلقائي</span>
          </div>
          <table class="w-full text-right text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th class="p-4">رقم الطلب</th>
                <th class="p-4">العميل</th>
                <th class="p-4">العنوان</th>
                <th class="p-4">القيمة</th>
                <th class="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr>
                <td class="p-4 font-bold">#SOFRA-89412</td>
                <td class="p-4">أحمد دبيش (+971 50...)</td>
                <td class="p-4 text-xs text-gray-500">أبوظبي - شارع الكورنيش برج 4</td>
                <td class="p-4 font-bold text-primary">85 درهم</td>
                <td class="p-4"><span class="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">قيد التجهيز</span></td>
              </tr>
              <tr>
                <td class="p-4 font-bold">#SOFRA-89411</td>
                <td class="p-4">محمد السيد</td>
                <td class="p-4 text-xs text-gray-500">الخالدية - مقابل بنك النيلين</td>
                <td class="p-4 font-bold text-primary">120 درهم</td>
                <td class="p-4"><span class="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">جاري التوصيل</span></td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>
    </div>
  `
})
export class DashboardComponent {}
