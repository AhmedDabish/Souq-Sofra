import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { CartService } from '../../../../core/services/cart.service';
import { CartItem, DeliveryZone } from '../../../../core/models/models';
import { DeliveryMapComponent } from '../../components/delivery-map/delivery-map.component';
import { LanguageService } from '../../../../core/services/language.service';
import { LocationService } from '../../../../core/services/location.service';
import { DEFAULT_DELIVERY_ZONES } from '../../../../core/data/default-delivery-zones';
import { mergeDeliveryZones } from '../../../../core/utils/delivery-zone-settings';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DeliveryMapComponent],
  template: `
    <section [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'" class="min-h-[60vh] bg-[#fffaf3] px-4 py-8 sm:py-12">
      <div class="mx-auto max-w-6xl">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="mb-2 text-sm font-bold text-primary">{{ language.t('طلبك اللذيذ يبدأ من هنا', 'Your delicious order starts here') }}</p>
            <h1 class="font-baloo text-3xl font-black text-primaryDark sm:text-4xl">{{ language.t('سلة المشتريات', 'Shopping cart') }}</h1>
            <p class="mt-2 text-sm text-gray-500">{{ language.t('راجع المنتجات، واختر الاستلام أو التوصيل قبل إرسال الطلب عبر واتساب.', 'Review your items and choose pickup or delivery before sending your order via WhatsApp.') }}</p>
          </div>
          @if (cart.items().length > 0) {
            <span class="rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-bold text-primaryDark shadow-sm">
              {{ cart.totalCount() }} {{ language.t('منتج في السلة', 'items in cart') }}
            </span>
          }
        </div>

        @if (cart.items().length === 0) {
          <div class="rounded-3xl border border-orange-100 bg-white px-6 py-14 text-center shadow-sm sm:py-20">
            <div class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-4xl" aria-hidden="true">🛒</div>
            <h2 class="font-baloo text-2xl font-extrabold text-primaryDark">{{ language.t('سلتك فارغة حالياً', 'Your cart is empty') }}</h2>
            <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">{{ language.t('اختار اللي بتحبه من المنيو، وهتلاقي كل منتجاتك هنا جاهزة للمراجعة.', 'Choose your favorites from the menu and they will be ready for you to review here.') }}</p>
            <a routerLink="/menu" class="mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-7 py-3 font-bold text-white shadow-md transition hover:bg-primaryDark">
              {{ language.t('تصفح المنيو', 'Browse menu') }}
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            <div class="space-y-4 lg:col-span-8">
              @for (item of cart.items(); track $index) {
                <article class="flex flex-col gap-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
                  <img
                    [src]="imageUrl(item.product.imageUrl)"
                    [alt]="language.isEnglish() ? (item.product.nameEn || item.product.nameAr) : item.product.nameAr"
                    class="aspect-[4/3] w-full shrink-0 rounded-2xl bg-orange-50 object-cover sm:w-36">

                  <div class="min-w-0 flex-1">
                    <h2 class="font-baloo text-lg font-extrabold text-primaryDark">{{ language.isEnglish() ? (item.product.nameEn || item.product.nameAr) : item.product.nameAr }}</h2>
                    @if (item.selectedVariant) {
                      <p class="mt-1 text-xs text-gray-500">{{ language.t('الخيار:', 'Option:') }} {{ language.isEnglish() ? (item.selectedVariant.nameEn || item.selectedVariant.nameAr) : item.selectedVariant.nameAr }}</p>
                    }
                    @if (item.selectedAddons.length) {
                      <p class="mt-1 text-xs text-gray-500">{{ language.t('الإضافات:', 'Extras:') }} {{ addonsLabel(item) }}</p>
                    }
                    @if (item.specialInstructions) {
                      <p class="mt-1 text-xs text-gray-500">{{ language.t('ملاحظات:', 'Notes:') }} {{ item.specialInstructions }}</p>
                    }
                    <p class="mt-2 text-sm font-bold text-primary">{{ unitPrice(item) }} {{ language.isEnglish() ? 'AED each' : 'درهم للقطعة' }}</p>
                  </div>

                  <div class="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-1">
                      <button type="button" (click)="cart.updateQuantity(item, -1)" [attr.aria-label]="language.t('تقليل كمية', 'Decrease quantity') + ' ' + (language.isEnglish() ? item.product.nameEn : item.product.nameAr)" class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-bold text-gray-600 shadow-sm transition hover:text-red-500">−</button>
                      <span class="min-w-5 text-center text-sm font-extrabold text-gray-800">{{ item.quantity }}</span>
                      <button type="button" (click)="cart.updateQuantity(item, 1)" [attr.aria-label]="language.t('زيادة كمية', 'Increase quantity') + ' ' + (language.isEnglish() ? item.product.nameEn : item.product.nameAr)" class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-bold text-primary shadow-sm transition hover:bg-orange-50">+</button>
                    </div>
                    <div class="text-left">
                      <p class="text-xs text-gray-400">{{ language.t('الإجمالي', 'Total') }}</p>
                      <p class="font-extrabold text-primaryDark">{{ item.totalPrice }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</p>
                    </div>
                  </div>

                  <button type="button" (click)="cart.removeItem(item)" [attr.aria-label]="language.t('حذف', 'Remove') + ' ' + (language.isEnglish() ? item.product.nameEn : item.product.nameAr) + ' ' + language.t('من السلة', 'from cart')" class="self-end rounded-xl px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 sm:self-center" >
                    {{ language.t('حذف', 'Remove') }}
                  </button>
                </article>
              }

              <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
                <a routerLink="/menu" class="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-primaryDark transition hover:text-primary">
                  <span aria-hidden="true">{{ language.isEnglish() ? '→' : '←' }}</span> {{ language.t('متابعة التسوق', 'Continue shopping') }}
                </a>
                <button type="button" (click)="cart.clear()" class="rounded-xl px-3 py-2 text-sm font-bold text-gray-500 transition hover:bg-red-50 hover:text-red-600">{{ language.t('إفراغ السلة', 'Clear cart') }}</button>
              </div>
            </div>

            <aside class="overflow-hidden rounded-[1.75rem] border border-orange-100/80 bg-white shadow-[0_24px_65px_-38px_rgba(104,55,18,.65)] lg:sticky lg:top-28 lg:col-span-4">
              <div class="relative overflow-hidden bg-gradient-to-br from-[#fff0dc] via-[#fff8ef] to-white px-5 py-5 sm:px-6">
                <div class="pointer-events-none absolute -end-8 -top-12 h-32 w-32 rounded-full bg-orange-200/30 blur-2xl"></div>
                <div class="flex items-center gap-3">
                  <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-md shadow-orange-900/5" aria-hidden="true">🧾</span>
                  <div>
                    <p class="text-[11px] font-bold tracking-wide text-primary">{{ language.t('راجع طلبك', 'Review your order') }}</p>
                    <h2 class="mt-0.5 font-baloo text-xl font-extrabold text-primaryDark">{{ language.t('ملخص الطلب', 'Order summary') }}</h2>
                  </div>
                </div>
              </div>
              <div class="space-y-5 p-4 sm:p-6">
                <div class="rounded-2xl border border-orange-100 bg-gradient-to-b from-[#fffaf5] to-white p-4 sm:p-5">
                  <div class="mb-3 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg shadow-sm">🛍️</span>
                      <div>
                        <p class="text-xs font-extrabold text-primaryDark">{{ language.t('تفاصيل الفاتورة', 'Bill details') }}</p>
                        <p class="mt-0.5 text-[10px] text-gray-500">{{ cart.totalCount() }} {{ language.t('منتج', 'items') }}</p>
                      </div>
                    </div>
                    <span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-primary">{{ language.t('مراجعة الطلب', 'Order review') }}</span>
                  </div>
                  <div class="space-y-3.5 text-sm">
                  <div class="flex items-center justify-between gap-3 text-gray-500"><span>{{ language.t('عدد المنتجات', 'Items') }}</span><span class="font-bold text-gray-800">{{ cart.totalCount() }}</span></div>
                  <div class="flex items-center justify-between gap-3 text-gray-500"><span>{{ language.t('المجموع الفرعي', 'Subtotal') }}</span><span class="font-semibold text-gray-800">{{ cart.subTotal() }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span></div>
                  <div class="flex items-center justify-between gap-3 text-gray-500"><span>{{ language.t('رسوم التوصيل', 'Delivery fee') }}</span><span class="font-semibold text-gray-800">{{ deliveryType() === 'delivery' && selectedZone() ? (selectedZone()?.fee + ' ' + (language.isEnglish() ? 'AED' : 'درهم')) : '—' }}</span></div>
                  <div class="flex items-center justify-between gap-3 rounded-xl border-t border-dashed border-orange-200 pt-4 text-base font-black text-primaryDark"><span>{{ language.t('الإجمالي', 'Total') }}</span><span>{{ cart.totalAmount() }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span></div>
                  </div>
                </div>

                <div class="border-t border-orange-100 pt-5">
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <h3 class="text-sm font-extrabold text-primaryDark">{{ language.t('طريقة الاستلام', 'Fulfillment method') }}</h3>
                    @if (!deliveryType()) { <span class="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">{{ language.t('مطلوب الاختيار', 'Required') }}</span> }
                  </div>
                  <div class="grid grid-cols-2 gap-2.5">
                    <button type="button" (click)="setDeliveryType('delivery')" [class.border-primary]="deliveryType() === 'delivery'" [class.bg-orange-50]="deliveryType() === 'delivery'" [class.text-primaryDark]="deliveryType() === 'delivery'" class="group rounded-2xl border-2 border-gray-100 bg-white p-3 text-start transition hover:border-orange-200 hover:bg-orange-50/60">
                      <span class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-lg">🚚</span>
                      <span class="block text-xs font-extrabold">{{ language.t('توصيل للعنوان', 'Delivery') }}</span>
                      <span class="mt-1 block text-[10px] text-gray-500">{{ language.t('حسب المنطقة', 'By area') }}</span>
                    </button>
                    <button type="button" (click)="setDeliveryType('pickup')" [class.border-primary]="deliveryType() === 'pickup'" [class.bg-orange-50]="deliveryType() === 'pickup'" [class.text-primaryDark]="deliveryType() === 'pickup'" class="group rounded-2xl border-2 border-gray-100 bg-white p-3 text-start transition hover:border-orange-200 hover:bg-orange-50/60">
                      <span class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-lg">🏪</span>
                      <span class="block text-xs font-extrabold">{{ language.t('استلام من الفرع', 'Pickup at branch') }}</span>
                      <span class="mt-1 block text-[10px] text-gray-500">{{ language.t('بدون رسوم توصيل', 'No delivery fee') }}</span>
                    </button>
                  </div>
                </div>

                @if (!deliveryType()) {
                  <p class="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">{{ language.t('اختار طريقة الاستلام أولاً علشان تظهر بيانات إكمال الطلب.', 'Choose a fulfillment method to continue with your order.') }}</p>
                } @else {
                  <div class="space-y-4 border-t border-orange-100 pt-5">
                    <label class="block text-xs font-bold text-gray-700">{{ language.t('اسم العميل', 'Customer name') }} *
                      <input [(ngModel)]="customerName" name="orderCustomerName" required autocomplete="name" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" [placeholder]="language.t('الاسم الكامل', 'Full name')">
                    </label>
                    <label class="block text-xs font-bold text-gray-700">{{ language.t('رقم الهاتف', 'Phone number') }} *
                      <input [(ngModel)]="customerPhone" name="orderCustomerPhone" required autocomplete="tel" type="tel" dir="ltr" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-3 text-left text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" [placeholder]="language.t('05xxxxxxxx', 'Phone number')">
                    </label>
                    @if (deliveryType() === 'delivery') {
                      <label class="block text-xs font-bold text-gray-700">{{ language.t('الإمارة', 'Emirate') }} *
                        <select [(ngModel)]="selectedEmirate" name="deliveryEmirate" (ngModelChange)="onEmirateChange()" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10">
                          <option value="">{{ language.t('اختر الإمارة', 'Choose an emirate') }}</option>
                          @for (emirate of emirates; track emirate) { <option [value]="emirate">{{ language.isEnglish() ? emirateNameEn(emirate) : emirate }}</option> }
                        </select>
                      </label>
                      <label class="block text-xs font-bold text-gray-700">{{ language.t('المنطقة', 'Area') }} *
                        <select [(ngModel)]="selectedZoneId" name="deliveryZone" (ngModelChange)="onZoneChange()" [disabled]="!selectedEmirate" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-100">
                          <option value="">{{ language.t('اختر المنطقة', 'Choose an area') }}</option>
                          @for (zone of emirateZones(); track zone.id) { <option [value]="zone.id" [disabled]="!zone.enabled">{{ zoneLabel(zone) }} — {{ zone.enabled ? (zone.fee + ' ' + (language.isEnglish() ? 'AED' : 'درهم')) : language.t('غير متاحة', 'Unavailable') }}</option> }
                        </select>
                        @if (selectedEmirate && availableZones().length === 0) { <span class="mt-1 block text-red-600">{{ language.t('لا يوجد توصيل متاح حالياً في هذه الإمارة.', 'Delivery is currently unavailable in this emirate.') }}</span> }
                      </label>
                      <div class="relative overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 shadow-sm">
                        <div class="pointer-events-none absolute -end-7 -top-8 h-24 w-24 rounded-full bg-orange-200/30 blur-xl"></div>
                        <div class="relative flex flex-wrap items-center justify-between gap-3">
                          <div class="flex min-w-0 items-start gap-3">
                            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">📍</span>
                            <div class="min-w-0 pt-0.5">
                              <p class="text-sm font-extrabold text-primaryDark">{{ language.t('موقع التوصيل', 'Delivery location') }}</p>
                              @if (locationService.selectedCoordinates(); as savedCoords) {
                                <p class="mt-1 truncate text-xs font-semibold text-gray-700">{{ locationService.selectedLocation() }}</p>
                                <p class="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{{ language.t('تم حفظ الموقع بنجاح', 'Location saved successfully') }}</p>
                              } @else {
                                <p class="mt-1 text-xs leading-5 text-gray-500">{{ language.t('حدد نقطة التوصيل على الخريطة قبل إرسال الطلب', 'Pin your delivery spot before sending the order') }}</p>
                              }
                            </div>
                          </div>
                          <button type="button" (click)="openAddressPicker()" class="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-orange-900/10 transition hover:-translate-y-0.5 hover:bg-primaryDark">
                            <span aria-hidden="true">📍</span>{{ language.t('حدد موقعك', 'Set your location') }}
                          </button>
                        </div>
                      </div>
                      @if (selectedZone()) {
                        <label class="block text-xs font-bold text-gray-700">{{ language.t('تفاصيل إضافية للعنوان (شارع، مبنى، شقة)', 'Additional address details (street, building, apartment)') }}
                          <textarea [(ngModel)]="addressDetails" name="deliveryAddressDetails" rows="2" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" [placeholder]="language.t('اكتب رقم المبنى أو الشقة أو تفاصيل الوصول', 'Building, apartment, or other delivery details')"></textarea>
                        </label>
                        <p class="text-[11px] text-gray-500">{{ language.t('رسوم التوصيل لهذه المنطقة:', 'Delivery fee for this area:') }} {{ selectedZone()?.fee }} {{ language.isEnglish() ? 'AED' : 'درهم' }}.</p>
                      }
                    }
                    <label class="block text-xs font-bold text-gray-700">{{ language.t('ملاحظات إضافية', 'Additional notes') }} <span class="font-normal text-gray-400">({{ language.t('اختياري', 'optional') }})</span>
                      <textarea [(ngModel)]="customerNotes" name="orderNotes" rows="2" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" [placeholder]="language.t('أي تفاصيل تحب تضيفها', 'Add any extra details')"></textarea>
                    </label>
                    <p class="rounded-2xl border border-green-100 bg-green-50 p-3 text-[11px] leading-5 text-green-800">{{ language.t('الدفع نقداً عند الاستلام أو الاستلام من الفرع. بعد حفظ الطلب هيفتح واتساب برسالة الطلب الجاهزة.', 'Pay cash on delivery or at the branch. WhatsApp will open with your order message after it is saved.') }}</p>
                    @if (errorMessage()) { <p role="alert" class="rounded-xl bg-red-50 p-3 text-xs text-red-700">{{ errorMessage() }}</p> }
                    <button type="button" (click)="buyNow()" [disabled]="isSubmitting()" class="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-green-700/15 transition hover:-translate-y-0.5 hover:bg-green-700 active:translate-y-0 disabled:cursor-wait disabled:opacity-50">
                      <span aria-hidden="true">☘</span>{{ isSubmitting() ? language.t('جارٍ تجهيز الطلب…', 'Preparing your order…') : language.t('تأكيد الطلب عبر واتساب', 'Confirm order via WhatsApp') }}
                    </button>
                  </div>
                }
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
  locationService = inject(LocationService);
  readonly emirates = ['أبوظبي', 'دبي', 'الشارقة', 'عجمان', 'أم القيوين', 'رأس الخيمة', 'الفجيرة'];
  zones = signal<DeliveryZone[]>(DEFAULT_DELIVERY_ZONES);
  emirateNameEn(name: string): string { return ({ 'أبوظبي': 'Abu Dhabi', 'دبي': 'Dubai', 'الشارقة': 'Sharjah', 'عجمان': 'Ajman', 'أم القيوين': 'Umm Al Quwain', 'رأس الخيمة': 'Ras Al Khaimah', 'الفجيرة': 'Fujairah' } as Record<string, string>)[name] || name; }
  zoneLabel(zone: DeliveryZone): string { return this.language.isEnglish() ? (zone.nameEn || this.emirateNameEn(zone.name)) : zone.name; }
  emirateZones = computed(() => this.zones().filter(zone => zone.emirate === this.selectedEmirate));
  availableZones = computed(() => this.emirateZones().filter(zone => zone.enabled));
  selectedZone = computed(() => this.availableZones().find(zone => zone.id === this.selectedZoneId) ?? null);
  deliveryType = signal<'delivery' | 'pickup' | null>(null);
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
      this.zones.set(mergeDeliveryZones(zones));
    }, error: () => {} });
    this.cart.setDeliveryFee(0);
    if (this.locationService.selectedCoordinates()) {
      this.latitude.set(this.locationService.selectedCoordinates()!.latitude);
      this.longitude.set(this.locationService.selectedCoordinates()!.longitude);
    }
  }

  openAddressPicker() {
    this.locationService.openModal();
  }

  setDeliveryType(type: 'delivery' | 'pickup') {
    this.deliveryType.set(type);
    this.errorMessage.set('');
    if (type === 'pickup') this.cart.setDeliveryFee(0);
    else this.onZoneChange();
  }

  onEmirateChange() {
    this.selectedZoneId = '';
    this.cart.setDeliveryFee(0);
  }

  onZoneChange() {
    const zone = this.selectedZone();
    this.cart.setDeliveryFee(zone?.fee ?? 0);
  }

  setMapLocation(point: { latitude: number; longitude: number }) {
    this.latitude.set(point.latitude);
    this.longitude.set(point.longitude);
  }

  buyNow() {
    const deliveryType = this.deliveryType();
    const name = this.customerName.trim();
    const phone = this.customerPhone.trim();
    const zone = this.selectedZone();
    const savedCoords = this.locationService.selectedCoordinates();
    if (savedCoords) {
      this.latitude.set(savedCoords.latitude);
      this.longitude.set(savedCoords.longitude);
    }
    if (!deliveryType) { this.errorMessage.set(this.language.t('اختار توصيل أو استلام من الفرع أولاً.', 'Choose delivery or branch pickup first.')); return; }
    if (!name || !phone) { this.errorMessage.set(this.language.t('اكتب اسم العميل ورقم الهاتف أولاً.', 'Enter your name and phone number first.')); return; }
    if (!this.cart.items().length) { this.errorMessage.set(this.language.t('السلة فارغة.', 'Your cart is empty.')); return; }
    if (deliveryType === 'delivery' && (!zone || this.latitude() === null || this.longitude() === null)) {
      this.errorMessage.set(this.language.t('اختر منطقة توصيل متاحة وحدد عنوانك على الخريطة.', 'Choose an available delivery area and set your address on the map.')); return;
    }

    const whatsappWindow = window.open('about:blank', '_blank');
    if (!whatsappWindow) { this.errorMessage.set(this.language.t('اسمح بفتح النوافذ المنبثقة لإكمال الطلب. لم يتم مسح السلة.', 'Allow pop-ups to continue. Your cart has not been cleared.')); return; }
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    const cartSnapshot = this.cart.items().map(item => ({
      name: this.language.isEnglish() ? (item.product.nameEn || item.product.nameAr) : item.product.nameAr,
      variant: item.selectedVariant ? (this.language.isEnglish() ? (item.selectedVariant.nameEn || item.selectedVariant.nameAr) : item.selectedVariant.nameAr) : undefined,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      addons: item.selectedAddons.map(addon => ({ name: this.language.isEnglish() ? (addon.nameEn || addon.nameAr) : addon.nameAr, price: addon.price })),
      instructions: item.specialInstructions,
      productId: item.product.productId,
      variantId: item.selectedVariant?.variantId,
      unitPrice: item.unitPrice,
      addonIds: item.selectedAddons.map(addon => addon.addonId!).filter(Boolean)
    }));
    const savedLocation = this.locationService.selectedLocation();
    const address = deliveryType === 'pickup' ? 'استلام من الفرع' : [savedLocation, this.addressDetails.trim()].filter(Boolean).join(' - ');
    this.api.createOrder({
      customerName: name,
      customerPhone: phone,
      deliveryAddress: address,
      branchId: 1,
      deliveryType,
      deliveryZoneId: zone?.id,
      deliveryLatitude: this.latitude() ?? undefined,
      deliveryLongitude: this.longitude() ?? undefined,
      paymentMethod: 'CashOnDelivery',
      notes: [this.customerNotes.trim(), ...cartSnapshot.filter(item => item.instructions).map(item => `${item.name}: ${item.instructions}`)].filter(Boolean).join(' | ') || undefined,
      orderChannel: 'WhatsApp',
      items: cartSnapshot.map(item => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity, unitPrice: item.unitPrice, addonIds: item.addonIds }))
    }).subscribe({
      next: order => {
        const english = this.language.isEnglish();
        const currency = english ? 'AED' : 'درهم';
        const lines = cartSnapshot.map(item => {
          const addons = item.addons.map(addon => `+ ${addon.name} (${addon.price} ${currency})`).join(english ? ', ' : '، ');
          const notes = item.instructions ? `\n  ${english ? 'Note' : 'ملاحظة'}: ${item.instructions}` : '';
          return `• ${item.name}${item.variant ? ` - ${item.variant}` : ''} × ${item.quantity} | ${item.totalPrice} ${currency}${addons ? `\n  ${english ? 'Extras' : 'الإضافات'}: ${addons}` : ''}${notes}`;
        });
        const fulfillment = deliveryType === 'pickup'
          ? (english ? 'Fulfillment: Branch pickup' : 'طريقة الاستلام: استلام من الفرع')
          : `${english ? 'Fulfillment: Delivery' : 'طريقة الاستلام: توصيل'}\n${english ? 'Emirate and area' : 'الإمارة والمنطقة'}: ${english ? this.emirateNameEn(zone!.emirate) : zone!.emirate} - ${this.zoneLabel(zone!)}\n${english ? 'Address' : 'العنوان'}: ${address}\n${english ? 'Map location' : 'الموقع على الخريطة'}: https://www.google.com/maps?q=${this.latitude()},${this.longitude()}\n${english ? 'Coordinates' : 'الإحداثيات'}: ${this.latitude()}, ${this.longitude()}\n${english ? 'Delivery fee' : 'رسوم التوصيل'}: ${zone!.fee} ${currency}`;
        const message = [
          english ? 'New order from Souq & Sofra' : 'طلب جديد من سوق وسفرة', `${english ? 'Order number' : 'رقم الطلب'}: ${order.orderNumber || order.orderId}`,
          `${english ? 'Customer name' : 'اسم العميل'}: ${name}`, `${english ? 'Phone' : 'رقم الهاتف'}: ${phone}`, fulfillment,
          `${english ? 'Payment method' : 'طريقة الدفع'}: ${english ? 'Cash' : 'نقداً عند الاستلام'}`, this.customerNotes.trim() ? `${english ? 'Notes' : 'ملاحظات'}: ${this.customerNotes.trim()}` : '',
          '', english ? 'Items:' : 'المنتجات:', ...lines, '', `${english ? 'Total including delivery' : 'الإجمالي شامل التوصيل'}: ${order.total} ${currency}`
        ].filter(Boolean).join('\n');
        whatsappWindow.location.href = `https://wa.me/201001415548?text=${encodeURIComponent(message)}`;
        this.cart.clear();
        this.isSubmitting.set(false);
      },
      error: (error) => {
        whatsappWindow.close();
        this.isSubmitting.set(false);
        this.errorMessage.set(this.language.isEnglish() ? 'The order could not be saved. Your cart is unchanged. Please try again.' : (error?.error?.message || 'تعذر حفظ الطلب على الخادم. بقيت السلة كما هي، حاول مرة أخرى.'));
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
