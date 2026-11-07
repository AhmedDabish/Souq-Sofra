import { LanguageService } from '../../../../core/services/language.service';
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Product, Category, ProductCreate, ProductAddon, ProductVariant, AddonTemplate } from '../../../../core/models/models';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="admin-shell min-h-screen bg-gray-50 flex font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">

      <!-- Shared Sidebar -->
      <app-admin-sidebar />

      <!-- Main Content -->
      <main class="min-w-0 flex-1 p-5 pt-20 md:p-8 lg:mr-64">

        <!-- Header -->
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-black font-baloo text-gray-800">{{ language.t('إدارة أصناف ومنتجات المنيو', 'Manage menu products') }}</h1>
            <p class="text-xs text-gray-400">{{ language.t('إضافة وتعديل وحذف الأصناف والتحكم في الخصومات والعروض والأسعار وتوفر المنتجات', 'Add, edit, and manage products, discounts, prices, and availability') }}</p>
          </div>
          <button
            [hidden]="!auth.hasPermission('products.create')" (click)="openAddModal()"
            class="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primaryHover text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto cursor-pointer">
            <span>+</span>
            <span>{{ language.t('إضافة صنف جديد', 'Add product') }}</span>
          </button>
        </header>

        <!-- Feedback Alert -->
        @if (feedbackMessage()) {
          <div [class]="feedbackType() === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'"
               class="mb-6 p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between">
            <span>{{ feedbackMessage() }}</span>
            <button (click)="feedbackMessage.set('')" class="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
          </div>
        }

        <!-- Filter & Search Toolbar -->
        <div class="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 w-full md:w-auto">
            <span class="text-xs font-bold text-gray-500">{{ language.t('التصنيف:', 'Category:') }}</span>
            <select
              [ngModel]="selectedCategory()"
              (ngModelChange)="setSelectedCategory($event)"
              class="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary">
              <option [ngValue]="null">{{ language.t('كافة التصنيفات', 'All categories') }} ({{ products().length }})</option>
              @for (cat of categories(); track cat.categoryId) {
                <option [ngValue]="cat.categoryId">{{ language.isEnglish() ? (cat.nameEn || cat.nameAr) : cat.nameAr }}</option>
              }
            </select>
          </div>

          <!-- Quick Filter by Discount / Featured -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="toggleDiscountFilter()"
              [class]="onlyDiscounted() ? 'bg-primary text-white font-bold shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="text-xs px-3 py-2 rounded-xl transition-all font-medium cursor-pointer">
              {{ language.t('🏷️ الأصناف المخفضة فقط', '🏷️ Discounted only') }}
            </button>
          </div>

          <div class="w-full md:w-72">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="setSearchQuery($event)"
              [placeholder]="language.t('ابحث بالاسم العربي أو الإنجليزي...', 'Search Arabic or English names...')"
              class="w-full text-xs px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
          </div>
        </div>

        <!-- Products Table -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-right text-xs">
              <thead class="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th class="p-4">{{ language.t('الصنف', 'Product') }}</th>
                  <th class="p-4">{{ language.t('القسم', 'Category') }}</th>
                  <th class="p-4">{{ language.t('السعر الأساسي', 'Base price') }}</th>
                  <th class="p-4">{{ language.t('الخصم والعرض', 'Discount') }}</th>
                  <th class="p-4">{{ language.t('التوفر', 'Availability') }}</th>
                  <th class="p-4">{{ language.t('مميز', 'Featured') }}</th>
                  <th class="p-4">{{ language.t('الأكثر مبيعًا', 'Best seller') }}</th>
                  <th class="p-4 text-center">{{ language.t('إجراءات', 'Actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (prod of pagedProducts(); track prod.productId) {
                  <tr class="hover:bg-gray-50/50 transition-colors">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <img [src]="imageUrl(prod.imageUrl)" [alt]="language.isEnglish() ? (prod.nameEn || prod.nameAr) : prod.nameAr" class="w-12 h-12 rounded-2xl object-cover border border-gray-100 shrink-0">
                        <div>
                          <div class="font-bold text-gray-800 text-xs">{{ language.isEnglish() ? (prod.nameEn || prod.nameAr) : prod.nameAr }}</div>

                          @if (prod.variants && prod.variants.length) {
                            <span class="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-1">
                              {{ prod.variants.length }} {{ language.t('أحجام / خيارات', 'sizes / options') }}
                            </span>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="p-4 font-medium text-gray-600">
                      {{ getCategoryName(prod.categoryId) }}
                    </td>
                    <td class="p-4 font-black text-gray-900">{{ prod.basePrice }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</td>

                    <!-- Discount Cell with Quick Action -->
                    <td class="p-4">
                      @if (prod.discountPrice && prod.discountPrice > 0 && prod.discountPrice < prod.basePrice) {
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-green-600 font-black text-xs">{{ prod.discountPrice }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
                          <span class="bg-primary/10 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {{ language.t('خصم', 'Save') }} {{ getDiscountPercent(prod) }}%
                          </span>
                          <button
                            type="button"
                            [hidden]="!auth.hasPermission('products.update')" (click)="openQuickDiscountModal(prod)"
                            class="text-xs text-blue-600 hover:text-blue-800 font-bold p-1 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            [title]="language.t('تعديل الخصم', 'Edit discount')">
                            {{ language.t('✏️ تعديل', '✏️ Edit') }}
                          </button>
                        </div>
                      } @else {
                        <button
                          type="button"
                          [hidden]="!auth.hasPermission('products.update')" (click)="openQuickDiscountModal(prod)"
                          class="px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold text-[11px] transition-colors cursor-pointer border border-orange-200">
                          {{ language.t('+ إضافة خصم', '+ Add discount') }}
                        </button>
                      }
                    </td>

                    <td class="p-4">
                      <button
                        [hidden]="!auth.hasPermission('products.update')" (click)="toggleAvailability(prod)"
                        [disabled]="isUpdatingId() === prod.productId"
                        [class]="prod.isAvailable ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'"
                        class="text-[11px] px-3 py-1 rounded-full font-bold transition-colors cursor-pointer">
                        {{ language.t(prod.isAvailable ? '✓ متوفر' : '✕ غير متوفر', prod.isAvailable ? '✓ Available' : '✕ Unavailable') }}
                      </button>
                    </td>
                    <td class="p-4">
                      <button
                        [hidden]="!auth.hasPermission('products.update')" (click)="toggleFeatured(prod)"
                        [disabled]="isUpdatingId() === prod.productId"
                        [class]="prod.isFeatured ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200'"
                        class="text-[11px] px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        [title]="language.t('تبديل حالة الصنف المميز', 'Toggle featured status')">
                        <span>{{ language.t(prod.isFeatured ? '⭐ مميز' : '☆ عادي', prod.isFeatured ? '⭐ Featured' : '☆ Standard') }}</span>
                      </button>
                    </td>
                    <td class="p-4">
                      <button type="button" [hidden]="!auth.hasPermission('products.update')" (click)="toggleBestSelling(prod)" [disabled]="isUpdatingId() === prod.productId"
                        [class]="prod.isManuallyBestSelling ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-gray-100 text-gray-500 border-gray-200'"
                        class="rounded-full border px-3 py-1 text-xs font-bold transition hover:opacity-80">
                        {{ language.t(prod.isManuallyBestSelling ? '♥ مختار يدويًا' : '♡ اختيار', prod.isManuallyBestSelling ? '♥ Pinned' : '♡ Pin') }}
                      </button>
                      <div class="mt-1 text-center text-xs text-gray-500">{{ prod.completedSalesQuantity || 0 }} {{ language.t('مبيع مكتمل', 'completed sales') }}</div>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center justify-center gap-2">
                        <button
                          [hidden]="!auth.hasPermission('products.update')" (click)="openEditModal(prod)"
                          class="px-3 py-1 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold transition-colors cursor-pointer">
                          {{ language.t('تعديل', 'Edit') }}
                        </button>
                        <button
                          [hidden]="!auth.hasPermission('products.delete')" (click)="deleteProduct(prod)"
                          class="px-3 py-1 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-colors cursor-pointer">
                          {{ language.t('حذف', 'Delete') }}
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="p-10 text-center text-gray-400 text-sm">
                      {{ language.t('لا توجد أصناف تطابق معايير البحث', 'No products match your search') }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (filteredProducts().length > 0) {
            <div class="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <label class="flex items-center gap-2 text-xs font-bold text-gray-600">{{ language.t('عدد المنتجات في الصفحة', 'Products per page') }}
                <select [ngModel]="pageSize()" (ngModelChange)="setPageSize($event)" class="rounded-lg border border-gray-200 bg-white px-2 py-1.5">
                  <option [ngValue]="10">10</option><option [ngValue]="25">25</option><option [ngValue]="50">50</option>
                </select>
              </label>
              <div class="flex items-center justify-between gap-3 sm:justify-end">
                <span class="text-xs text-gray-500">{{ pageStart() }}–{{ pageEnd() }} {{ language.t('من', 'of') }} {{ filteredProducts().length }}</span>
                <nav class="flex items-center gap-1" [attr.aria-label]="language.t('صفحات المنتجات', 'Product pages')">
                  <button type="button" (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() <= 1" class="rounded-lg border bg-white px-3 py-1.5 text-xs font-bold disabled:opacity-40">{{ language.t('السابق', 'Previous') }}</button>
                  <span class="min-w-16 text-center text-xs font-bold text-gray-600">{{ currentPage() }} / {{ totalPages() }}</span>
                  <button type="button" (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages()" class="rounded-lg border bg-white px-3 py-1.5 text-xs font-bold disabled:opacity-40">{{ language.t('التالي', 'Next') }}</button>
                </nav>
              </div>
            </div>
          }
        </div>

      </main>

      <!-- Quick Discount Modal -->
      @if (showDiscountModal() && targetDiscountProduct) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-gray-100 shadow-2xl animate-fadeIn">
            <div class="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 class="text-base font-bold font-baloo text-gray-800">{{ language.t('إدارة خصم الصنف', 'Manage product discount') }}</h3>
                <p class="text-xs text-primary font-bold mt-0.5">{{ language.isEnglish() ? (targetDiscountProduct.nameEn || targetDiscountProduct.nameAr) : targetDiscountProduct.nameAr }}</p>
              </div>
              <button (click)="closeDiscountModal()" class="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs font-bold cursor-pointer">✕</button>
            </div>

            <div class="bg-orange-50/50 p-3 rounded-2xl border border-orange-100 text-xs flex justify-between items-center">
              <span class="text-gray-600 font-medium">{{ language.t('السعر الأساسي الحالي:', 'Current base price:') }}</span>
              <span class="text-gray-900 font-black text-sm">{{ targetDiscountProduct.basePrice }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
            </div>

            <div class="space-y-2">
              <label class="block font-bold text-gray-700 text-xs">{{ language.t('سعر الخصم المطلوب (درهم):', 'Discount price (AED):') }}</label>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  [(ngModel)]="quickDiscountValue"
                  min="0"
                  [max]="targetDiscountProduct.basePrice - 0.5"
                  step="0.5"
                  [placeholder]="language.t('مثال: 120', 'e.g. 120')"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:border-primary">
                <span class="text-xs text-gray-500 font-bold shrink-0">{{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
              </div>
            </div>

            <!-- Quick Percentage Pills -->
            <div class="space-y-1.5">
              <span class="text-[11px] text-gray-400 font-bold">{{ language.t('نسب خصم جاهزة:', 'Quick discounts:') }}</span>
              <div class="flex flex-wrap gap-1.5">
                @for (pct of [10, 15, 20, 25, 30, 40, 50]; track pct) {
                  <button
                    type="button"
                    (click)="applyQuickPercentToTarget(pct)"
                    class="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-primary hover:text-white text-gray-700 text-xs font-bold transition-colors cursor-pointer">
                    {{ pct }}%
                  </button>
                }
              </div>
            </div>

            @if (quickDiscountValue && quickDiscountValue > 0 && quickDiscountValue < targetDiscountProduct.basePrice) {
              <div class="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center justify-between font-bold">
                <span>{{ language.t('نسبة الخصم المحسوبة:', 'Calculated discount:') }}</span>
                <span class="text-sm font-black">{{ calculateTargetPercent() }}%</span>
              </div>
            }

            <div class="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
              <button
                type="button"
                (click)="removeTargetDiscount()"
                class="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer">
                {{ language.t('إزالة الخصم', 'Remove discount') }}
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="closeDiscountModal()"
                  class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer">
                  {{ language.t('إلغاء', 'Cancel') }}
                </button>
                <button
                  type="button"
                  (click)="saveQuickDiscount()"
                  [disabled]="isSavingDiscount()"
                  class="px-5 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold transition-all shadow-md cursor-pointer">
                  {{ language.t('حفظ الخصم', 'Save discount') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Add / Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl">

            <div class="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 class="text-lg font-bold font-baloo text-gray-800">
                {{ isEditing() ? language.t('تعديل صنف: ', 'Edit product: ') + (language.isEnglish() ? formProduct.nameEn : formProduct.nameAr) : language.t('إضافة صنف جديد للمنيو', 'Add a menu product') }}
              </h2>
              <button (click)="closeModal()" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form (ngSubmit)="saveProduct()" class="space-y-4 text-xs">

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('الاسم بالعربية *', 'Arabic name *') }}</label>
                  <input type="text" [(ngModel)]="formProduct.nameAr" name="nameAr" required [placeholder]="language.t('مثال: فطيرة مشلتت بالسمن البلدي', 'Example: Traditional ghee feteer')"
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
                </div>

                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('الاسم بالإنجليزية *', 'English name *') }}</label>
                  <input type="text" [(ngModel)]="formProduct.nameEn" name="nameEn" required placeholder="e.g., Feteer Meshaltet"
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('التصنيف *', 'Category *') }}</label>
                  <select [ngModel]="formProduct.categoryId" (ngModelChange)="onProductCategoryChange($event)" name="categoryId" required
                          class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary bg-white">
                    @for (cat of categories(); track cat.categoryId) {
                      <option [value]="cat.categoryId">{{ language.isEnglish() ? (cat.nameEn || cat.nameAr) : cat.nameAr }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('السعر الأساسي (درهم) *', 'Base price (AED) *') }}</label>
                  <input type="number" [(ngModel)]="formProduct.basePrice" name="basePrice" min="0" step="0.5" required
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block font-bold text-gray-700">{{ language.t('سعر الخصم (درهم)', 'Discount price (AED)') }}</label>
                    @if (formDiscountPercent() > 0) {
                      <span class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.2 rounded-full">
                        {{ language.t('خصم', 'Save') }} {{ formDiscountPercent() }}%
                      </span>
                    }
                  </div>
                  <input type="number" [(ngModel)]="formProduct.discountPrice" name="discountPrice" min="0" step="0.5" [placeholder]="language.t('اختياري', 'Optional')"
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
                </div>
              </div>

              <!-- Quick Discount Presets for Form -->
              <div class="flex items-center gap-2 text-xs pt-1">
                <span class="text-gray-400 font-bold">{{ language.t('تحديد خصم سريع:', 'Quick discount:') }}</span>
                @for (pct of [10, 15, 20, 25, 30]; track pct) {
                  <button
                    type="button"
                    (click)="applyFormDiscountPercent(pct)"
                    class="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-orange-100 hover:text-primary font-bold transition-colors cursor-pointer">
                    {{ pct }}%
                  </button>
                }
                @if (formProduct.discountPrice) {
                  <button
                    type="button"
                    (click)="formProduct.discountPrice = undefined"
                    class="text-red-500 hover:underline mr-auto font-bold text-[11px] cursor-pointer">
                    {{ language.t('إلغاء الخصم', 'Remove discount') }}
                  </button>
                }
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-2">{{ language.t('صورة المنتج', 'Product image') }}</label>
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  @if (formProduct.imageUrl) {
                    <img [src]="imagePreviewUrl(formProduct.imageUrl)" [alt]="language.t('معاينة صورة المنتج', 'Product image preview')" class="w-24 h-24 rounded-2xl object-cover border border-gray-200 bg-orange-50">
                  }
                  <div class="space-y-2">
                    <label class="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition-colors">
                      <span>{{ language.t('اختيار صورة ورفعها', 'Choose and upload image') }}</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="onImageSelected($event)" class="sr-only">
                    </label>
                    @if (isUploadingImage()) { <span class="text-xs text-gray-500">{{ language.t('جارٍ رفع الصورة إلى الخادم...', 'Uploading image...') }}</span> }
                    <p class="text-[11px] text-gray-400">{{ language.t('JPG, PNG, WEBP أو GIF، حتى 10MB.', 'JPG, PNG, WEBP, or GIF, up to 10MB.') }}</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('الوصف بالعربية', 'Arabic description') }}</label>
                  <textarea [(ngModel)]="formProduct.descriptionAr" name="descriptionAr" rows="2"
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"></textarea>
                </div>
                <div>
                  <label class="block font-bold text-gray-700 mb-1">{{ language.t('الوصف بالإنجليزية', 'English description') }}</label>
                  <textarea [(ngModel)]="formProduct.descriptionEn" name="descriptionEn" rows="2"
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right"></textarea>
                </div>
              </div>

              <section class="rounded-2xl border border-orange-100 bg-orange-50/50 p-4 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2"><div><h3 class="font-bold text-gray-800">{{ language.t('الإضافات من المكتبة', 'Shared extras') }}</h3><p class="text-[10px] text-gray-500">{{ language.t('اختَر الإضافات المشتركة التي تناسب هذا الصنف، أو أضف خيارًا خاصًا به بالأسفل.', 'Choose shared extras for this product, or add a custom option below.') }}</p></div><a routerLink="/admin/addons" class="rounded-xl border border-orange-200 bg-white px-3 py-2 text-[11px] font-bold text-orange-700 hover:bg-orange-100">{{ language.t('إدارة المنتجات الإضافية', 'Manage extras') }}</a></div>
                @if (loadingCatalogAddons()) { <p class="rounded-xl bg-white p-3 text-xs text-gray-500">{{ language.t('جارٍ تحميل إضافات القسم...', 'Loading shared extras...') }}</p> }
                @else if (applicableAddonTemplates().length) {
                  <div class="grid gap-2 sm:grid-cols-2">
                    @for (template of applicableAddonTemplates(); track template.addonTemplateId) {
                      <label class="flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 transition hover:border-orange-300" [class.border-orange-400]="isCatalogAddonSelected(template.addonTemplateId)" [class.ring-2]="isCatalogAddonSelected(template.addonTemplateId)" [class.ring-orange-100]="isCatalogAddonSelected(template.addonTemplateId)">
                        <input type="checkbox" [checked]="isCatalogAddonSelected(template.addonTemplateId)" (change)="toggleCatalogAddon(template.addonTemplateId, $event)" class="h-4 w-4 accent-orange-600">
                        <span class="min-w-0 flex-1"><span class="block truncate text-xs font-bold text-gray-800">{{ language.isEnglish() ? (template.nameEn || template.nameAr) : template.nameAr }}</span></span><span class="text-xs font-black text-orange-700">{{template.price}} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
                      </label>
                    }
                  </div>
                } @else { <p class="rounded-xl bg-white p-3 text-xs text-gray-500">{{ language.t('لا توجد إضافات مشتركة لهذا الصنف. يمكنك إنشاؤها من صفحة المنتجات الإضافية.', 'No shared extras for this product. Create them on the Product Extras page.') }}</p> }
                <div class="flex items-center justify-between border-t border-orange-100 pt-3"><div><h3 class="font-bold text-gray-800">{{ language.t('إضافة خاصة بهذا الصنف', 'Product-specific extra') }}</h3><p class="text-[10px] text-gray-500">{{ language.t('خيار إضافي غير موجود في المكتبة المشتركة.', 'An extra not in the shared library.') }}</p></div><button type="button" (click)="addAddon()" class="rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-white">{{ language.t('+ إضافة خيار خاص', '+ Add custom option') }}</button></div>
                @for (addon of formProduct.addons || []; track $index; let i = $index) {
                  <div class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_auto] gap-2 items-center rounded-xl bg-white p-3">
                    <input [(ngModel)]="addon.nameAr" [name]="'addonAr' + i" [placeholder]="language.t('اسم الإضافة بالعربية', 'Extra name in Arabic')" class="rounded-lg border border-gray-200 px-3 py-2">
                    <input [(ngModel)]="addon.nameEn" [name]="'addonEn' + i" [placeholder]="language.t('اسم الإضافة بالإنجليزية', 'Addon name in English')" class="rounded-lg border border-gray-200 px-3 py-2 dir-ltr text-right">
                    <input type="number" [(ngModel)]="addon.price" [name]="'addonPrice' + i" min="0" step="0.5" [placeholder]="language.t('السعر', 'Price')" class="rounded-lg border border-gray-200 px-3 py-2">
                    <button type="button" (click)="removeAddon(i)" class="rounded-lg px-3 py-2 text-red-600 hover:bg-red-50">{{ language.t('حذف', 'Delete') }}</button>
                  </div>
                }
              </section>

              <div class="flex items-center gap-6 pt-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formProduct.isAvailable" name="isAvailable" class="rounded text-primary focus:ring-primary w-4 h-4">
                  <span class="font-bold text-gray-700">{{ language.t('متوفر للطلب المباشر', 'Available to order') }}</span>
                </label>

                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formProduct.isFeatured" name="isFeatured" class="rounded text-primary focus:ring-primary w-4 h-4">
                  <span class="font-bold text-gray-700">{{ language.t('صنف مميز ⭐', 'Featured product ⭐') }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formProduct.isManuallyBestSelling" name="isManuallyBestSelling" class="rounded text-rose-600 focus:ring-rose-500 w-4 h-4">
                  <span class="font-bold text-gray-700">{{ language.t('اختيار ضمن الأكثر مبيعًا ♥', 'Pin as best seller ♥') }}</span>
                </label>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" (click)="closeModal()" class="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer">
                  {{ language.t('إلغاء', 'Cancel') }}
                </button>
                <button type="submit" [disabled]="isSaving()" class="px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer">
                  @if (isSaving()) {
                    <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  }
                  <span>{{ isEditing() ? language.t('حفظ التعديلات', 'Save changes') : language.t('إضافة الصنف', 'Add product') }}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      }

    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  language = inject(LanguageService);
  auth = inject(AuthService);
  private api = inject(ApiService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  applicableAddonTemplates = signal<AddonTemplate[]>([]);
  loadingCatalogAddons = signal(false);

  selectedCategory = signal<number | null>(null);
  onlyDiscounted = signal<boolean>(false);
  searchQuery = signal<string>('');
  pageSize = signal(10);
  page = signal(1);
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize())));
  currentPage = computed(() => Math.min(this.page(), this.totalPages()));
  pageStart = computed(() => this.filteredProducts().length ? (this.currentPage() - 1) * this.pageSize() + 1 : 0);
  pageEnd = computed(() => Math.min(this.currentPage() * this.pageSize(), this.filteredProducts().length));
  pagedProducts = computed(() => { const start = (this.currentPage() - 1) * this.pageSize(); return this.filteredProducts().slice(start, start + this.pageSize()); });
  isUpdatingId = signal<number | null>(null);

  feedbackMessage = signal<string>('');
  feedbackType = signal<'success' | 'error'>('success');

  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isUploadingImage = signal<boolean>(false);
  editingProductId = signal<number | null>(null);

  // Quick discount modal state
  showDiscountModal = signal<boolean>(false);
  targetDiscountProduct: Product | null = null;
  quickDiscountValue: number | null = null;
  isSavingDiscount = signal<boolean>(false);

  formProduct: ProductCreate = {
    categoryId: 1,
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    basePrice: 0,
    discountPrice: undefined,
    imageUrl: '',
    isAvailable: true,
    isFeatured: false,
    isManuallyBestSelling: false,
    variants: []
  };

  formDiscountPercent = computed(() => {
    if (!this.formProduct.discountPrice || this.formProduct.discountPrice <= 0 || !this.formProduct.basePrice || this.formProduct.discountPrice >= this.formProduct.basePrice) {
      return 0;
    }
    const diff = this.formProduct.basePrice - this.formProduct.discountPrice;
    return Math.round((diff / this.formProduct.basePrice) * 100);
  });

  filteredProducts = computed(() => {
    let list = this.products();
    const cat = this.selectedCategory();
    const q = this.searchQuery().trim().toLowerCase();

    if (cat !== null) {
      list = list.filter(p => p.categoryId === cat);
    }

    if (this.onlyDiscounted()) {
      list = list.filter(p => p.discountPrice != null && p.discountPrice > 0 && p.discountPrice < p.basePrice);
    }

    if (q) {
      list = list.filter(p =>
        p.nameAr.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q)
      );
    }

    return list;
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getAllAdminProducts().subscribe({
      next: (prods) => this.products.set(prods),
      error: () => this.showFeedback(this.language.t('تعذر تحميل المنتجات من الخادم.', 'Could not load products from the server.'), 'error')
    });

    this.api.getCategories().subscribe({
      next: (cats) => this.categories.set(cats)
    });
  }

  getCategoryName(id: number): string {
    const cat = this.categories().find(c => c.categoryId === id);
    return cat ? (this.language.isEnglish() ? (cat.nameEn || cat.nameAr) : cat.nameAr) : this.language.t('قسم', 'Category') + ` #${id}`;
  }

  getDiscountPercent(prod: Product): number {
    if (!prod.discountPrice || prod.discountPrice <= 0 || prod.discountPrice >= prod.basePrice) return 0;
    const diff = prod.basePrice - prod.discountPrice;
    return Math.round((diff / prod.basePrice) * 100);
  }

  setSelectedCategory(value: number | null) { this.selectedCategory.set(value); this.page.set(1); }
  setSearchQuery(value: string) { this.searchQuery.set(value); this.page.set(1); }
  setPageSize(value: number | string) { this.pageSize.set(Number(value) || 10); this.page.set(1); }
  goToPage(value: number) { this.page.set(Math.max(1, Math.min(value, this.totalPages()))); }

  toggleDiscountFilter() {
    this.onlyDiscounted.update(v => !v);
    this.page.set(1);
  }

  openQuickDiscountModal(prod: Product) {
    this.targetDiscountProduct = prod;
    this.quickDiscountValue = prod.discountPrice ?? null;
    this.showDiscountModal.set(true);
  }

  closeDiscountModal() {
    this.showDiscountModal.set(false);
    this.targetDiscountProduct = null;
    this.quickDiscountValue = null;
  }

  applyQuickPercentToTarget(pct: number) {
    if (!this.targetDiscountProduct) return;
    const factor = (100 - pct) / 100;
    this.quickDiscountValue = Math.round(this.targetDiscountProduct.basePrice * factor * 10) / 10;
  }

  calculateTargetPercent(): number {
    if (!this.targetDiscountProduct || !this.quickDiscountValue) return 0;
    const diff = this.targetDiscountProduct.basePrice - this.quickDiscountValue;
    return Math.round((diff / this.targetDiscountProduct.basePrice) * 100);
  }

  saveQuickDiscount() {
    if (!this.targetDiscountProduct) return;
    if (this.quickDiscountValue !== null && (this.quickDiscountValue <= 0 || this.quickDiscountValue >= this.targetDiscountProduct.basePrice)) {
      this.notifications.show(this.language.t('سعر الخصم يجب أن يكون أكبر من صفر وأقل من السعر الأساسي.', 'Discount price must be greater than zero and lower than the base price.'), 'error');
      return;
    }

    this.isSavingDiscount.set(true);
    const prodId = this.targetDiscountProduct.productId;
    const discountPrice = this.quickDiscountValue;

    this.api.updateProductDiscount(prodId, discountPrice).subscribe({
      next: (res) => {
        this.isSavingDiscount.set(false);
        this.products.update(list => list.map(p => p.productId === prodId ? { ...p, discountPrice: res.discountPrice ?? undefined } : p));
        this.showFeedback(this.language.t(`تم تحديث الخصم للصنف بنجاح (${discountPrice ? discountPrice + ' درهم' : 'بدون خصم'}).`, `Discount updated (${discountPrice ? discountPrice + ' AED' : 'no discount'}).`), 'success');
        this.closeDiscountModal();
      },
      error: () => {
        this.isSavingDiscount.set(false);
        this.showFeedback(this.language.t('فشل حفظ الخصم على الخادم.', 'Could not save the discount.'), 'error');
      }
    });
  }

  removeTargetDiscount() {
    if (!this.targetDiscountProduct) return;
    this.isSavingDiscount.set(true);
    const prodId = this.targetDiscountProduct.productId;

    this.api.updateProductDiscount(prodId, null).subscribe({
      next: () => {
        this.isSavingDiscount.set(false);
        this.products.update(list => list.map(p => p.productId === prodId ? { ...p, discountPrice: undefined } : p));
        this.showFeedback(this.language.t('تمت إزالة الخصم عن الصنف.', 'Discount removed.'), 'success');
        this.closeDiscountModal();
      },
      error: () => {
        this.isSavingDiscount.set(false);
        this.showFeedback(this.language.t('فشل تحديث الخصم.', 'Could not update the discount.'), 'error');
      }
    });
  }

  applyFormDiscountPercent(pct: number) {
    if (!this.formProduct.basePrice || this.formProduct.basePrice <= 0) return;
    const factor = (100 - pct) / 100;
    this.formProduct.discountPrice = Math.round(this.formProduct.basePrice * factor * 10) / 10;
  }

  toggleFeatured(prod: Product) {
    this.isUpdatingId.set(prod.productId);
    this.api.toggleProductFeatured(prod.productId).subscribe({
      next: (res) => {
        prod.isFeatured = res.isFeatured;
        this.isUpdatingId.set(null);
        this.feedbackType.set('success');
        this.feedbackMessage.set(
          res.isFeatured
            ? `تم تمييز الصنف "${prod.nameAr}" ⭐`
            : `تم إلغاء تمييز الصنف "${prod.nameAr}".`
        );
      },
      error: () => {
        this.isUpdatingId.set(null);
        this.feedbackType.set('error');
        this.feedbackMessage.set(this.language.t('فشل تحديث حالة الصنف المميز.', 'Could not update the featured product status.'));
      }
    });
  }

  toggleBestSelling(prod: Product) {
    this.isUpdatingId.set(prod.productId);
    this.api.toggleProductBestSelling(prod.productId).subscribe({
      next: result => {
        this.products.update(rows => rows.map(row => row.productId === prod.productId ? { ...row, isManuallyBestSelling: result.isManuallyBestSelling } : row));
        this.isUpdatingId.set(null);
        this.showFeedback(this.language.isEnglish() ? (result.isManuallyBestSelling ? `${prod.nameEn || prod.nameAr} marked as a best seller.` : `${prod.nameEn || prod.nameAr} removed from manual best sellers.`) : (result.isManuallyBestSelling ? `تم اختيار ${prod.nameAr} ضمن الأكثر مبيعًا.` : `تم إلغاء الاختيار اليدوي لـ ${prod.nameAr}.`), 'success');
      },
      error: () => { this.isUpdatingId.set(null); this.showFeedback(this.language.t('تعذر تحديث قائمة الأكثر مبيعًا.', 'Could not update the best sellers list.'), 'error'); }
    });
  }

  toggleAvailability(prod: Product) {
    this.isUpdatingId.set(prod.productId);
    this.api.toggleProductAvailability(prod.productId).subscribe({
      next: (res) => {
        this.isUpdatingId.set(null);
        const updated = this.products().map(p => p.productId === prod.productId ? { ...p, isAvailable: res.isAvailable } : p);
        this.products.set(updated);
        this.showFeedback(this.language.t(`تم تحديث توفر الصنف (${prod.nameAr}) بنجاح.`, `Availability updated for ${prod.nameEn || prod.nameAr}.`), 'success');
      },
      error: () => {
        this.isUpdatingId.set(null);
        this.showFeedback(this.language.t('فشل تحديث حالة الصنف.', 'Could not update the product status.'), 'error');
      }
    });
  }

  async deleteProduct(prod: Product) {
    if (!(await this.notifications.confirm(this.language.t(`هل أنت متأكد من حذف الصنف "${prod.nameAr}" نهائياً من المنيو؟`, `Permanently delete "${prod.nameEn || prod.nameAr}" from the menu?`)))) return;

    this.api.deleteProduct(prod.productId).subscribe({
      next: () => {
        this.products.set(this.products().filter(p => p.productId !== prod.productId));
        this.showFeedback(this.language.t(`تم حذف الصنف (${prod.nameAr}) بنجاح.`, `Product ${prod.nameEn || prod.nameAr} deleted.`), 'success');
      },
      error: () => this.showFeedback(this.language.t('تعذر حذف الصنف من الخادم.', 'Could not delete the product from the server.'), 'error')
    });
  }

  onProductCategoryChange(categoryId: number) {
    this.formProduct.categoryId = Number(categoryId);
    this.loadApplicableCatalogAddons(this.isEditing() ? this.editingProductId() || undefined : undefined);
  }

  loadApplicableCatalogAddons(productId?: number) {
    const categoryId = Number(this.formProduct.categoryId);
    if (!categoryId) { this.applicableAddonTemplates.set([]); return; }
    this.loadingCatalogAddons.set(true);
    this.api.getApplicableAddonTemplates(categoryId, productId).subscribe({
      next: templates => {
        this.applicableAddonTemplates.set(templates);
        const selected = new Set(this.formProduct.catalogAddonIds || []);
        if (!this.isEditing()) templates.forEach(template => selected.add(template.addonTemplateId));
        this.formProduct.catalogAddonIds = [...selected].filter(id => templates.some(template => template.addonTemplateId === id));
        this.loadingCatalogAddons.set(false);
      },
      error: () => { this.applicableAddonTemplates.set([]); this.loadingCatalogAddons.set(false); }
    });
  }

  isCatalogAddonSelected(id: number) { return (this.formProduct.catalogAddonIds || []).includes(id); }
  toggleCatalogAddon(id: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const selected = new Set(this.formProduct.catalogAddonIds || []);
    checked ? selected.add(id) : selected.delete(id);
    this.formProduct.catalogAddonIds = [...selected];
  }

  addAddon() {
    this.formProduct.addons = [...(this.formProduct.addons || []), { nameAr: '', nameEn: '', price: 0 }];
  }

  removeAddon(index: number) {
    this.formProduct.addons = (this.formProduct.addons || []).filter((_, i) => i !== index);
  }

  openAddModal() {
    this.isEditing.set(false);
    this.editingProductId.set(null);
    this.formProduct = {
      categoryId: this.categories().length ? this.categories()[0].categoryId : 1,
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      basePrice: 0,
      discountPrice: undefined,
      imageUrl: '',
      isAvailable: true,
      isFeatured: false,
      isManuallyBestSelling: false,
      variants: [],
      addons: [],
      catalogAddonIds: []
    };
    this.showModal.set(true);
    this.loadApplicableCatalogAddons();
  }

  openEditModal(prod: Product) {
    this.isEditing.set(true);
    this.editingProductId.set(prod.productId);
    this.formProduct = {
      categoryId: prod.categoryId,
      nameAr: prod.nameAr,
      nameEn: prod.nameEn,
      descriptionAr: prod.descriptionAr || '',
      descriptionEn: prod.descriptionEn || '',
      basePrice: prod.basePrice,
      discountPrice: prod.discountPrice,
      imageUrl: prod.imageUrl || '',
      isAvailable: prod.isAvailable,
      isFeatured: prod.isFeatured,
      isManuallyBestSelling: prod.isManuallyBestSelling ?? false,
      variants: prod.variants ? [...prod.variants] : [],
      addons: (prod.addons || []).filter(addon => !addon.catalogTemplateId).map(addon => ({ ...addon })),
      catalogAddonIds: (prod.addons || []).filter(addon => addon.catalogTemplateId).map(addon => addon.catalogTemplateId!)
    };
    this.showModal.set(true);
    this.loadApplicableCatalogAddons(prod.productId);
  }

  closeModal() {
    this.showModal.set(false);
  }

  imageUrl(url?: string): string {
    if (!url) return 'assets/MAIN.jpg';
    if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }

  imagePreviewUrl(url: string): string {
    if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      this.showFeedback(this.language.t('حجم الصورة أكبر من 10 ميجابايت.', 'Image exceeds 10 MB.'), 'error');
      input.value = '';
      return;
    }
    this.isUploadingImage.set(true);
    this.api.uploadImage(file, 'products').subscribe({
      next: result => {
        this.formProduct.imageUrl = result.url;
        this.isUploadingImage.set(false);
        this.showFeedback(this.language.t('تم رفع الصورة وحفظ مسارها بنجاح.', 'Image uploaded and saved.'), 'success');
      },
      error: () => {
        this.isUploadingImage.set(false);
        this.showFeedback(this.language.t('تعذر رفع الصورة. تأكد من تشغيل الباك إند وتسجيل الدخول.', 'Could not upload image. Check the backend and your admin sign-in.'), 'error');
      }
    });
    input.value = '';
  }

  saveProduct() {
    if (this.isUploadingImage()) {
      this.showFeedback(this.language.t('انتظر حتى ينتهي رفع الصورة.', 'Wait for the image upload to finish.'), 'error');
      return;
    }
    if (!this.formProduct.nameAr || !this.formProduct.nameEn || this.formProduct.basePrice <= 0) {
      this.notifications.show(this.language.t('يرجى ملء جميع الحقول المطلوبة والتأكد من صحة السعر.', 'Complete all required fields and check the price.'), 'error');
      return;
    }
    if ((this.formProduct.addons || []).some(a => !a.nameAr.trim() || !a.nameEn.trim() || a.price < 0)) {
      this.notifications.show(this.language.t('أكمل اسم كل إضافة بالعربية والإنجليزية وسعرًا صالحًا.', 'Enter Arabic and English names and a valid price for each extra.'), 'error');
      return;
    }
    if (this.formProduct.discountPrice && (this.formProduct.discountPrice <= 0 || this.formProduct.discountPrice >= this.formProduct.basePrice)) {
      this.notifications.show(this.language.t('سعر الخصم يجب أن يكون أكبر من صفر وأقل من السعر الأساسي.', 'Discount price must be greater than zero and lower than the base price.'), 'error');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditing() && this.editingProductId()) {
      this.api.updateProduct(this.editingProductId()!, this.formProduct).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.closeModal();
          this.showFeedback(this.language.t('تم تحديث بيانات الصنف بنجاح.', 'Product updated successfully.'), 'success');
          this.loadData();
        },
        error: () => {
          this.isSaving.set(false);
          this.showFeedback(this.language.t('حدث خطأ أثناء تحديث بيانات الصنف.', 'Could not update the product.'), 'error');
        }
      });
    } else {
      this.api.createProduct(this.formProduct).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.closeModal();
          this.showFeedback(this.language.t('تمت إضافة الصنف الجديد بنجاح.', 'Product added successfully.'), 'success');
          this.loadData();
        },
        error: () => {
          this.isSaving.set(false);
          this.showFeedback(this.language.t('حدث خطأ أثناء إضافة الصنف.', 'Could not add the product.'), 'error');
        }
      });
    }
  }

  private notifications = inject(NotificationService);
  private showFeedback(msg: string, type: 'success' | 'error') {
    this.notifications.show(msg, type);
    this.feedbackMessage.set(msg);
    this.feedbackType.set(type);
    setTimeout(() => {
      if (this.feedbackMessage() === msg) this.feedbackMessage.set('');
    }, 4000);
  }
}
