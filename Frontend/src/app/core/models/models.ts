export interface Category {
  categoryId: number;
  nameAr: string;
  nameEn: string;
  slug: string;
  iconUrl?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive?: boolean;
}

export interface CategoryCreate {
  nameAr: string;
  nameEn: string;
  slug?: string;
  iconUrl?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ProductAddon {
  addonId?: number;
  nameAr: string;
  nameEn: string;
  price: number;
}

export interface ProductVariant {
  variantId?: number;
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
  addons: ProductAddon[];
}

export interface ProductCreate {
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
  variants?: ProductVariant[];
  addons?: ProductAddon[];
}

export interface CartItem {
  product: Product;
  selectedVariant?: ProductVariant;
  selectedAddons: ProductAddon[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface OrderItemCreate {
  productId: number;
  variantId?: number;
  quantity: number;
  unitPrice: number;
  addonIds?: number[];
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

export interface OrderItem {
  orderItemId: number;
  productId: number;
  variantId?: number;
  productNameAr: string;
  productNameEn: string;
  variantNameAr?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface AdminOrder {
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  branchId: number;
  subTotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  orderStatus: 'Pending' | 'Preparing' | 'OutForDelivery' | 'Completed' | string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface Branch {
  branchId: number;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  whatsApp: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

export interface SiteSettings {
  Announcement?: string;
  PhoneNumber?: string;
  WhatsApp?: string;
  DeliveryFee?: string;
  MinOrderAmount?: string;
  WorkingHours?: string;
  VATPercentage?: string;
  [key: string]: string | undefined;
}

export interface LoginResponse {
  token: string;
  fullName: string;
  email: string;
  role: string;
  expiresAt: string;
}

export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
}
