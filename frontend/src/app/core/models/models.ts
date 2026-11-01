export interface Category {
  categoryId: number;
  nameAr: string;
  nameEn: string;
  slug: string;
  iconUrl?: string;
  displayOrder: number;
}

export interface ProductVariant {
  variantId: number;
  nameAr: string;
  nameEn: string;
  price: number;
  isDefault: boolean;
}

export interface Product {
  productId: number;
  categoryId: number;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  basePrice: number;
  discountPrice?: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  variants: ProductVariant[];
}

export interface CartItem {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderItemCreate {
  productId: number;
  variantId?: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderCreate {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  branchId: number;
  paymentMethod: string;
  notes?: string;
  items: OrderItemCreate[];
}
