import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { CartService } from '../../../../core/services/cart.service';
import { CartItem } from '../../../../core/models/models';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section dir="rtl" class="min-h-[60vh] bg-[#fffaf3] px-4 py-8 sm:py-12">
      <div class="mx-auto max-w-6xl">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="mb-2 text-sm font-bold text-primary">طلبك اللذيذ يبدأ من هنا</p>
            <h1 class="font-baloo text-3xl font-black text-primaryDark sm:text-4xl">سلة المشتريات</h1>
            <p class="mt-2 text-sm text-gray-500">راجع المنتجات والكميات قبل إتمام طلبك.</p>
          </div>
          @if (cart.items().length > 0) {
            <span class="rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-bold text-primaryDark shadow-sm">
              {{ cart.totalCount() }} منتج في السلة
            </span>
          }
        </div>

        @if (cart.items().length === 0) {
          <div class="rounded-3xl border border-orange-100 bg-white px-6 py-14 text-center shadow-sm sm:py-20">
            <div class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-4xl" aria-hidden="true">🛒</div>
            <h2 class="font-baloo text-2xl font-extrabold text-primaryDark">سلتك فارغة حالياً</h2>
            <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">اختار اللي بتحبه من المنيو، وهتلاقي كل منتجاتك هنا جاهزة للمراجعة.</p>
            <a routerLink="/menu" class="mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-7 py-3 font-bold text-white shadow-md transition hover:bg-primaryDark">
              تصفح المنيو
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            <div class="space-y-4 lg:col-span-8">
              @for (item of cart.items(); track $index) {
                <article class="flex flex-col gap-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
                  <img
                    [src]="imageUrl(item.product.imageUrl)"
                    [alt]="item.product.nameAr"
                    class="h-24 w-full rounded-2xl bg-orange-50 object-cover sm:h-24 sm:w-28">

                  <div class="min-w-0 flex-1">
                    <h2 class="font-baloo text-lg font-extrabold text-primaryDark">{{ language.isEnglish() ? (item.product.nameEn || item.product.nameAr) : item.product.nameAr }}</h2>
                    @if (item.selectedVariant) {
                      <p class="mt-1 text-xs text-gray-500">الخيار: {{ language.isEnglish() ? (item.selectedVariant.nameEn || item.selectedVariant.nameAr) : item.selectedVariant.nameAr }}</p>
                    }
                    @if (item.selectedAddons.length) {
                      <p class="mt-1 text-xs text-gray-500">الإضافات: {{ addonsLabel(item) }}</p>
                    }
                    @if (item.specialInstructions) {
                      <p class="mt-1 text-xs text-gray-500">ملاحظات: {{ item.specialInstructions }}</p>
                    }
                    <p class="mt-2 text-sm font-bold text-primary">{{ unitPrice(item) }} درهم للقطعة</p>
                  </div>

                  <div class="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-1">
                      <button type="button" (click)="cart.updateQuantity(item, -1)" [attr.aria-label]="'تقليل كمية ' + item.product.nameAr" class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-bold text-gray-600 shadow-sm transition hover:text-red-500">−</button>
                      <span class="min-w-5 text-center text-sm font-extrabold text-gray-800">{{ item.quantity }}</span>
                      <button type="button" (click)="cart.updateQuantity(item, 1)" [attr.aria-label]="'زيادة كمية ' + item.product.nameAr" class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-bold text-primary shadow-sm transition hover:bg-orange-50">+</button>
                    </div>
                    <div class="text-left">
                      <p class="text-xs text-gray-400">الإجمالي</p>
                      <p class="font-extrabold text-primaryDark">{{ item.totalPrice }} درهم</p>
                    </div>
                  </div>

                  <button type="button" (click)="cart.removeItem(item)" [attr.aria-label]="'حذف ' + item.product.nameAr + ' من السلة'" class="self-end rounded-xl px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 sm:self-center">
                    حذف
                  </button>
                </article>
              }

              <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
                <a routerLink="/menu" class="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-primaryDark transition hover:text-primary">
                  <span aria-hidden="true">←</span> متابعة التسوق
                </a>
                <button type="button" (click)="cart.clear()" class="rounded-xl px-3 py-2 text-sm font-bold text-gray-500 transition hover:bg-red-50 hover:text-red-600">إفراغ السلة</button>
              </div>
            </div>

            <aside class="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm lg:sticky lg:top-28 lg:col-span-4 sm:p-6">
              <h2 class="font-baloo text-xl font-extrabold text-primaryDark">ملخص الطلب</h2>
              <div class="mt-5 space-y-4 text-sm">
                <div class="flex justify-between text-gray-500"><span>عدد المنتجات</span><span class="font-bold text-gray-800">{{ cart.totalCount() }}</span></div>
                <div class="flex justify-between text-gray-500"><span>المجموع الفرعي</span><span>{{ cart.subTotal() }} {{ language.isEnglish() ? 'EGP' : 'جنيه' }}</span></div>
                <div class="flex justify-between text-gray-500"><span>رسوم التوصيل</span><span>{{ cart.deliveryFee() }} {{ language.isEnglish() ? 'EGP' : 'جنيه' }}</span></div>
                <div class="border-t border-dashed border-gray-200 pt-4">
                  <div class="flex justify-between text-base font-black text-primaryDark"><span>الإجمالي</span><span>{{ cart.totalAmount() }} {{ language.isEnglish() ? 'EGP' : 'جنيه' }}</span></div>
                </div>
              </div>
              <button type="button" (click)="showBuyNow.set(true)" class="mt-4 flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-green-700 active:scale-[.98]">
                اشتري الآن عبر واتساب
              </button>
              <a routerLink="/checkout" class="mt-3 flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-primaryDark active:scale-[.98]">
                متابعة إتمام الطلب المعتاد
              </a>
              <p class="mt-3 text-center text-xs leading-5 text-gray-400">تُحسب رسوم الاستلام والتوصيل النهائية عند إتمام الطلب.</p>
            </aside>
          </div>
        }

        @if (showBuyNow()) {
          <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" (click)="showBuyNow.set(false)">
            <section role="dialog" aria-modal="true" aria-labelledby="buy-now-title" class="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl" (click)="$event.stopPropagation()">
              <div><h2 id="buy-now-title" class="font-baloo text-xl font-black text-primaryDark">بيانات إرسال الطلب</h2><p class="mt-1 text-sm text-gray-500">سنحفظ الطلب أولاً، ثم نفتح واتساب برسالة جاهزة لإرسالها بنفسك.</p></div>
              @if (errorMessage()) { <p role="alert" class="rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ errorMessage() }}</p> }
              <label class="block text-sm font-bold text-gray-700">اسم العميل
                <input [(ngModel)]="customerName" name="buyName" required class="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3" placeholder="الاسم الكامل">
              </label>
              <label class="block text-sm font-bold text-gray-700">رقم الهاتف
                <input [(ngModel)]="customerPhone" name="buyPhone" required type="tel" class="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-left" dir="ltr" placeholder="01xxxxxxxxx">
              </label>
              <div class="flex gap-3 pt-2">
                <button type="button" (click)="showBuyNow.set(false)" class="flex-1 rounded-xl bg-gray-100 px-4 py-3 font-bold text-gray-700">إلغاء</button>
                <button type="button" (click)="buyNow()" [disabled]="isSubmitting()" class="flex-1 rounded-xl bg-green-600 px-4 py-3 font-bold text-white disabled:opacity-50">{{ isSubmitting() ? 'جارٍ تجهيز الطلب…' : 'حفظ وفتح واتساب' }}</button>
              </div>
            </section>
          </div>
        }
      </div>
    </section>
  `
})
export class CartPageComponent {
  cart = inject(CartService);
  private api = inject(ApiService);
  language = inject(LanguageService);
  showBuyNow = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  customerName = '';
  customerPhone = '';

  buyNow() {
    const name = this.customerName.trim();
    const phone = this.customerPhone.trim();
    if (!name || !phone) { this.errorMessage.set('اكتب اسم العميل ورقم الهاتف أولاً.'); return; }
    if (!this.cart.items().length) { this.errorMessage.set('السلة فارغة.'); return; }

    // Open synchronously to avoid popup blocking, but don't navigate until the order is saved.
    const whatsappWindow = window.open('about:blank', '_blank');
    if (!whatsappWindow) { this.errorMessage.set('اسمح بفتح النوافذ المنبثقة لإكمال الطلب. لم يتم مسح السلة.'); return; }
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    const cartSnapshot = this.cart.items().map(item => ({
      name: item.product.nameAr,
      variant: item.selectedVariant?.nameAr,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      addons: item.selectedAddons.map(addon => ({ name: addon.nameAr, price: addon.price })),
      instructions: item.specialInstructions,
      productId: item.product.productId,
      variantId: item.selectedVariant?.variantId,
      unitPrice: item.unitPrice,
      addonIds: item.selectedAddons.map(addon => addon.addonId!).filter(Boolean)
    }));
    const items = cartSnapshot.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      addonIds: item.addonIds
    }));
    this.api.createOrder({
      customerName: name,
      customerPhone: phone,
      deliveryAddress: 'استلام من الفرع',
      branchId: 1,
      paymentMethod: 'CashOnDelivery',
      notes: cartSnapshot.filter(item => item.instructions).map(item => `${item.name}: ${item.instructions}`).join(' | '),
      items
    }).subscribe({
      next: order => {
        const lines = cartSnapshot.map(item => {
          const addons = item.addons.map(addon => `+ ${addon.name} (${addon.price} جنيه)`).join('، ');
          const notes = item.instructions ? `\n  ملاحظة: ${item.instructions}` : '';
          return `• ${item.name}${item.variant ? ` - ${item.variant}` : ''} × ${item.quantity} | ${item.totalPrice} جنيه${addons ? `\n  الإضافات: ${addons}` : ''}${notes}`;
        });
        const message = [
          'طلب جديد من سوق وسفرة',
          `رقم الطلب: ${order.orderNumber || order.orderId}`,
          `اسم العميل: ${name}`,
          `رقم الهاتف: ${phone}`,
          '', 'المنتجات:', ...lines, '',
          `الإجمالي شامل التوصيل: ${order.total} جنيه`
        ].join('\n');
        const target = `https://wa.me/201001415548?text=${encodeURIComponent(message)}`;
        // Only clear after the saved order and complete prefilled message are ready.
        whatsappWindow.location.href = target;
        this.cart.clear();
        this.isSubmitting.set(false);
        this.showBuyNow.set(false);
      },
      error: () => {
        whatsappWindow.close();
        this.isSubmitting.set(false);
        this.errorMessage.set('تعذر حفظ الطلب على الخادم. بقيت السلة كما هي، حاول مرة أخرى.');
      }
    });
  }

  addonsLabel(item: CartItem): string { return item.selectedAddons.map(addon => `${this.language.isEnglish() ? (addon.nameEn || addon.nameAr) : addon.nameAr} (+${addon.price})`).join(this.language.isEnglish() ? ', ' : '، '); }

  unitPrice(item: CartItem): number { return item.unitPrice + item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0); }

  imageUrl(url?: string): string {
    if (!url) return 'assets/MAIN.jpg';
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }
}
