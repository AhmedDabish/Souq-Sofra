import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product, ProductVariant } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSignal = signal<CartItem[]>([]);
  public isDrawerOpen = signal<boolean>(false);

  public items = this.itemsSignal.asReadonly();
  
  public subTotal = computed(() => 
    this.itemsSignal().reduce((sum, item) => sum + item.totalPrice, 0)
  );

  public deliveryFee = signal<number>(10); // 10 AED

  public totalAmount = computed(() => this.subTotal() + this.deliveryFee());

  public totalCount = computed(() => 
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );

  addItem(product: Product, variant?: ProductVariant, quantity: number = 1) {
    const current = [...this.itemsSignal()];
    const price = variant ? variant.price : (product.discountPrice || product.basePrice);
    
    const existingIndex = current.findIndex(i => 
      i.product.productId === product.productId && 
      i.selectedVariant?.variantId === variant?.variantId
    );

    if (existingIndex > -1) {
      current[existingIndex].quantity += quantity;
      current[existingIndex].totalPrice = current[existingIndex].quantity * price;
    } else {
      current.push({
        product,
        selectedVariant: variant,
        quantity,
        unitPrice: price,
        totalPrice: price * quantity
      });
    }

    this.itemsSignal.set(current);
    this.isDrawerOpen.set(true);
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
      current[index].totalPrice = newQty * current[index].unitPrice;
    }
    this.itemsSignal.set(current);
  }

  removeItem(item: CartItem) {
    this.itemsSignal.set(this.itemsSignal().filter(i => i !== item));
  }

  clear() {
    this.itemsSignal.set([]);
  }

  toggleDrawer() {
    this.isDrawerOpen.update(v => !v);
  }
}
