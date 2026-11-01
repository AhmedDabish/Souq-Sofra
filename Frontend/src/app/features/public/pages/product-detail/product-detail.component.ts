import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product, ProductVariant } from '../../../../core/models/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container-wide mx-auto px-4 py-8 md:py-12" dir="rtl">
      @if (product(); as item) {
        <a routerLink="/" class="text-sm text-gray-500 hover:text-primary">الرئيسية / منيو سوق وسفرة / {{ item.nameAr }}</a>
        <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 mt-5 items-start">
          <div class="rounded-3xl overflow-hidden bg-[#f7f3ed] aspect-square relative">
            <img [src]="imageUrl(item.imageUrl)" [alt]="item.nameAr" class="w-full h-full object-cover">
            @if (discountPercent()) { <span class="absolute top-4 right-4 rounded-full bg-red-500 text-white px-3 py-1 text-sm font-bold">خصم {{ discountPercent() }}%</span> }
          </div>
          <section class="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-2xl md:text-3xl font-black text-primaryDark">{{ item.nameAr }}</h1>
              @if (!item.isAvailable) { <span class="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs">غير متاح حالياً</span> }
              @else { <span class="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs">متوفر</span> }
            </div>
            <p class="text-gray-500 text-sm leading-7 mt-4">{{ item.descriptionAr || 'طازج ومحضر يومياً بمكونات مختارة.' }}</p>
            <div class="flex items-baseline gap-3 my-5">
              <strong class="text-2xl text-primary">{{ currentPrice() }} درهم</strong>
              @if (discountPercent()) { <del class="text-gray-400">{{ item.basePrice }} درهم</del> }
            </div>
            @if (item.variants.length) {
              <div class="my-6">
                <h2 class="font-bold mb-3">اختيارك من الحجم</h2>
                <div class="grid sm:grid-cols-2 gap-3">
                  @for (variant of item.variants; track variant.variantId ?? variant.nameAr) {
                    <button type="button" (click)="selectedVariant.set(variant)" [class.border-primary]="selectedVariant() === variant" [class.bg-orange-50]="selectedVariant() === variant" class="text-right rounded-xl border border-gray-200 p-4 hover:border-primary transition-colors">
                      <span class="block font-bold">{{ variant.nameAr }}</span><span class="text-sm text-primary">{{ variant.price }} درهم</span>
                    </button>
                  }
                </div>
              </div>
            }
            <div class="my-6">
              <label for="special-notes" class="font-bold block mb-2">تعليمات خاصة</label>
              <textarea id="special-notes" rows="3" [(ngModel)]="specialInstructions" class="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-primary" placeholder="أضف ملاحظاتك للطلب"></textarea>
            </div>
            <div class="sticky bottom-2 bg-white pt-4 border-t flex items-center gap-4">
              <div class="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                <button type="button" (click)="decreaseQuantity()" aria-label="تقليل الكمية" class="w-8 h-8 font-bold">−</button><span class="font-bold min-w-5 text-center">{{ quantity() }}</span><button type="button" (click)="increaseQuantity()" aria-label="زيادة الكمية" class="w-8 h-8 font-bold">+</button>
              </div>
              <button type="button" [disabled]="!item.isAvailable" (click)="addToCart(item)" class="flex-1 rounded-full bg-primary text-white font-bold py-3 disabled:opacity-50">إضافة للسلة <span>({{ totalPrice() }} درهم)</span></button>
            </div>
          </section>
        </div>
        @if (recommendations().length) {
          <section class="mt-12"><h2 class="text-xl font-bold mb-4">قد يعجبك أيضاً</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (suggestion of recommendations(); track suggestion.productId) {
              <a [routerLink]="['/product', suggestion.productId]" class="rounded-2xl border border-gray-100 overflow-hidden bg-white hover:shadow-md transition-shadow"><img [src]="imageUrl(suggestion.imageUrl)" [alt]="suggestion.nameAr" class="w-full aspect-square object-cover"><div class="p-3"><b class="block truncate">{{ suggestion.nameAr }}</b><span class="text-primary text-sm">{{ suggestion.discountPrice || suggestion.basePrice }} درهم</span></div></a>
            }
          </div></section>
        }
      } @else {
        <div class="py-24 text-center text-gray-500">{{ loading() ? 'جاري تحميل المنتج...' : 'المنتج غير موجود' }}</div>
      }
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cart = inject(CartService);
  product = signal<Product | null>(null);
  allProducts = signal<Product[]>([]);
  selectedVariant = signal<ProductVariant | undefined>(undefined);
  quantity = signal(1);
  specialInstructions = '';
  loading = signal(true);
  currentPrice = computed(() => {
    const product = this.product();
    const variant = this.selectedVariant();
    if (!product) return 0;
    if (variant) {
      if (product.discountPrice && product.discountPrice < product.basePrice && variant.isDefault) {
        return Math.round(variant.price * product.discountPrice / product.basePrice * 100) / 100;
      }
      return variant.price;
    }
    return product.discountPrice ?? product.basePrice;
  });
  totalPrice = computed(() => this.currentPrice() * this.quantity());
  discountPercent = computed(() => { const p = this.product(); return p?.discountPrice && p.discountPrice < p.basePrice ? Math.round(100 * (p.basePrice - p.discountPrice) / p.basePrice) : 0; });
  recommendations = computed(() => this.allProducts().filter(p => p.productId !== this.product()?.productId).slice(0, 4));

  ngOnInit() {
    this.api.getProducts().subscribe({ next: products => {
      this.allProducts.set(products);
      this.route.paramMap.subscribe(params => {
        const id = Number(params.get('id'));
        const found = products.find(p => p.productId === id) ?? null;
        this.product.set(found);
        this.selectedVariant.set(found?.variants?.find(v => v.isDefault) ?? found?.variants?.[0]);
        this.loading.set(false);
      });
    }, error: () => this.loading.set(false) });
  }
  imageUrl(url?: string) { if (!url) return 'assets/MAIN.jpg'; return /^https?:\/\//i.test(url) || url.startsWith('assets/') ? url : `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`; }
  decreaseQuantity() { this.quantity.update(value => Math.max(1, value - 1)); }
  increaseQuantity() { this.quantity.update(value => value + 1); }
  addToCart(product: Product) { this.cart.addItem(product, this.selectedVariant(), this.quantity(), this.specialInstructions); }
}
