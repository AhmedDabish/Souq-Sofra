import { Component, Input, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductVariant } from '../../../../core/models/models';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div dir="rtl" class="rounded-xl bg-card text-card-foreground border-0 shadow-none group product-card h-full flex flex-col">
      <div class="inset-0 z-0 flex flex-col h-full rounded-[inherit]">
        
        <!-- Product Image & Media Overlays -->
        <div class="flex flex-col space-y-1.5 p-0 relative rounded-[inherit]">
          <div class="relative w-full max-md:aspect-square aspect-[4/3] overflow-hidden group/image cursor-pointer img-card-wrap">
            <img 
              [src]="imageUrl(product.imageUrl)" 
              [alt]="product.nameAr" 
              loading="lazy" 
              decoding="async" 
              class="object-cover transform transition-transform duration-700 ease-out group-hover:scale-110 w-full h-full" />

            <!-- Wishlist Heart Button -->
            <button 
              type="button"
              (click)="toggleWishlist($event)"
              aria-label="Add to wishlist" 
              [class]="isWishlisted() ? 'bg-white text-red-500 shadow-md' : 'text-white hover:text-primaryDark hover:bg-white bg-white/30'"
              class="cursor-pointer absolute max-md:top-2 max-md:left-2 top-4 left-4 backdrop-blur-sm max-md:p-1.5 p-2 rounded-full transition-colors border border-white/50 z-20">
              <svg 
                class="lucide lucide-heart max-md:w-4 max-md:h-4 w-5 h-5" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                [attr.fill]="isWishlisted() ? 'currentColor' : 'none'"
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round">
                <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"></path>
              </svg>
            </button>

            <!-- Quick View Eye Overlay on Hover -->
            <div class="absolute inset-0 bg-[#b3b18a]/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <button 
                type="button"
                (click)="openQuickView($event)"
                aria-label="عرض سريع" 
                class="bg-white text-primary p-2.5 rounded-full shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110 relative z-20 cursor-pointer" 
                title="عرض سريع">
                <svg class="lucide lucide-eye cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>

            <!-- Badges (Discount & Featured) -->
            <div class="items-center absolute max-md:top-2 max-md:right-2 top-4 right-4 z-10 flex flex-wrap justify-start gap-1.5 max-w-[70%]">
              @if (discountPercent()) {
                <div class="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm backdrop-blur-sm border border-white/20">
                  خصم {{ discountPercent() }}%
                </div>
              }
              @if (product.isFeatured) {
                <div class="text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm text-white backdrop-blur-sm border border-white/20 flex items-center justify-center" style="background-color:rgb(251, 44, 54)">
                  مميز ⭐
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="flex flex-col justify-between flex-1">
          <div class="max-md:p-3 p-4">
            <div class="flex items-center justify-start gap-2 max-md:mb-1.5 mb-2">
              <h3 class="theme-text !font-extrabold pro-title">
                {{ product.nameAr }}
              </h3>
            </div>
            <div class="max-md:text-xs text-sm text-muted font-normal max-md:mb-2 mb-2 leading-relaxed text-start line-clamp-2 max-md:min-h-[2.5rem] min-h-[3rem]">
              <p>{{ product.descriptionAr || 'محضر طازج يومياً بمكونات نقية ووصفات تقليدية شهية ومذاق لا يُنسى.' }}</p>
            </div>

            <!-- Variant Selector Pills -->
            @if (product.variants && product.variants.length > 1) {
              <div class="flex flex-wrap gap-1.5 mb-2">
                @for (v of product.variants; track v.variantId) {
                  <button 
                    type="button"
                    (click)="selectVariant(v, $event)"
                    [class]="selectedVariant?.variantId === v.variantId ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    class="text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer">
                    {{ v.nameAr }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Price & Action Button -->
          <div class="max-md:p-3 max-md:pt-0 p-4 pt-0 flex items-center justify-between flex-wrap gap-2">
            <div class="flex flex-col gap-0.5 min-w-0">
              <div class="flex items-center gap-1">
                <span class="theme-text font-bold text-lg">
                  {{ currentPrice() }}
                </span>
                <span class="text-[12px] text-muted font-medium">
                  درهم
                </span>
              </div>
              @if (hasDiscount()) {
                <span class="text-xs text-[#C92127] line-through font-medium flex items-center gap-1">
                  <span>{{ originalPrice() }}</span>
                  <span>درهم</span>
                </span>
              }
            </div>

            <!-- Add to Cart CTA -->
            <button 
              type="button"
              (click)="addToCart($event)"
              aria-label="أضف إلى السلة"
              [class.scale-90]="addedAnimation()"
              class="flex items-center justify-center bg-button border md:border-2 border-button p-2 cursor-pointer rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-primary/20 text-white"
              title="أضف إلى السلة">
              @if (addedAnimation()) {
                <svg class="size-5 text-white" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              } @else {
                <svg class="size-5 text-white stroke-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              }
            </button>
          </div>
        </div>

      </div>

      <!-- Quick View Modal -->
      @if (showQuickViewModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" (click)="closeQuickView($event)">
          <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative" (click)="$event.stopPropagation()">
            <button (click)="showQuickViewModal.set(false)" class="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors">
              ✕
            </button>
            <div class="relative aspect-[16/10] bg-orange-50 overflow-hidden">
              <img [src]="imageUrl(product.imageUrl)" [alt]="product.nameAr" class="w-full h-full object-cover">
              @if (discountPercent()) {
                <span class="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  خصم {{ discountPercent() }}%
                </span>
              }
            </div>
            <div class="p-6">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-xl font-black font-baloo text-primaryDark">{{ product.nameAr }}</h3>
                @if (product.isFeatured) {
                  <span class="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">مميز ⭐</span>
                }
              </div>
              <p class="text-xs text-gray-500 mb-4 leading-relaxed">{{ product.descriptionAr || 'محضر طازج يومياً بأجود المكونات الطبيعية.' }}</p>
              
              @if (product.variants && product.variants.length > 1) {
                <div class="mb-4">
                  <label class="block text-xs font-bold text-gray-700 mb-2">اختر الحجم أو الخيار:</label>
                  <div class="flex flex-wrap gap-2">
                    @for (v of product.variants; track v.variantId) {
                      <button 
                        type="button"
                        (click)="selectedVariant = v"
                        [class]="selectedVariant?.variantId === v.variantId ? 'bg-primary text-white border-primary shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'"
                        class="text-xs font-bold px-3 py-1.5 rounded-xl border transition-all">
                        {{ v.nameAr }} ({{ v.price }} درهم)
                      </button>
                    }
                  </div>
                </div>
              }

              <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                <div>
                  <span class="text-xs text-gray-400 block">السعر الإجمالي</span>
                  <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-black text-primaryDark">{{ currentPrice() }}</span>
                    <span class="text-xs font-bold text-primary">درهم</span>
                  </div>
                </div>
                <button 
                  type="button"
                  (click)="addFromQuickView()"
                  class="px-6 py-3 rounded-2xl bg-primary hover:bg-primaryDark text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2">
                  <span>أضف إلى السلة</span>
                  <span>🛒</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductCardComponent implements OnInit {
  @Input({ required: true }) product!: Product;
  selectedVariant?: ProductVariant;

  cart = inject(CartService);

  isWishlisted = signal<boolean>(false);
  showQuickViewModal = signal<boolean>(false);
  addedAnimation = signal<boolean>(false);

  ngOnInit() {
    if (this.product.variants && this.product.variants.length > 0) {
      this.selectedVariant = this.product.variants[0];
    }
  }

  imageUrl(url?: string): string {
    if (!url) return 'assets/MAIN.jpg';
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/') || url.startsWith('data:')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }

  currentPrice = computed(() => {
    if (this.selectedVariant) return this.selectedVariant.price;
    return this.product.discountPrice ?? this.product.basePrice;
  });

  hasDiscount = computed(() => {
    if (this.selectedVariant && !this.selectedVariant.isDefault) return false;
    return !!this.product.discountPrice && this.product.discountPrice < this.product.basePrice;
  });

  originalPrice = computed(() => this.product.basePrice);

  discountPercent = computed(() => {
    if (!this.product.discountPrice || this.product.discountPrice >= this.product.basePrice) return null;
    const diff = this.product.basePrice - this.product.discountPrice;
    return Math.round((diff / this.product.basePrice) * 100);
  });

  selectVariant(v: ProductVariant, e: Event) {
    e.stopPropagation();
    this.selectedVariant = v;
  }

  addToCart(e?: Event) {
    if (e) e.stopPropagation();
    this.cart.addItem(this.product, this.selectedVariant, 1);
    this.addedAnimation.set(true);
    setTimeout(() => this.addedAnimation.set(false), 900);
  }

  toggleWishlist(e: Event) {
    e.stopPropagation();
    this.isWishlisted.update(v => !v);
  }

  openQuickView(e: Event) {
    e.stopPropagation();
    this.showQuickViewModal.set(true);
  }

  closeQuickView(e: Event) {
    e.stopPropagation();
    this.showQuickViewModal.set(false);
  }

  addFromQuickView() {
    this.cart.addItem(this.product, this.selectedVariant, 1);
    this.showQuickViewModal.set(false);
  }
}
