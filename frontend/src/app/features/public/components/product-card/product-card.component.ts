import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductVariant } from '../../../../core/models/models';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl p-4 shadow-xs hover:shadow-xl border border-gray-100 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between group h-full">
      
      <div>
        <!-- Product Image Placeholder or Thumbnail -->
        <div class="relative w-full aspect-square rounded-2xl bg-[#f5efe6] overflow-hidden mb-3 flex items-center justify-center">
          <img [src]="product.imageUrl || 'assets/MAIN.jpg'" [alt]="product.nameAr" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          @if (product.discountPrice) {
            <span class="absolute top-2 right-2 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              عرض خاص
            </span>
          }
        </div>

        <!-- Info -->
        <h3 class="font-bold text-gray-800 text-base mb-1 group-hover:text-primary transition-colors">
          {{ product.nameAr }}
        </h3>
        <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
          {{ product.descriptionAr || 'محضر طازج يومياً بمكونات نقية ووصفات تقليدية شهية.' }}
        </p>

        <!-- Variants selector if available -->
        @if (product.variants.length > 1) {
          <div class="flex gap-1.5 mb-3">
            @for (v of product.variants; track v.variantId) {
              <button 
                (click)="selectedVariant = v"
                [class]="selectedVariant?.variantId === v.variantId ? 'bg-primaryDark text-white' : 'bg-gray-100 text-gray-700'"
                class="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors">
                {{ v.nameAr }}
              </button>
            }
          </div>
        }
      </div>

      <!-- Price & Add Button -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
        <div class="flex flex-col">
          <span class="text-xs text-gray-400">السعر</span>
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-black text-primaryDark">
              {{ selectedVariant ? selectedVariant.price : (product.discountPrice || product.basePrice) }}
            </span>
            <span class="text-xs font-bold text-primary">درهم</span>
          </div>
        </div>

        <button 
          (click)="addToCart()"
          class="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary hover:bg-primaryHover text-white shadow-md active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
      </div>

    </div>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  selectedVariant?: ProductVariant;

  cart = inject(CartService);

  ngOnInit() {
    if (this.product.variants && this.product.variants.length > 0) {
      this.selectedVariant = this.product.variants[0];
    }
  }

  addToCart() {
    this.cart.addItem(this.product, this.selectedVariant, 1);
  }
}
