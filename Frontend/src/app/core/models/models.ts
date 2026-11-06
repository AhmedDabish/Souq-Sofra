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
  catalogTemplateId?: number;
}

export interface AddonTemplate {
  addonTemplateId: number;
  nameAr: string;
  nameEn: string;
  price: number;
  isAvailable: boolean;
  scopeType: 'All' | 'Category' | 'Product';
  categoryId?: number;
  productId?: number;
}

export interface AddonTemplateCreate {
  nameAr: string;
  nameEn: string;
  price: number;
  isAvailable: boolean;
  scopeType: 'All' | 'Category' | 'Product';
  categoryId?: number;
  productId?: number;
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
  isManuallyBestSelling?: boolean;
  completedSalesQuantity?: number;
  variants: ProductVariant[];
  addons: ProductAddon[];
  averageRating?: number;
  reviewCount?: number;
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
  isManuallyBestSelling?: boolean;
  variants?: ProductVariant[];
  addons?: ProductAddon[];
  catalogAddonIds?: number[];
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

export interface DeliveryZone {
  id: string;
  emirate: string;
  emirateEn?: string;
  name: string;
  nameEn?: string;
  fee: number;
  enabled: boolean;
}

export interface OrderCreate {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  branchId: number;
  deliveryType: 'delivery' | 'pickup';
  deliveryZoneId?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  paymentMethod: string;
  notes?: string;
  items: OrderItemCreate[];
  orderChannel?: 'Website' | 'WhatsApp';
}

export interface OrderItemAddon {
  addonId: number;
  nameAr: string;
  nameEn: string;
  price: number;
}

export interface OrderItem {
  orderItemId: number;
  productId: number;
  variantId?: number;
  productNameAr: string;
  productNameEn: string;
  variantNameAr?: string;
  variantNameEn?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  addons?: OrderItemAddon[];
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
  orderChannel: 'Website' | 'WhatsApp' | string;
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
  AnnouncementEn?: string;
  PhoneNumber?: string;
  WhatsApp?: string;
  DeliveryFee?: string;
  DeliveryZones?: string;
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
  permissions?: string[];
}

export interface PermissionDefinition {
  key: string;
  group: string;
  groupEn: string;
  label: string;
  labelEn: string;
}

export interface StaffUser {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'User' | 'Admin' | 'SuperAdmin' | string;
  isActive: boolean;
  createdAt: string;
  permissions: string[];
}

export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

export interface RestaurantReview {
  reviewId: number;
  customerName: string;
  rating: number;
  comment: string;
  avatarUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

export interface ProductReview {
  productReviewId: number;
  productId: number;
  customerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ProductReviewCreate {
  productId: number;
  customerName: string;
  rating: number;
  comment?: string;
}

export interface ProductReviewsSummary {
  productId: number;
  averageRating: number;
  totalReviews: number;
  reviews: ProductReview[];
}
