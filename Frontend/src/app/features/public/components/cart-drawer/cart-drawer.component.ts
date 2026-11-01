import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (cart.isDrawerOpen()) {
      <div class="fixed inset-0 z-50 overflow-hidden">
        
        <!-- Backdrop -->
        <div (click)="cart.toggleDrawer()" class="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"></div>

        <div class="fixed inset-y-0 right-0 max-w-full flex">
          <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
            
            <!-- Header -->
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xl font-bold font-baloo text-primaryDark">سلة المشتريات</span>
                <span class="bg-primary/20 text-primaryDark text-xs font-bold px-2 py-0.5 rounded-full">
                  {{ cart.totalCount() }} أصناف
                </span>
              </div>
              <button (click)="cart.toggleDrawer()" class="p-2 text-gray-400 hover:text-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <!-- Items List -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              @if (cart.items().length === 0) {
                <div class="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
                  <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl">🛒</div>
                  <p class="font-bold text-gray-600">سلتك فارغة حالياً</p>
                  <p class="text-xs">أضف بعض الفطائر والمعجنات الشهية من المنيو!</p>
                </div>
              } @else {
                @for (item of cart.items(); track item.product.productId + (item.selectedVariant?.variantId || 0)) {
                  <div class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-gray-100 shadow-xs">
                    <div class="flex items-center gap-3">
                      <img [src]="item.product.imageUrl || 'assets/MAIN.jpg'" class="w-16 h-16 rounded-xl object-cover">
                      <div>
                        <h4 class="font-bold text-sm text-gray-800">{{ item.product.nameAr }}</h4>
                        @if (item.selectedVariant) {
                          <span class="text-[11px] text-gray-400 font-medium">({{ item.selectedVariant.nameAr }})</span>
                        }
                        @if (item.specialInstructions) { <div class="text-[10px] text-gray-500 mt-1">ملاحظة: {{ item.specialInstructions }}</div> }
                        <div class="text-xs font-bold text-primary mt-0.5">{{ item.unitPrice }} درهم</div>
                      </div>
                    </div>

                    <!-- Quantity controls -->
                    <div class="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-gray-200">
                      <button (click)="cart.updateQuantity(item, -1)" class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 font-bold">-</button>
                      <span class="text-xs font-bold w-4 text-center">{{ item.quantity }}</span>
                      <button (click)="cart.updateQuantity(item, 1)" class="w-6 h-6 flex items-center justify-center text-primary font-bold">+</button>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Footer & Checkout -->
            @if (cart.items().length > 0) {
              <div class="p-6 border-t border-gray-100 bg-[#faf7f2] space-y-3">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>المجموع الفرعي</span>
                  <span>{{ cart.subTotal() }} درهم</span>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                  <span>رسوم التوصيل</span>
                  <span>{{ cart.deliveryFee() }} درهم</span>
                </div>
                <div class="flex justify-between text-base font-black text-primaryDark pt-2 border-t border-gray-200">
                  <span>الإجمالي الكلي</span>
                  <span>{{ cart.totalAmount() }} درهم</span>
                </div>

                <a 
                  routerLink="/checkout" 
                  (click)="cart.toggleDrawer()"
                  class="block w-full text-center py-3.5 rounded-2xl bg-primary hover:bg-primaryHover text-white font-bold text-sm shadow-lg transition-transform active:scale-95">
                  متابعة إتمام الطلب
                </a>
              </div>
            }

          </div>
        </div>
      </div>
    }
  `
})
export class CartDrawerComponent {
  cart = inject(CartService);
}
