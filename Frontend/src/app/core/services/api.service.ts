import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Category, Product, OrderCreate } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Pre-seeded local data for instant offline/mock preview or connectable to .NET API
  private apiUrl = 'https://localhost:7001/api';

  private categories: Category[] = [
    { categoryId: 1, nameAr: 'فطائر البيتزا التركية', nameEn: 'Turkish Pide', slug: 'turkish-pide', iconUrl: 'assets/categories/pide.png', displayOrder: 1 },
    { categoryId: 2, nameAr: 'المناقيش', nameEn: 'Manakeesh', slug: 'manakeesh', iconUrl: 'assets/categories/manakeesh.png', displayOrder: 2 },
    { categoryId: 3, nameAr: 'سندوتشات الراب', nameEn: 'Signature Wraps', slug: 'signature-wraps', iconUrl: 'assets/categories/wraps.png', displayOrder: 3 },
    { categoryId: 4, nameAr: 'المعجنات الصغيرة', nameEn: 'Small Pastries', slug: 'small-pastries', iconUrl: 'assets/categories/pastries.png', displayOrder: 4 },
    { categoryId: 5, nameAr: 'مقبلات وسلطات', nameEn: 'Appetizers & Salads', slug: 'appetizers-salads', iconUrl: 'assets/categories/salads.png', displayOrder: 5 },
    { categoryId: 6, nameAr: 'حواوشي وسندوتشات فينو', nameEn: 'Hawawshi & Veno', slug: 'hawawshi-veno', iconUrl: 'assets/categories/hawawshi.png', displayOrder: 6 },
    { categoryId: 7, nameAr: 'سندوتشات خبز بلدي', nameEn: 'Baladi Sandwiches', slug: 'baladi-sandwiches', iconUrl: 'assets/categories/baladi.png', displayOrder: 7 },
    { categoryId: 8, nameAr: 'سندوتشات ع الماشي', nameEn: 'On The Go Sandwiches', slug: 'on-the-go', iconUrl: 'assets/categories/on-the-go.png', displayOrder: 8 },
    { categoryId: 9, nameAr: 'تشكيلة الخبز الطازج', nameEn: 'Fresh Breads', slug: 'fresh-breads', iconUrl: 'assets/categories/bread.png', displayOrder: 9 },
    { categoryId: 10, nameAr: 'مخبوزات ونواشف 250 جم', nameEn: 'Bakery & Cookies 250g', slug: 'bakery-cookies', iconUrl: 'assets/categories/cookies.png', displayOrder: 10 },
    { categoryId: 11, nameAr: 'بوكسات السلاف والعزائم', nameEn: 'Catering Boxes', slug: 'catering-boxes', iconUrl: 'assets/categories/boxes.png', displayOrder: 11 },
    { categoryId: 12, nameAr: 'منتجات الحبة الكاملة', nameEn: 'Whole Grain Line', slug: 'whole-grain', iconUrl: 'assets/categories/wholegrain.png', displayOrder: 12 },
    { categoryId: 13, nameAr: 'البيتزا', nameEn: 'Pizza', slug: 'pizza', iconUrl: 'assets/categories/pizza.png', displayOrder: 13 },
    { categoryId: 14, nameAr: 'الفطير المشلتت', nameEn: 'Feteer Meshaltet', slug: 'feteer-meshaltet', iconUrl: 'assets/categories/feteer.png', displayOrder: 14 },
    { categoryId: 15, nameAr: 'الفطير الحلو', nameEn: 'Sweet Feteer', slug: 'sweet-feteer', iconUrl: 'assets/categories/sweet-feteer.png', displayOrder: 15 },
  ];

  private products: Product[] = [
    {
      productId: 101, categoryId: 1, nameAr: 'فطيرة جبنة عكاوي تركية', nameEn: 'Turkish Akkawi Cheese Pide',
      descriptionAr: 'عجينة تركية هشة ومخبوزة طازجة مع جبنة العكاوي الغنية وحبة البركة',
      basePrice: 18, isAvailable: true, isFeatured: true,
      variants: [{ variantId: 1, nameAr: 'عادي', nameEn: 'Regular', price: 18, isDefault: true }]
    },
    {
      productId: 102, categoryId: 1, nameAr: 'فطيرة سجق بالجبنة', nameEn: 'Sogok with Cheese Pide',
      descriptionAr: 'سجق بلدي متبل مع خلطة الجبن الذائبة على الطريقة التركية',
      basePrice: 20, isAvailable: true, isFeatured: true,
      variants: [{ variantId: 2, nameAr: 'عادي', nameEn: 'Regular', price: 20, isDefault: true }]
    },
    {
      productId: 301, categoryId: 3, nameAr: 'سوق وسفرة تشيكن راب', nameEn: 'Souq & Sofra Chicken Wrap',
      descriptionAr: 'دجاج متبل مشوي مع صوص خاص وخضروات طازجة في خبز التورتيلا المميز',
      basePrice: 20, isAvailable: true, isFeatured: true,
      variants: []
    },
    {
      productId: 401, categoryId: 6, nameAr: 'حواوشي بلدي مخصوص', nameEn: 'Baladi Hawawshi Special',
      descriptionAr: 'لحم بقري طازج متبل بأسرار خلطة سوق وسفرة في عيش بلدي مقرمش',
      basePrice: 22, isAvailable: true, isFeatured: true,
      variants: []
    },
    {
      productId: 403, categoryId: 6, nameAr: 'سندوتش كبدة اسكندراني', nameEn: 'Alexandrian Liver Sandwich',
      descriptionAr: 'كبدة بلدي طازجة بالفلفل الحار والثوم والليمون',
      basePrice: 15, isAvailable: true, isFeatured: true,
      variants: [
        { variantId: 10, nameAr: 'خبز فينو', nameEn: 'Veno Bread', price: 15, isDefault: true },
        { variantId: 11, nameAr: 'خبز بلدي', nameEn: 'Baladi Bread', price: 15, isDefault: false }
      ]
    },
    {
      productId: 501, categoryId: 14, nameAr: 'فطير مشلتت سمن بلدي (عسل وجبن)', nameEn: 'Baladi Ghee Feteer Meshaltet',
      descriptionAr: 'فطير مشلتت مورق ومقرمش بالسمن الفلاحي الأصلي يقدم مع عسل أبيض وأسود وجبنة قديمة',
      basePrice: 35, isAvailable: true, isFeatured: true,
      variants: [
        { variantId: 20, nameAr: 'حجم وسط', nameEn: 'Medium', price: 35, isDefault: true },
        { variantId: 21, nameAr: 'حجم كبير', nameEn: 'Large', price: 63, isDefault: false }
      ]
    },
    {
      productId: 602, categoryId: 15, nameAr: 'فطير كنافة دبي الفاخر', nameEn: 'Dubai Knafeh Feteer',
      descriptionAr: 'فطير محشو بكريمة الفستق والكنافة المقرمشة مع الشوكولاتة الغنية',
      basePrice: 30, isAvailable: true, isFeatured: true,
      variants: [
        { variantId: 30, nameAr: 'حجم وسط', nameEn: 'Medium', price: 30, isDefault: true },
        { variantId: 31, nameAr: 'حجم كبير', nameEn: 'Large', price: 35, isDefault: false }
      ]
    },
    {
      productId: 701, categoryId: 11, nameAr: 'بوكس ميني مناقيش (25 قطعة)', nameEn: 'Mini Manakeesh Box (25 Pcs)',
      descriptionAr: 'تشكيلة مختارة من ميني مناقيش زعتر، جبن، لحم، وسبانخ للمناسبات والعزائم',
      basePrice: 62, isAvailable: true, isFeatured: true,
      variants: []
    }
  ];

  getCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  getProducts(categoryId?: number): Observable<Product[]> {
    if (categoryId) {
      return of(this.products.filter(p => p.categoryId === categoryId));
    }
    return of(this.products);
  }

  createOrder(order: OrderCreate): Observable<{ success: boolean; orderNumber: string }> {
    return of({
      success: true,
      orderNumber: 'SOFRA-' + Math.floor(100000 + Math.random() * 900000)
    });
  }
}
