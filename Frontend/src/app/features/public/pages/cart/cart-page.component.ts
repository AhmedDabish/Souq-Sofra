import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { CartService } from '../../../../core/services/cart.service';
import { CartItem, DeliveryZone } from '../../../../core/models/models';
import { DeliveryMapComponent } from '../../components/delivery-map/delivery-map.component';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DeliveryMapComponent],
  template: `
    <section dir="rtl" class="min-h-[60vh] bg-[#fffaf3] px-4 py-8 sm:py-12">
      <div class="mx-auto max-w-6xl">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="mb-2 text-sm font-bold text-primary">طلبك اللذيذ يبدأ من هنا</p>
            <h1 class="font-baloo text-3xl font-black text-primaryDark sm:text-4xl">سلة المشتريات</h1>
            <p class="mt-2 text-sm text-gray-500">راجع المنتجات، واختر الاستلام أو التوصيل قبل إرسال الطلب عبر واتساب.</p>
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
                <div class="flex justify-between text-gray-500"><span>المجموع الفرعي</span><span>{{ cart.subTotal() }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span></div>
                <div class="flex justify-between text-gray-500"><span>{{ deliveryType() === 'delivery' ? 'رسوم التوصيل' : 'رسوم الاستلام' }}</span><span>{{ deliveryType() === 'delivery' ? cart.deliveryFee() : 0 }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span></div>
                <div class="border-t border-dashed border-gray-200 pt-4">
                  <div class="flex justify-between text-base font-black text-primaryDark"><span>الإجمالي</span><span>{{ cart.totalAmount() }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span></div>
                </div>
              </div>
              <div class="mt-5 space-y-4 border-t border-orange-100 pt-5">
                <h3 class="font-bold text-sm text-primaryDark">طريقة الاستلام</h3>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" (click)="setDeliveryType('delivery')" [class.border-primary]="deliveryType() === 'delivery'" [class.bg-orange-50]="deliveryType() === 'delivery'" class="rounded-xl border-2 border-gray-200 p-3 text-xs font-bold text-gray-700">🚚 توصيل</button>
                  <button type="button" (click)="setDeliveryType('pickup')" [class.border-primary]="deliveryType() === 'pickup'" [class.bg-orange-50]="deliveryType() === 'pickup'" class="rounded-xl border-2 border-gray-200 p-3 text-xs font-bold text-gray-700">🏪 استلام من الفرع</button>
                </div>
                <label class="block text-xs font-bold text-gray-700">اسم العميل *
                  <input [(ngModel)]="customerName" name="orderCustomerName" required autocomplete="name" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" placeholder="الاسم الكامل">
                </label>
                <label class="block text-xs font-bold text-gray-700">رقم الهاتف *
                  <input [(ngModel)]="customerPhone" name="orderCustomerPhone" required autocomplete="tel" type="tel" dir="ltr" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-left" placeholder="05xxxxxxxx">
                </label>
                @if (deliveryType() === 'delivery') {
                  <label class="block text-xs font-bold text-gray-700">الإمارة *
                    <select [(ngModel)]="selectedEmirate" name="deliveryEmirate" (ngModelChange)="onEmirateChange()" class="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm">
                      <option value="">اختر الإمارة</option>
                      @for (emirate of emirates; track emirate) { <option [value]="emirate">{{ emirate }}</option> }
                    </select>
                  </label>
                  <label class="block text-xs font-bold text-gray-700">المنطقة *
                    <select [(ngModel)]="selectedZoneId" name="deliveryZone" (ngModelChange)="onZoneChange()" [disabled]="!selectedEmirate" class="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm disabled:bg-gray-100">
                      <option value="">اختر المنطقة</option>
                      @for (zone of emirateZones(); track zone.id) { <option [value]="zone.id" [disabled]="!zone.enabled">{{ zone.name }} — {{ zone.enabled ? zone.fee + ' درهم' : 'غير متاحة' }}</option> }
                    </select>
                    @if (selectedEmirate && availableZones().length === 0) { <span class="mt-1 block text-red-600">لا يوجد توصيل متاح حالياً في هذه الإمارة.</span> }
                  </label>
                  @if (selectedZone()) {
                    <label class="block text-xs font-bold text-gray-700">تفاصيل العنوان (شارع، مبنى، شقة) *
                      <textarea [(ngModel)]="addressDetails" name="deliveryAddressDetails" rows="2" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" placeholder="اكتب تفاصيل الوصول"></textarea>
                    </label>
                    <div class="space-y-2"><p class="text-xs font-bold text-gray-700">حدد موقعك على الخريطة *</p>
                      <app-delivery-map [latitude]="latitude()" [longitude]="longitude()" (locationChange)="setMapLocation($event)" />
                      <p class="text-[11px] text-gray-500">اضغط على الخريطة أو اسحب الدبوس لمكان التوصيل. رسوم هذه المنطقة: {{ selectedZone()?.fee }} درهم.</p>
                      @if (latitude() !== null) { <p class="text-[11px] text-green-700">تم تحديد الموقع: {{ latitude() | number:'1.5-5' }}, {{ longitude() | number:'1.5-5' }}</p> }
                    </div>
                  }
                }
                <label class="block text-xs font-bold text-gray-700">ملاحظات إضافية
                  <textarea [(ngModel)]="customerNotes" name="orderNotes" rows="2" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" placeholder="اختياري"></textarea>
                </label>
                <p class="rounded-xl bg-amber-50 p-3 text-[11px] leading-5 text-amber-800">الدفع نقداً عند الاستلام أو الاستلام من الفرع. بعد حفظ الطلب سيفتح واتساب برسالة الطلب الجاهزة.</p>
                @if (errorMessage()) { <p role="alert" class="rounded-xl bg-red-50 p-3 text-xs text-red-700">{{ errorMessage() }}</p> }
                <button type="button" (click)="buyNow()" [disabled]="isSubmitting()" class="flex w-full items-center justify-center rounded-2xl bg-green-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-green-700 active:scale-[.98] disabled:opacity-50">
                  {{ isSubmitting() ? 'جارٍ تجهيز الطلب…' : 'اشتري الآن وأرسل عبر واتساب' }}
                </button>
              </div>
            </aside>
          </div>
        }


      </div>
    </section>
  `
})
export class CartPageComponent implements OnInit {
  cart = inject(CartService);
  private api = inject(ApiService);
  language = inject(LanguageService);
  readonly emirates = ['أبوظبي', 'دبي', 'الشارقة', 'عجمان', 'أم القيوين', 'رأس الخيمة', 'الفجيرة'];
  zones = signal<DeliveryZone[]>(this.emirates.map((emirate, index) => ({ id: `uae-${index + 1}`, emirate, name: emirate, fee: 10, enabled: true })));
  emirateZones = computed(() => this.zones().filter(zone => zone.emirate === this.selectedEmirate));
  availableZones = computed(() => this.emirateZones().filter(zone => zone.enabled));
  selectedZone = computed(() => this.availableZones().find(zone => zone.id === this.selectedZoneId) ?? null);
  deliveryType = signal<'delivery' | 'pickup'>('delivery');
  isSubmitting = signal(false);
  errorMessage = signal('');
  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  customerName = '';
  customerPhone = '';
  selectedEmirate = '';
  selectedZoneId = '';
  addressDetails = '';
  customerNotes = '';

  ngOnInit() {
    this.api.getDeliveryZones().subscribe({ next: zones => {
      if (zones.length) this.zones.set(zones);
    }, error: () => {} });
    this.cart.setDeliveryFee(0);
  }

  setDeliveryType(type: 'delivery' | 'pickup') {
    this.deliveryType.set(type);
    this.errorMessage.set('');
    if (type === 'pickup') this.cart.setDeliveryFee(0);
    else this.onZoneChange();
  }

  onEmirateChange() {
    this.selectedZoneId = '';
    this.latitude.set(null);
    this.longitude.set(null);
    this.cart.setDeliveryFee(0);
  }

  onZoneChange() {
    const zone = this.selectedZone();
    this.cart.setDeliveryFee(zone?.fee ?? 0);
    this.latitude.set(null);
    this.longitude.set(null);
  }

  setMapLocation(point: { latitude: number; longitude: number }) {
    this.latitude.set(point.latitude);
    this.longitude.set(point.longitude);
  }

  buyNow() {
    const name = this.customerName.trim();
    const phone = this.customerPhone.trim();
    const zone = this.selectedZone();
    if (!name || !phone) { this.errorMessage.set('اكتب اسم العميل ورقم الهاتف أولاً.'); return; }
    if (!this.cart.items().length) { this.errorMessage.set('السلة فارغة.'); return; }
    if (this.deliveryType() === 'delivery' && (!zone || !this.addressDetails.trim() || this.latitude() === null || this.longitude() === null)) {
      this.errorMessage.set('اختر منطقة توصيل متاحة، واكتب تفاصيل العنوان وحدد موقعك على الخريطة.'); return;
    }

    const whatsappWindow = window.open('about:blank', '_blank');
    if (!whatsappWindow) { this.errorMessage.set('اسمح بفتح النوافذ المنبثقة لإكمال الطلب. لم يتم مسح السلة.'); return; }
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    const cartSnapshot = this.cart.items().map(item => ({
      name: this.language.isEnglish() ? (item.product.nameEn || item.product.nameAr) : item.product.nameAr,
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
    const address = this.deliveryType() === 'pickup' ? 'استلام من الفرع' : this.addressDetails.trim();
    this.api.createOrder({
      customerName: name,
      customerPhone: phone,
      deliveryAddress: address,
      branchId: 1,
      deliveryType: this.deliveryType(),
      deliveryZoneId: zone?.id,
      deliveryLatitude: this.latitude() ?? undefined,
      deliveryLongitude: this.longitude() ?? undefined,
      paymentMethod: 'CashOnDelivery',
      notes: [this.customerNotes.trim(), ...cartSnapshot.filter(item => item.instructions).map(item => `${item.name}: ${item.instructions}`)].filter(Boolean).join(' | ') || undefined,
      orderChannel: 'WhatsApp',
      items: cartSnapshot.map(item => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity, unitPrice: item.unitPrice, addonIds: item.addonIds }))
    }).subscribe({
      next: order => {
        const lines = cartSnapshot.map(item => {
          const addons = item.addons.map(addon => `+ ${addon.name} (${addon.price} درهم)`).join('، ');
          const notes = item.instructions ? `\n  ملاحظة: ${item.instructions}` : '';
          return `• ${item.name}${item.variant ? ` - ${item.variant}` : ''} × ${item.quantity} | ${item.totalPrice} درهم${addons ? `\n  الإضافات: ${addons}` : ''}${notes}`;
        });
        const fulfillment = this.deliveryType() === 'pickup'
          ? 'طريقة الاستلام: استلام من الفرع'
          : `طريقة الاستلام: توصيل\nالإمارة والمنطقة: ${zone!.emirate} - ${zone!.name}\nالعنوان: ${address}\nالموقع على الخريطة: ${this.latitude()}, ${this.longitude()}\nرسوم التوصيل: ${zone!.fee} درهم`;
        const message = [
          'طلب جديد من سوق وسفرة', `رقم الطلب: ${order.orderNumber || order.orderId}`,
          `اسم العميل: ${name}`, `رقم الهاتف: ${phone}`, fulfillment,
          `طريقة الدفع: نقداً عند الاستلام`, this.customerNotes.trim() ? `ملاحظات: ${this.customerNotes.trim()}` : '',
          '', 'المنتجات:', ...lines, '', `الإجمالي شامل التوصيل: ${order.total} درهم`
        ].filter(Boolean).join('\n');
        whatsappWindow.location.href = `https://wa.me/201001415548?text=${encodeURIComponent(message)}`;
        this.cart.clear();
        this.isSubmitting.set(false);
      },
      error: (error) => {
        whatsappWindow.close();
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message || 'تعذر حفظ الطلب على الخادم. بقيت السلة كما هي، حاول مرة أخرى.');
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
