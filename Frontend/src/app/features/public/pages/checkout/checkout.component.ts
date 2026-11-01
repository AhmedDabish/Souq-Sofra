import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { LocationService } from '../../../../core/services/location.service';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      
      <!-- Back button and Page Title -->
      <div class="flex items-center gap-3 mb-8">
        <a routerLink="/" class="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-baloo text-primaryDark">إتمام الطلب والدفع</h1>
      </div>

      @if (orderSuccess()) {
        <!-- Order Success State -->
        <div class="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-primary/20 space-y-6">
          <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto">
            ✓
          </div>
          <h2 class="text-2xl font-bold font-baloo text-primaryDark">تم استلام طلبك بنجاح!</h2>
          <p class="text-sm text-gray-600 max-w-md mx-auto">
            شكراً لطلبك من مطعم ومخبز سوق وسفرة. رقم طلبك هو:
          </p>
          <div class="inline-block bg-primary/10 border border-primary/30 text-primaryDark font-mono font-black text-xl px-6 py-3 rounded-2xl">
            {{ orderNumber() }}
          </div>
          <p class="text-xs text-gray-500">
            سيقوم فريقنا بتجهيز وتوصيل طلبك في أقرب وقت. سنتواصل معك هاتفياً لتأكيد التفاصيل.
          </p>
          <div class="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <a routerLink="/" class="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primaryHover transition-colors">
              العودة للرئيسية
            </a>
            <a routerLink="/menu" class="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">
              تصفح المزيد من المنيو
            </a>
          </div>
        </div>
      } @else if (cart.items().length === 0) {
        <!-- Empty Cart Warning -->
        <div class="bg-white rounded-3xl p-12 text-center shadow-md space-y-4">
          <div class="text-4xl">🛒</div>
          <h3 class="text-xl font-bold text-gray-700">سلتك فارغة حالياً</h3>
          <p class="text-xs text-gray-500">يرجى إضافة أطباق ومنتجات من المنيو قبل التوجه لصفحة الدفع.</p>
          <a routerLink="/menu" class="inline-block px-6 py-3 bg-primary text-white font-bold text-sm rounded-2xl">
            تصفح المنيو
          </a>
        </div>
      } @else {
        <!-- Checkout Form Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Left/Main Form Column (7 cols) -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- Delivery Type Selector -->
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 class="font-bold text-base text-primaryDark flex items-center gap-2">
                <span>📍</span> نوع الاستلام
              </h3>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  (click)="deliveryType.set('delivery')"
                  [class]="deliveryType() === 'delivery' ? 'border-primary bg-primary/5 text-primaryDark font-bold' : 'border-gray-200 text-gray-600'"
                  class="p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all">
                  <span class="text-xl">🛵</span>
                  <span class="text-xs">توصيل للمنزل</span>
                </button>
                <button 
                  type="button"
                  (click)="deliveryType.set('pickup')"
                  [class]="deliveryType() === 'pickup' ? 'border-primary bg-primary/5 text-primaryDark font-bold' : 'border-gray-200 text-gray-600'"
                  class="p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all">
                  <span class="text-xl">🏪</span>
                  <span class="text-xs">استلام من الفرع (أبوظبي)</span>
                </button>
              </div>
            </div>

            <!-- Customer Details Form -->
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 class="font-bold text-base text-primaryDark flex items-center gap-2">
                <span>👤</span> بيانات العميل
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">الاسم الكامل *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="customerName"
                    placeholder="مثال: أحمد محمد"
                    class="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary text-sm">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">رقم الهاتف / الواتساب *</label>
                    <input 
                      type="tel" 
                      [(ngModel)]="customerPhone"
                      placeholder="050xxxxxxx"
                      class="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary text-sm dir-ltr text-right">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">البريد الإلكتروني (اختياري)</label>
                    <input 
                      type="email" 
                      [(ngModel)]="customerEmail"
                      placeholder="name@example.com"
                      class="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary text-sm dir-ltr text-right">
                  </div>
                </div>

                @if (deliveryType() === 'delivery') {
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">عنوان التوصيل التفصيلي *</label>
                    <textarea 
                      [(ngModel)]="deliveryAddress"
                      rows="2"
                      placeholder="المنطقة، الشارع، رقم البناية، رقم الشقة"
                      class="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary text-sm"></textarea>
                  </div>
                }

                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1">ملاحظات خاصة للطلب (اختياري)</label>
                  <input 
                    type="text" 
                    [(ngModel)]="notes"
                    placeholder="أي تعليمات إضافية بخصوص الخبز أو التوابل..."
                    class="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary text-sm">
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 class="font-bold text-base text-primaryDark flex items-center gap-2">
                <span>💳</span> طريقة الدفع
              </h3>
              <div class="space-y-2">
                <label 
                  [class]="paymentMethod() === 'CashOnDelivery' ? 'border-primary bg-primary/5' : 'border-gray-200'"
                  class="flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all">
                  <div class="flex items-center gap-3">
                    <input type="radio" name="payment" value="CashOnDelivery" [checked]="paymentMethod() === 'CashOnDelivery'" (change)="paymentMethod.set('CashOnDelivery')" class="text-primary focus:ring-primary">
                    <div>
                      <div class="font-bold text-xs text-gray-800">الدفع عند الاستلام (كاش)</div>
                      <div class="text-[11px] text-gray-500">ادفع نقداً عند استلام طلبك</div>
                    </div>
                  </div>
                  <span class="text-xl">💵</span>
                </label>

                <label 
                  [class]="paymentMethod() === 'CardOnDelivery' ? 'border-primary bg-primary/5' : 'border-gray-200'"
                  class="flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all">
                  <div class="flex items-center gap-3">
                    <input type="radio" name="payment" value="CardOnDelivery" [checked]="paymentMethod() === 'CardOnDelivery'" (change)="paymentMethod.set('CardOnDelivery')" class="text-primary focus:ring-primary">
                    <div>
                      <div class="font-bold text-xs text-gray-800">بطاقة عند الاستلام (POS)</div>
                      <div class="text-[11px] text-gray-500">سيوفر المندوب جهاز الدفع بالبطاقة</div>
                    </div>
                  </div>
                  <span class="text-xl">💳</span>
                </label>
              </div>
            </div>

          </div>

          <!-- Right Order Summary Column (5 cols) -->
          <div class="lg:col-span-5 space-y-6">
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4 sticky top-28">
              <h3 class="font-bold text-base text-primaryDark pb-3 border-b border-gray-100">
                ملخص الطلب ({{ cart.totalCount() }} أصناف)
              </h3>

              <!-- Items list -->
              <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
                @for (item of cart.items(); track item.product.productId + (item.selectedVariant?.variantId || 0)) {
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-primary">{{ item.quantity }}x</span>
                      <div>
                        <span class="font-medium text-gray-800">{{ item.product.nameAr }}</span>
                        @if (item.selectedVariant) {
                          <span class="text-gray-400 block text-[10px]">({{ item.selectedVariant.nameAr }})</span>
                        }
                      </div>
                    </div>
                    <span class="font-bold text-gray-700">{{ item.totalPrice }} درهم</span>
                  </div>
                }
              </div>

              <!-- Calculation lines -->
              <div class="pt-4 border-t border-gray-100 space-y-2 text-xs">
                <div class="flex justify-between text-gray-600">
                  <span>المجموع الفرعي:</span>
                  <span>{{ cart.subTotal() }} درهم</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>رسوم التوصيل:</span>
                  <span>{{ deliveryType() === 'delivery' ? cart.deliveryFee() : 0 }} درهم</span>
                </div>
                <div class="flex justify-between text-base font-black text-primaryDark pt-3 border-t border-gray-200">
                  <span>الإجمالي الكلي:</span>
                  <span>{{ deliveryType() === 'delivery' ? cart.totalAmount() : cart.subTotal() }} درهم</span>
                </div>
              </div>

              @if (errorMessage()) {
                <div class="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium">
                  {{ errorMessage() }}
                </div>
              }

              <!-- Submit Button -->
              <button 
                type="button"
                [disabled]="isSubmitting()"
                (click)="submitOrder()"
                class="w-full py-4 rounded-2xl bg-primary hover:bg-primaryHover text-white font-extrabold text-sm shadow-xl transition-all disabled:opacity-50 active:scale-95 cursor-pointer">
                @if (isSubmitting()) {
                  جاري تأكيد الطلب...
                } @else {
                  تأكيد وإرسال الطلب الآن 🚀
                }
              </button>

              <div class="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                <span>🔒</span> طلب آمن ومحمي مع مطعم ومخبز سوق وسفرة
              </div>

            </div>
          </div>

        </div>
      }

    </div>
  `
})
export class CheckoutComponent implements OnInit {
  cart = inject(CartService);
  locationService = inject(LocationService);
  api = inject(ApiService);
  router = inject(Router);

  deliveryType = signal<'delivery' | 'pickup'>('delivery');
  paymentMethod = signal<'CashOnDelivery' | 'CardOnDelivery'>('CashOnDelivery');
  
  customerName = '';
  customerPhone = '';
  customerEmail = '';
  deliveryAddress = '';
  notes = '';

  isSubmitting = signal<boolean>(false);
  orderSuccess = signal<boolean>(false);
  orderNumber = signal<string>('');
  errorMessage = signal<string>('');

  ngOnInit() {
    this.deliveryType.set(this.locationService.orderType());
    if (this.locationService.orderType() === 'delivery') {
      const loc = this.locationService.selectedLocation();
      const manual = this.locationService.manualAddress();
      if (manual && (manual.street || manual.building)) {
        this.deliveryAddress = [manual.city, manual.area, manual.street, manual.building, manual.notes].filter(Boolean).join(' - ');
      } else if (loc && loc !== 'أبوظبي - الكورنيش') {
        this.deliveryAddress = loc;
      }
    }
  }

  submitOrder() {
    this.errorMessage.set('');

    if (!this.customerName.trim()) {
      this.errorMessage.set('يرجى إدخال الاسم الكامل');
      return;
    }

    if (!this.customerPhone.trim() || this.customerPhone.length < 8) {
      this.errorMessage.set('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    if (this.deliveryType() === 'delivery' && !this.deliveryAddress.trim()) {
      this.errorMessage.set('يرجى إدخال عنوان التوصيل');
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail || undefined,
      deliveryAddress: this.deliveryType() === 'delivery' ? this.deliveryAddress : 'استلام من الفرع الرئيسي - أبوظبي',
      branchId: 1,
      paymentMethod: this.paymentMethod(),
      notes: this.notes,
      items: this.cart.items().map(i => ({
        productId: i.product.productId,
        variantId: i.selectedVariant?.variantId,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      }))
    };

    this.api.createOrder(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.orderNumber.set(res.orderNumber || String(res.orderId));
        this.orderSuccess.set(true);
        this.cart.clear();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.');
      }
    });
  }
}
