import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Product, Category, ProductCreate, ProductVariant } from '../../../../core/models/models';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex font-cairo" dir="rtl">
      
      <!-- Shared Sidebar -->
      <app-admin-sidebar />

      <!-- Main Content -->
      <main class="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        
        <!-- Header -->
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-black font-baloo text-gray-800">إدارة أصناف ومنتجات المنيو</h1>
            <p class="text-xs text-gray-400">إضافة وتعديل وحذف الأصناف والتحكم في الخصومات والعروض والأسعار وتوفر المنتجات</p>
          </div>
          <button 
            (click)="openAddModal()"
            class="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primaryHover text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto cursor-pointer">
            <span>+</span>
            <span>إضافة صنف جديد</span>
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
            <span class="text-xs font-bold text-gray-500">التصنيف:</span>
            <select 
              [ngModel]="selectedCategory()" 
              (ngModelChange)="selectedCategory.set($event)"
              class="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary">
              <option [ngValue]="null">كافة التصنيفات ({{ products().length }})</option>
              @for (cat of categories(); track cat.categoryId) {
                <option [ngValue]="cat.categoryId">{{ cat.nameAr }} ({{ cat.nameEn }})</option>
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
              🏷️ الأصناف المخفضة فقط
            </button>
          </div>

          <div class="w-full md:w-72">
            <input 
              type="text" 
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="ابحث بالاسم العربي أو الإنجليزي..."
              class="w-full text-xs px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
          </div>
        </div>

        <!-- Products Table -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-right text-xs">
              <thead class="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th class="p-4">الصنف</th>
                  <th class="p-4">القسم</th>
                  <th class="p-4">السعر الأساسي</th>
                  <th class="p-4">الخصم والعرض</th>
                  <th class="p-4">التوفر</th>
                  <th class="p-4">مميز</th>
                  <th class="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (prod of filteredProducts(); track prod.productId) {
                  <tr class="hover:bg-gray-50/50 transition-colors">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <img [src]="prod.imageUrl || 'assets/MAIN.jpg'" class="w-12 h-12 rounded-2xl object-cover border border-gray-100 shrink-0">
                        <div>
                          <div class="font-bold text-gray-800 text-xs">{{ prod.nameAr }}</div>
                          <div class="text-[11px] text-gray-400">{{ prod.nameEn }}</div>
                          @if (prod.variants && prod.variants.length) {
                            <span class="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-1">
                              {{ prod.variants.length }} أحجام / خيارات
                            </span>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="p-4 font-medium text-gray-600">
                      {{ getCategoryName(prod.categoryId) }}
                    </td>
                    <td class="p-4 font-black text-gray-900">{{ prod.basePrice }} درهم</td>
                    
                    <!-- Discount Cell with Quick Action -->
                    <td class="p-4">
                      @if (prod.discountPrice && prod.discountPrice > 0 && prod.discountPrice < prod.basePrice) {
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-green-600 font-black text-xs">{{ prod.discountPrice }} درهم</span>
                          <span class="bg-primary/10 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            خصم {{ getDiscountPercent(prod) }}%
                          </span>
                          <button 
                            type="button"
                            (click)="openQuickDiscountModal(prod)"
                            class="text-xs text-blue-600 hover:text-blue-800 font-bold p-1 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="تعديل الخصم">
                            ✏️ تعديل
                          </button>
                        </div>
                      } @else {
                        <button 
                          type="button"
                          (click)="openQuickDiscountModal(prod)"
                          class="px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold text-[11px] transition-colors cursor-pointer border border-orange-200">
                          + إضافة خصم
                        </button>
                      }
                    </td>

                    <td class="p-4">
                      <button 
                        (click)="toggleAvailability(prod)"
                        [disabled]="isUpdatingId() === prod.productId"
                        [class]="prod.isAvailable ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'"
                        class="text-[11px] px-3 py-1 rounded-full font-bold transition-colors cursor-pointer">
                        {{ prod.isAvailable ? '✓ متوفر' : '✕ غير متوفر' }}
                      </button>
                    </td>
                    <td class="p-4">
                      <button 
                        (click)="toggleFeatured(prod)"
                        [disabled]="isUpdatingId() === prod.productId"
                        [class]="prod.isFeatured ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200'"
                        class="text-[11px] px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="تبديل حالة الصنف المميز">
                        <span>{{ prod.isFeatured ? '⭐ مميز' : '☆ عادي' }}</span>
                      </button>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center justify-center gap-2">
                        <button 
                          (click)="openEditModal(prod)"
                          class="px-3 py-1 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold transition-colors cursor-pointer">
                          تعديل
                        </button>
                        <button 
                          (click)="deleteProduct(prod)"
                          class="px-3 py-1 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-colors cursor-pointer">
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="p-10 text-center text-gray-400 text-xs">
                      لا توجد أصناف تطابق معايير البحث
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <!-- Quick Discount Modal -->
      @if (showDiscountModal() && targetDiscountProduct) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-gray-100 shadow-2xl animate-fadeIn">
            <div class="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 class="text-base font-bold font-baloo text-gray-800">إدارة خصم الصنف</h3>
                <p class="text-xs text-primary font-bold mt-0.5">{{ targetDiscountProduct.nameAr }}</p>
              </div>
              <button (click)="closeDiscountModal()" class="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs font-bold cursor-pointer">✕</button>
            </div>

            <div class="bg-orange-50/50 p-3 rounded-2xl border border-orange-100 text-xs flex justify-between items-center">
              <span class="text-gray-600 font-medium">السعر الأساسي الحالي:</span>
              <span class="text-gray-900 font-black text-sm">{{ targetDiscountProduct.basePrice }} درهم</span>
            </div>

            <div class="space-y-2">
              <label class="block font-bold text-gray-700 text-xs">سعر الخصم المطلوب (درهم):</label>
              <div class="flex items-center gap-2">
                <input 
                  type="number" 
                  [(ngModel)]="quickDiscountValue" 
                  min="0" 
                  [max]="targetDiscountProduct.basePrice - 0.5" 
                  step="0.5"
                  placeholder="مثال: 120"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:border-primary">
                <span class="text-xs text-gray-500 font-bold shrink-0">درهم</span>
              </div>
            </div>

            <!-- Quick Percentage Pills -->
            <div class="space-y-1.5">
              <span class="text-[11px] text-gray-400 font-bold">نسب خصم جاهزة:</span>
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
                <span>نسبة الخصم المحسوبة:</span>
                <span class="text-sm font-black">{{ calculateTargetPercent() }}%</span>
              </div>
            }

            <div class="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
              <button 
                type="button" 
                (click)="removeTargetDiscount()" 
                class="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer">
                إزالة الخصم
              </button>
              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  (click)="closeDiscountModal()" 
                  class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer">
                  إلغاء
                </button>
                <button 
                  type="button" 
                  (click)="saveQuickDiscount()" 
                  [disabled]="isSavingDiscount()"
                  class="px-5 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold transition-all shadow-md cursor-pointer">
                  حفظ الخصم
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
                {{ isEditing() ? 'تعديل صنف: ' + formProduct.nameAr : 'إضافة صنف جديد للمنيو' }}
              </h2>
              <button (click)="closeModal()" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form (ngSubmit)="saveProduct()" class="space-y-4 text-xs">
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">الاسم بالعربية *</label>
                  <input type="text" [(ngModel)]="formProduct.nameAr" name="nameAr" required placeholder="مثال: فطيرة مشلتت بالسمن البلدي"
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
                </div>

                <div>
                  <label class="block font-bold text-gray-700 mb-1">الاسم بالإنجليزية *</label>
                  <input type="text" [(ngModel)]="formProduct.nameEn" name="nameEn" required placeholder="e.g., Feteer Meshaltet"
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">التصنيف *</label>
                  <select [(ngModel)]="formProduct.categoryId" name="categoryId" required
                          class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary bg-white">
                    @for (cat of categories(); track cat.categoryId) {
                      <option [value]="cat.categoryId">{{ cat.nameAr }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block font-bold text-gray-700 mb-1">السعر الأساسي (درهم) *</label>
                  <input type="number" [(ngModel)]="formProduct.basePrice" name="basePrice" min="0" step="0.5" required
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block font-bold text-gray-700">سعر الخصم (درهم)</label>
                    @if (formDiscountPercent() > 0) {
                      <span class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.2 rounded-full">
                        خصم {{ formDiscountPercent() }}%
                      </span>
                    }
                  </div>
                  <input type="number" [(ngModel)]="formProduct.discountPrice" name="discountPrice" min="0" step="0.5" placeholder="اختياري"
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
                </div>
              </div>

              <!-- Quick Discount Presets for Form -->
              <div class="flex items-center gap-2 text-xs pt-1">
                <span class="text-gray-400 font-bold">تحديد خصم سريع:</span>
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
                    إلغاء الخصم
                  </button>
                }
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-2">صورة المنتج</label>
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  @if (formProduct.imageUrl) {
                    <img [src]="imagePreviewUrl(formProduct.imageUrl)" alt="معاينة صورة المنتج" class="w-24 h-24 rounded-2xl object-cover border border-gray-200 bg-orange-50">
                  }
                  <div class="space-y-2">
                    <label class="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition-colors">
                      <span>اختيار صورة ورفعها</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="onImageSelected($event)" class="sr-only">
                    </label>
                    @if (isUploadingImage()) { <span class="text-xs text-gray-500">جارٍ رفع الصورة إلى الخادم...</span> }
                    <p class="text-[11px] text-gray-400">JPG, PNG, WEBP أو GIF، حتى 10MB.</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">الوصف بالعربية</label>
                  <textarea [(ngModel)]="formProduct.descriptionAr" name="descriptionAr" rows="2"
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary"></textarea>
                </div>
                <div>
                  <label class="block font-bold text-gray-700 mb-1">الوصف بالإنجليزية</label>
                  <textarea [(ngModel)]="formProduct.descriptionEn" name="descriptionEn" rows="2"
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right"></textarea>
                </div>
              </div>

              <div class="flex items-center gap-6 pt-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formProduct.isAvailable" name="isAvailable" class="rounded text-primary focus:ring-primary w-4 h-4">
                  <span class="font-bold text-gray-700">متوفر للطلب المباشر</span>
                </label>

                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formProduct.isFeatured" name="isFeatured" class="rounded text-primary focus:ring-primary w-4 h-4">
                  <span class="font-bold text-gray-700">صنف مميز ⭐</span>
                </label>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" (click)="closeModal()" class="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" [disabled]="isSaving()" class="px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer">
                  @if (isSaving()) {
                    <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  }
                  <span>{{ isEditing() ? 'حفظ التعديلات' : 'إضافة الصنف' }}</span>
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
  private api = inject(ApiService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  selectedCategory = signal<number | null>(null);
  onlyDiscounted = signal<boolean>(false);
  searchQuery = signal<string>('');
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
      error: () => this.showFeedback('تعذر تحميل المنتجات من الخادم.', 'error')
    });

    this.api.getCategories().subscribe({
      next: (cats) => this.categories.set(cats)
    });
  }

  getCategoryName(id: number): string {
    const cat = this.categories().find(c => c.categoryId === id);
    return cat ? cat.nameAr : `قسم #${id}`;
  }

  getDiscountPercent(prod: Product): number {
    if (!prod.discountPrice || prod.discountPrice <= 0 || prod.discountPrice >= prod.basePrice) return 0;
    const diff = prod.basePrice - prod.discountPrice;
    return Math.round((diff / prod.basePrice) * 100);
  }

  toggleDiscountFilter() {
    this.onlyDiscounted.update(v => !v);
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
      alert('سعر الخصم يجب أن يكون أكبر من صفر وأقل من السعر الأساسي.');
      return;
    }

    this.isSavingDiscount.set(true);
    const prodId = this.targetDiscountProduct.productId;
    const discountPrice = this.quickDiscountValue;

    this.api.updateProductDiscount(prodId, discountPrice).subscribe({
      next: (res) => {
        this.isSavingDiscount.set(false);
        this.products.update(list => list.map(p => p.productId === prodId ? { ...p, discountPrice: res.discountPrice ?? undefined } : p));
        this.showFeedback(`تم تحديث الخصم للصنف بنجاح (${discountPrice ? discountPrice + ' درهم' : 'بدون خصم'}).`, 'success');
        this.closeDiscountModal();
      },
      error: () => {
        this.isSavingDiscount.set(false);
        this.showFeedback('فشل حفظ الخصم على الخادم.', 'error');
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
        this.showFeedback('تمت إزالة الخصم عن الصنف.', 'success');
        this.closeDiscountModal();
      },
      error: () => {
        this.isSavingDiscount.set(false);
        this.showFeedback('فشل تحديث الخصم.', 'error');
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
        this.feedbackMessage.set('فشل تحديث حالة الصنف المميز.');
      }
    });
  }

  toggleAvailability(prod: Product) {
    this.isUpdatingId.set(prod.productId);
    this.api.toggleProductAvailability(prod.productId).subscribe({
      next: (res) => {
        this.isUpdatingId.set(null);
        const updated = this.products().map(p => p.productId === prod.productId ? { ...p, isAvailable: res.isAvailable } : p);
        this.products.set(updated);
        this.showFeedback(`تم تحديث توفر الصنف (${prod.nameAr}) بنجاح.`, 'success');
      },
      error: () => {
        this.isUpdatingId.set(null);
        this.showFeedback('فشل تحديث حالة الصنف.', 'error');
      }
    });
  }

  deleteProduct(prod: Product) {
    if (!confirm(`هل أنت متأكد من حذف الصنف "${prod.nameAr}" نهائياً من المنيو؟`)) return;

    this.api.deleteProduct(prod.productId).subscribe({
      next: () => {
        this.products.set(this.products().filter(p => p.productId !== prod.productId));
        this.showFeedback(`تم حذف الصنف (${prod.nameAr}) بنجاح.`, 'success');
      },
      error: () => this.showFeedback('تعذر حذف الصنف من الخادم.', 'error')
    });
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
      variants: []
    };
    this.showModal.set(true);
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
      variants: prod.variants ? [...prod.variants] : []
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
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
      this.showFeedback('حجم الصورة أكبر من 10 ميجابايت.', 'error');
      input.value = '';
      return;
    }
    this.isUploadingImage.set(true);
    this.api.uploadImage(file, 'products').subscribe({
      next: result => {
        this.formProduct.imageUrl = result.url;
        this.isUploadingImage.set(false);
        this.showFeedback('تم رفع الصورة وحفظ مسارها بنجاح.', 'success');
      },
      error: () => {
        this.isUploadingImage.set(false);
        this.showFeedback('تعذر رفع الصورة. تأكد من تشغيل الباك إند وتسجيل الدخول.', 'error');
      }
    });
    input.value = '';
  }

  saveProduct() {
    if (this.isUploadingImage()) {
      this.showFeedback('انتظر حتى ينتهي رفع الصورة.', 'error');
      return;
    }
    if (!this.formProduct.nameAr || !this.formProduct.nameEn || this.formProduct.basePrice <= 0) {
      alert('يرجى ملء جميع الحقول المطلوبة والتأكد من صحة السعر.');
      return;
    }
    if (this.formProduct.discountPrice && (this.formProduct.discountPrice <= 0 || this.formProduct.discountPrice >= this.formProduct.basePrice)) {
      alert('سعر الخصم يجب أن يكون أكبر من صفر وأقل من السعر الأساسي.');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditing() && this.editingProductId()) {
      this.api.updateProduct(this.editingProductId()!, this.formProduct).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.closeModal();
          this.showFeedback('تم تحديث بيانات الصنف بنجاح.', 'success');
          this.loadData();
        },
        error: () => {
          this.isSaving.set(false);
          this.showFeedback('حدث خطأ أثناء تحديث بيانات الصنف.', 'error');
        }
      });
    } else {
      this.api.createProduct(this.formProduct).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.closeModal();
          this.showFeedback('تمت إضافة الصنف الجديد بنجاح.', 'success');
          this.loadData();
        },
        error: () => {
          this.isSaving.set(false);
          this.showFeedback('حدث خطأ أثناء إضافة الصنف.', 'error');
        }
      });
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
