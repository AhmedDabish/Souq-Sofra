import { Component, inject, signal, OnInit } from '@angular/core';
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
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DeliveryMapComponent],
    template: `
    <section [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'" class="min-h-screen bg-[radial-gradient(ellipse_at_top,_#fff4e8_0%,_#fffaf5_42%,_#f8f7f4_100%)] px-4 py-8 sm:px-6 sm:py-12">
      <div class="mx-auto max-w-7xl">
        <header class="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
          <div>
            <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/80 px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
              <span class="h-2 w-2 rounded-full bg-primary"></span>
              {{ language.t('سوق وسفرة · طلبك على مزاجك', 'Souq & Sofra · made your way') }}
            </div>
            <h1 class="font-baloo text-3xl font-black tracking-tight text-primaryDark sm:text-4xl">{{ language.t('سلة المشتريات', 'Shopping cart') }}</h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">{{ language.t('راجع اختياراتك، حدّد طريقة الاستلام، وبعدها أكّد طلبك بسهولة.', 'Review your picks, choose how to receive them, then confirm your order.') }}</p>
          </div>
          @if (cart.items().length > 0) {
            <div class="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white/90 px-4 py-3 shadow-sm">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-xl" aria-hidden="true">🛍️</span>
              <div>
                <p class="text-[11px] font-semibold text-gray-500">{{ language.t('جاهز لطلبك', 'Ready for your order') }}</p>
                <p class="text-sm font-extrabold text-primaryDark">{{ cart.totalCount() }} {{ language.t('منتج', 'items') }}</p>
              </div>
            </div>
          }
        </header>

        @if (cart.items().length === 0) {
          <div class="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_24px_70px_-48px_rgba(104,55,18,.45)]">
            <div class="mx-auto max-w-xl px-6 py-16 text-center sm:py-24">
              <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-orange-100 to-amber-50 text-5xl shadow-inner" aria-hidden="true">🛒</div>
              <p class="mb-2 text-xs font-extrabold uppercase tracking-[.18em] text-primary">{{ language.t('مساحة اختياراتك', 'Your picks') }}</p>
              <h2 class="font-baloo text-2xl font-black text-primaryDark sm:text-3xl">{{ language.t('سلتك فاضية دلوقتي', 'Your cart is empty') }}</h2>
              <p class="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">{{ language.t('لفّ على المنيو واختار أكلك المفضل، هنحتفظ باختياراتك هنا علشان تراجعها وقت ما تحب.', 'Explore the menu and choose your favorites. We’ll keep them here so you can review them whenever you’re ready.') }}</p>
              <a routerLink="/menu" class="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-900/15 transition hover:-translate-y-0.5 hover:bg-primaryDark">
                {{ language.t('اكتشف المنيو', 'Explore the menu') }} <span aria-hidden="true">{{ language.isEnglish() ? '→' : '←' }}</span>
              </a>
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            <div class="space-y-4 lg:col-span-7">
              <div class="flex flex-wrap items-center justify-between gap-3 px-1">
                <div>
                  <h2 class="font-baloo text-xl font-extrabold text-primaryDark">{{ language.t('اختياراتك', 'Your items') }}</h2>
                  <p class="mt-0.5 text-xs text-gray-500">{{ language.t('تقدر تعدّل الكمية أو تحذف أي صنف قبل التأكيد.', 'Adjust quantities or remove items before confirming.') }}</p>
                </div>
                <button type="button" (click)="clearCart()" class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-gray-500 transition hover:bg-rose-50 hover:text-rose-600">
                  <span aria-hidden="true">⌫</span>{{ language.t('إفراغ السلة', 'Clear cart') }}
                </button>
              </div>

              @for (item of cart.items(); track $index) {
                <article class="group rounded-[1.6rem] border border-orange-100/80 bg-white p-4 shadow-[0_12px_35px_-28px_rgba(67,45,26,.38)] transition hover:border-orange-200 hover:shadow-[0_18px_42px_-28px_rgba(67,45,26,.42)] sm:p-5">
                  <div class="flex gap-4 sm:gap-5">
                    <div class="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-orange-50 sm:h-28 sm:w-28">
                      <img [src]="imageUrl(item.product.imageUrl)" [alt]="language.isEnglish() ? (item.product.nameEn || item.product.nameAr) : item.product.nameAr" class="h-full w-full object-cover transition duration-500 group-hover:scale-105">
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <h3 class="font-baloo text-lg font-extrabold leading-snug text-primaryDark sm:text-xl">{{ language.isEnglish() ? (item.product.nameEn || item.product.nameAr) : item.product.nameAr }}</h3>
                          @if (item.selectedVariant) { <p class="mt-1 text-xs text-gray-500">{{ language.t('الخيار:', 'Option:') }} {{ language.isEnglish() ? (item.selectedVariant.nameEn || item.selectedVariant.nameAr) : item.selectedVariant.nameAr }}</p> }
                        </div>
                        <button type="button" (click)="removeCartItem(item)" [attr.aria-label]="language.t('حذف', 'Remove') + ' ' + (language.isEnglish() ? item.product.nameEn : item.product.nameAr) + ' ' + language.t('من السلة', 'from cart')" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-rose-50 hover:text-rose-600" title="{{ language.t('حذف المنتج', 'Remove item') }}">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg>
                        </button>
                      </div>
                      @if (item.selectedAddons.length) { <p class="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{{ language.t('إضافات:', 'Extras:') }} {{ addonsLabel(item) }}</p> }
                      @if (item.specialInstructions) { <p class="mt-1 line-clamp-1 text-xs text-gray-500">{{ language.t('ملاحظة:', 'Note:') }} {{ item.specialInstructions }}</p> }
                      <p class="mt-2 text-xs font-bold text-primary">{{ unitPrice(item) }} {{ language.isEnglish() ? 'AED / item' : 'درهم للقطعة' }}</p>
                      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-orange-100 pt-3">
                        <div class="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                          <button type="button" (click)="cart.updateQuantity(item, -1)" [attr.aria-label]="language.t('تقليل كمية', 'Decrease quantity') + ' ' + (language.isEnglish() ? item.product.nameEn : item.product.nameAr)" class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-bold text-gray-600 shadow-sm transition hover:text-primary">−</button>
                          <span class="min-w-8 text-center text-sm font-extrabold text-primaryDark">{{ item.quantity }}</span>
                          <button type="button" (click)="cart.updateQuantity(item, 1)" [attr.aria-label]="language.t('زيادة كمية', 'Increase quantity') + ' ' + (language.isEnglish() ? item.product.nameEn : item.product.nameAr)" class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white shadow-sm transition hover:bg-primaryDark">+</button>
                        </div>
                        <div class="text-end">
                          <p class="text-[10px] font-semibold text-gray-400">{{ language.t('إجمالي الصنف', 'Item total') }}</p>
                          <p class="mt-0.5 text-base font-black text-primaryDark">{{ item.totalPrice }} <span class="text-xs font-bold text-gray-500">{{ language.isEnglish() ? 'AED' : 'درهم' }}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              }

              <a routerLink="/menu" class="inline-flex items-center gap-2 rounded-xl px-2 py-3 text-sm font-bold text-primaryDark transition hover:text-primary">
                <span aria-hidden="true">{{ language.isEnglish() ? '←' : '→' }}</span>{{ language.t('إضافة أصناف أخرى', 'Add more items') }}
              </a>
            </div>

            <aside class="overflow-hidden rounded-[1.8rem] border border-orange-100 bg-white shadow-[0_28px_72px_-38px_rgba(104,55,18,.52)] lg:sticky lg:top-24 lg:col-span-5">
              <div class="relative overflow-hidden bg-gradient-to-br from-[#9f3f0d] via-[#b94c10] to-[#d26015] px-5 py-5 text-white sm:px-6">
                <div class="pointer-events-none absolute -end-8 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl"></div>
                <div class="relative flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl ring-1 ring-white/20" aria-hidden="true">🧾</span>
                    <div>
                      <p class="text-xs font-semibold text-orange-100">{{ language.t('تفاصيل طلبك', 'Order details') }}</p>
                      <h2 class="mt-0.5 font-baloo text-2xl font-black">{{ language.t('ملخص الطلب', 'Order summary') }}</h2>
                    </div>
                  </div>
                  <span class="rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold ring-1 ring-white/20">{{ cart.totalCount() }} {{ language.t('صنف', 'items') }}</span>
                </div>
              </div>
              <div class="space-y-6 p-5 sm:p-6">
                <div class="rounded-2xl bg-[#fffaf5] p-4 sm:p-5">
                  <div class="space-y-3 text-sm">
                    <div class="flex items-center justify-between gap-3 text-gray-600"><span>{{ language.t('عدد المنتجات', 'Items') }}</span><span class="font-bold text-gray-900">{{ cart.totalCount() }}</span></div>
                    <div class="flex items-center justify-between gap-3 text-gray-600"><span>{{ language.t('المجموع الفرعي', 'Subtotal') }}</span><span class="font-bold text-gray-900">{{ cart.subTotal() }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span></div>
                    <div class="flex items-center justify-between gap-3 text-gray-600"><span>{{ language.t('رسوم التوصيل', 'Delivery fee') }}</span><span class="font-bold text-gray-900">{{ deliveryType() === 'delivery' && selectedZone() ? (selectedZone()?.fee + ' ' + (language.isEnglish() ? 'AED' : 'درهم')) : '—' }}</span></div>
                    <div class="my-1 border-t border-dashed border-orange-200"></div>
                    <div class="flex items-end justify-between gap-3"><span class="font-extrabold text-primaryDark">{{ language.t('الإجمالي', 'Total') }}</span><span class="text-2xl font-black text-primaryDark">{{ cart.totalAmount() }} <span class="text-xs font-bold text-gray-500">{{ language.isEnglish() ? 'AED' : 'درهم' }}</span></span></div>
                  </div>
                </div>

                <div>
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <h3 class="text-sm font-extrabold text-primaryDark">{{ language.t('طريقة الاستلام', 'Fulfillment method') }}</h3>
                    @if (!deliveryType()) { <span class="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600">{{ language.t('اختيار مطلوب', 'Required') }}</span> }
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <button type="button" (click)="setDeliveryType('delivery')" [attr.aria-pressed]="deliveryType() === 'delivery'" [class.border-primary]="deliveryType() === 'delivery'" [class.bg-orange-50]="deliveryType() === 'delivery'" [class.ring-2]="deliveryType() === 'delivery'" [class.ring-orange-100]="deliveryType() === 'delivery'" class="rounded-2xl border border-gray-200 bg-white p-3.5 text-start transition hover:border-orange-200 sm:p-4">
                      <span class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-lg">🚚</span><span class="block text-xs font-extrabold text-primaryDark">{{ language.t('توصيل للعنوان', 'Delivery') }}</span><span class="mt-1 block text-[10px] text-gray-500">{{ language.t('حسب المنطقة', 'By area') }}</span>
                    </button>
                    <button type="button" (click)="setDeliveryType('pickup')" [attr.aria-pressed]="deliveryType() === 'pickup'" [class.border-primary]="deliveryType() === 'pickup'" [class.bg-orange-50]="deliveryType() === 'pickup'" [class.ring-2]="deliveryType() === 'pickup'" [class.ring-orange-100]="deliveryType() === 'pickup'" class="rounded-2xl border border-gray-200 bg-white p-3.5 text-start transition hover:border-orange-200 sm:p-4">
                      <span class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-lg">🏪</span><span class="block text-xs font-extrabold text-primaryDark">{{ language.t('استلام من الفرع', 'Branch pickup') }}</span><span class="mt-1 block text-[10px] text-gray-500">{{ language.t('بدون رسوم توصيل', 'No delivery fee') }}</span>
                    </button>
                  </div>
                </div>

                @if (!deliveryType()) {
                  <p class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">{{ language.t('اختار طريقة الاستلام علشان تكمل بيانات الطلب.', 'Choose a fulfillment method to continue.') }}</p>
                } @else {
                  <div class="space-y-4 border-t border-gray-100 pt-5">
                    <label class="block text-xs font-bold text-gray-700">{{ language.t('اسم العميل', 'Customer name') }} *
                      <input [(ngModel)]="customerName" name="orderCustomerName" required autocomplete="name" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100" [placeholder]="language.t('الاسم الكامل', 'Full name')">
                    </label>
                    <label class="block text-xs font-bold text-gray-700">{{ language.t('رقم الهاتف', 'Phone number') }} *
                      <input [(ngModel)]="customerPhone" name="orderCustomerPhone" required autocomplete="tel" type="tel" dir="ltr" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-3 text-left text-sm outline-none transition placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100" [placeholder]="language.t('05xxxxxxxx', 'Phone number')">
                    </label>
                    @if (deliveryType() === 'delivery') {
                      <label class="block text-xs font-bold text-gray-700">{{ language.t('الإمارة', 'Emirate') }} *
                        <select [(ngModel)]="selectedEmirate" name="deliveryEmirate" (ngModelChange)="onEmirateChange()" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-orange-100">
                          <option value="">{{ language.t('اختر الإمارة', 'Choose an emirate') }}</option>
                          @for (emirate of emirates; track emirate) { <option [value]="emirate">{{ language.isEnglish() ? emirateNameEn(emirate) : emirate }}</option> }
                        </select>
                      </label>
                      <label class="block text-xs font-bold text-gray-700">{{ language.t('المنطقة', 'Area') }} *
                        <select [(ngModel)]="selectedZoneId" name="deliveryZone" (ngModelChange)="onZoneChange()" [disabled]="!selectedEmirate || zonesLoading() || zonesLoadError()" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-orange-100 disabled:bg-gray-100">
                          <option value="">{{ zonesLoading() ? language.t('جارٍ تحميل المناطق…', 'Loading areas…') : language.t('اختر المنطقة', 'Choose an area') }}</option>
                          @for (zone of emirateZones(); track zone.id) { <option [value]="zone.id" [disabled]="!zone.enabled">{{ zoneLabel(zone) }} — {{ zone.enabled ? (zone.fee + ' ' + (language.isEnglish() ? 'AED' : 'درهم')) : language.t('غير متاحة', 'Unavailable') }}</option> }
                        </select>
                        @if (zonesLoadError()) { <span role="alert" class="mt-1 block text-rose-600">{{ language.t('تعذر تحميل مناطق التوصيل. حدّث الصفحة أو حاول بعد قليل.', 'Could not load delivery areas. Refresh or try again shortly.') }}</span> } @else if (selectedEmirate && !zonesLoading() && availableZones().length === 0) { <span class="mt-1 block text-amber-700">{{ language.t('لا توجد منطقة مفعّلة للتوصيل في هذه الإمارة حالياً.', 'No delivery area is enabled in this emirate right now.') }}</span> }
                      </label>
                      <div class="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/80 to-white p-4">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                          <div class="flex min-w-0 items-start gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">📍</span><div class="min-w-0"><p class="text-sm font-extrabold text-primaryDark">{{ language.t('موقع التوصيل', 'Delivery location') }}</p>
                            @if (locationService.selectedCoordinates(); as savedCoords) { <p class="mt-1 truncate text-xs font-semibold text-gray-700">{{ locationService.selectedLocation() }}</p><p class="mt-1 text-[10px] font-bold text-emerald-700">✓ {{ language.t('تم حفظ الموقع', 'Location saved') }}</p> }
                            @else { <p class="mt-1 text-xs leading-5 text-gray-500">{{ language.t('حدد نقطة التوصيل على الخريطة', 'Pin your delivery spot on the map') }}</p> }
                          </div></div>
                          <button type="button" (click)="openAddressPicker()" class="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-primaryDark shadow-sm ring-1 ring-orange-200 transition hover:bg-orange-50"><span aria-hidden="true">📍</span>{{ language.t('حدد موقعك', 'Set location') }}</button>
                        </div>
                      </div>
                      @if (selectedZone()) {
                        <label class="block text-xs font-bold text-gray-700">{{ language.t('تفاصيل إضافية للعنوان (شارع، مبنى، شقة)', 'Address details (street, building, apartment)') }}
                          <textarea [(ngModel)]="addressDetails" name="deliveryAddressDetails" rows="2" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100" [placeholder]="language.t('رقم المبنى أو الشقة أو تفاصيل الوصول', 'Building, apartment, or delivery details')"></textarea>
                        </label>
                        <p class="rounded-xl bg-gray-50 px-3 py-2 text-[11px] text-gray-600">{{ language.t('رسوم التوصيل:', 'Delivery fee:') }} <strong class="text-primaryDark">{{ selectedZone()?.fee }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</strong></p>
                      }
                    }
                    <label class="block text-xs font-bold text-gray-700">{{ language.t('ملاحظات إضافية', 'Additional notes') }} <span class="font-normal text-gray-400">({{ language.t('اختياري', 'optional') }})</span>
                      <textarea [(ngModel)]="customerNotes" name="orderNotes" rows="2" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100" [placeholder]="language.t('أي تفاصيل تحب تضيفها', 'Add any extra details')"></textarea>
                    </label>
                    <p class="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-[11px] leading-5 text-emerald-800"><span aria-hidden="true">✓</span>{{ language.t('الدفع نقداً عند الاستلام أو من الفرع. هتراجع الطلب على واتساب بعد التأكيد.', 'Pay cash on delivery or at the branch. Review your order on WhatsApp after confirming.') }}</p>
                    @if (errorMessage()) { <p role="alert" class="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-700">{{ errorMessage() }}</p> }
                    <button type="button" (click)="buyNow()" [disabled]="isSubmitting()" class="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#16834b] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-[#116b3d] active:translate-y-0 disabled:cursor-wait disabled:opacity-50">
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
  private notifications = inject(NotificationService);
  language = inject(LanguageService);
  locationService = inject(LocationService);
  readonly emirates = ['أبوظبي', 'دبي', 'الشارقة', 'عجمان', 'أم القيوين', 'رأس الخيمة', 'الفجيرة'];
  zones = signal<DeliveryZone[]>(DEFAULT_DELIVERY_ZONES);
  zonesLoading = signal(true);
  zonesLoadError = signal(false);
  emirateNameEn(name: string): string { return ({ 'أبوظبي': 'Abu Dhabi', 'دبي': 'Dubai', 'الشارقة': 'Sharjah', 'عجمان': 'Ajman', 'أم القيوين': 'Umm Al Quwain', 'رأس الخيمة': 'Ras Al Khaimah', 'الفجيرة': 'Fujairah' } as Record<string, string>)[name] || name; }
  zoneLabel(zone: DeliveryZone): string { return this.language.isEnglish() ? (zone.nameEn || this.emirateNameEn(zone.name)) : zone.name; }
  // These values depend on regular ngModel fields, not signals. Methods ensure they are
  // recalculated whenever the customer changes the emirate or area.
  emirateZones(): DeliveryZone[] { return this.zones().filter(zone => this.normalizeName(zone.emirate) === this.normalizeName(this.selectedEmirate)); }
  availableZones(): DeliveryZone[] { return this.emirateZones().filter(zone => zone.enabled); }
  selectedZone(): DeliveryZone | null { return this.availableZones().find(zone => zone.id === this.selectedZoneId) ?? null; }
  private normalizeName(value: string): string { return (value || '').normalize('NFKC').replace(/[\u0640\u064B-\u065F\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/\s+/g, ' ').trim().toLocaleLowerCase(); }
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
      this.zonesLoading.set(false);
      this.zonesLoadError.set(false);
      this.onZoneChange();
    }, error: () => {
      this.zonesLoading.set(false);
      this.zonesLoadError.set(true);
      this.notifications.show(this.language.t('تعذر تحميل مناطق التوصيل من الخادم.', 'Could not load delivery areas from the server.'), 'error');
    } });
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
    this.errorMessage.set('');
  }

  onZoneChange() {
    const zone = this.selectedZone();
    this.cart.setDeliveryFee(zone?.fee ?? 0);
    this.errorMessage.set('');
  }

  async removeCartItem(item: CartItem) {
    const label = this.language.isEnglish() ? (item.product.nameEn || item.product.nameAr) : item.product.nameAr;
    const confirmed = await this.notifications.confirm(this.language.t(`حذف «${label}» من السلة؟`, `Remove “${label}” from your cart?`));
    if (!confirmed) return;
    this.cart.removeItem(item);
    this.notifications.show(this.language.t('تم حذف المنتج من السلة.', 'Item removed from cart.'), 'success');
  }

  async clearCart() {
    const confirmed = await this.notifications.confirm(this.language.t('هل تريد إفراغ السلة بالكامل؟', 'Clear all items from your cart?'));
    if (!confirmed) return;
    this.cart.clear();
    this.notifications.show(this.language.t('تم إفراغ السلة.', 'Cart cleared.'), 'success');
  }

  private showError(message: string) {
    this.errorMessage.set(message);
    this.notifications.show(message, 'error');
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
    if (!deliveryType) { this.showError(this.language.t('اختار توصيل أو استلام من الفرع أولاً.', 'Choose delivery or branch pickup first.')); return; }
    if (!name || !phone) { this.showError(this.language.t('اكتب اسم العميل ورقم الهاتف أولاً.', 'Enter your name and phone number first.')); return; }
    if (!this.cart.items().length) { this.showError(this.language.t('السلة فارغة.', 'Your cart is empty.')); return; }
    if (deliveryType === 'delivery' && this.zonesLoadError()) { this.showError(this.language.t('تعذر تحميل المناطق. حاول مرة أخرى بعد تحديث الصفحة.', 'Delivery areas failed to load. Refresh and try again.')); return; }
    if (deliveryType === 'delivery' && (!zone || this.latitude() === null || this.longitude() === null)) {
      this.showError(this.language.t('اختر الإمارة والمنطقة المتاحة وحدد عنوانك على الخريطة.', 'Choose an available emirate and area, then set your address on the map.')); return;
    }

    const whatsappWindow = window.open('about:blank', '_blank');
    if (!whatsappWindow) { this.showError(this.language.t('اسمح بفتح النوافذ المنبثقة لإكمال الطلب. لم يتم مسح السلة.', 'Allow pop-ups to continue. Your cart has not been cleared.')); return; }
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
        this.notifications.show(this.language.t(`تم حفظ الطلب رقم ${order.orderNumber || order.orderId} بنجاح.`, `Order ${order.orderNumber || order.orderId} was saved successfully.`), 'success');
      },
      error: (error) => {
        whatsappWindow.close();
        this.isSubmitting.set(false);
        this.showError(this.language.isEnglish() ? 'The order could not be saved. Your cart is unchanged. Please try again.' : (error?.error?.message || 'تعذر حفظ الطلب على الخادم. بقيت السلة كما هي، حاول مرة أخرى.'));
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
