import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, Product, ProductAddon, ProductVariant } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'souq-sofra-cart-v1';
  private itemsSignal = signal<CartItem[]>(this.readSavedItems());

  constructor() {
    effect(() => {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(this.storageKey, JSON.stringify(this.itemsSignal()));
      } catch { /* Storage can be unavailable in private or quota-limited contexts. */ }
    });
  }

  private readSavedItems(): CartItem[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const value: unknown = JSON.parse(localStorage.getItem('souq-sofra-cart-v1') || '[]');
      if (!Array.isArray(value)) return [];
      return value.filter((item: any) => item && item.product && Number(item.product.productId) > 0 && Number(item.quantity) > 0)
        .map((item: any) => {
          const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
          const addons = Array.isArray(item.selectedAddons) ? item.selectedAddons : [];
          const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
          return { ...item, quantity, unitPrice, selectedAddons: addons, totalPrice: (unitPrice + addons.reduce((sum: number, addon: any) => sum + (Number(addon?.price) || 0), 0)) * quantity } as CartItem;
        });
    } catch { return []; }
  }

  public items = this.itemsSignal.asReadonly();
  
  public subTotal = computed(() => 
    this.itemsSignal().reduce((sum, item) => sum + item.totalPrice, 0)
  );

  public deliveryFee = signal<number>(10); // Updated from the selected delivery zone

  setDeliveryFee(fee: number) { this.deliveryFee.set(Math.max(0, Number(fee) || 0)); }

  public totalAmount = computed(() => this.subTotal() + this.deliveryFee());

  public totalCount = computed(() => 
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );

  addItem(product: Product, variant?: ProductVariant, quantity: number = 1, specialInstructions?: string, addons: ProductAddon[] = []) {
    const current = [...this.itemsSignal()];
    const hasDiscount = !!product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.basePrice;
    const price = variant
      ? (hasDiscount && variant.isDefault
          ? Math.round(variant.price * (product.discountPrice! / product.basePrice) * 100) / 100
          : variant.price)
      : (hasDiscount ? product.discountPrice! : product.basePrice);
    
    const addonKey = addons.map(a => a.addonId).sort().join(',');
    const existingIndex = current.findIndex(i =>
      i.product.productId === product.productId &&
      i.selectedVariant?.variantId === variant?.variantId &&
      i.specialInstructions === (specialInstructions || undefined) &&
      i.selectedAddons.map(a => a.addonId).sort().join(',') === addonKey
    );

    if (existingIndex > -1) {
      current[existingIndex].quantity += quantity;
      current[existingIndex].totalPrice = current[existingIndex].quantity * (current[existingIndex].unitPrice + current[existingIndex].selectedAddons.reduce((sum, addon) => sum + addon.price, 0));
    } else {
      current.push({
        product,
        selectedVariant: variant,
        selectedAddons: [...addons],
        quantity,
        unitPrice: price,
        totalPrice: (price + addons.reduce((sum, addon) => sum + addon.price, 0)) * quantity,
        specialInstructions: specialInstructions?.trim() || undefined
      });
    }

    this.itemsSignal.set(current);
  }

  updateQuantity(item: CartItem, delta: number) {
    const current = [...this.itemsSignal()];
    const index = current.indexOf(item);
    if (index === -1) return;

    const newQty = current[index].quantity + delta;
    if (newQty <= 0) {
      current.splice(index, 1);
    } else {
      current[index].quantity = newQty;
      current[index].totalPrice = newQty * (current[index].unitPrice + current[index].selectedAddons.reduce((sum, addon) => sum + addon.price, 0));
    }
    this.itemsSignal.set(current);
  }

  removeItem(item: CartItem) {
    this.itemsSignal.set(this.itemsSignal().filter(i => i !== item));
  }

  clear() {
    this.itemsSignal.set([]);
  }

}
