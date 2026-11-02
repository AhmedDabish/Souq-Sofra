import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Branch, SiteSettings } from '../../../../core/models/models';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  template: `
    <div class="admin-shell min-h-screen bg-gray-50 flex font-cairo" dir="rtl">
      
      <!-- Shared Sidebar -->
      <app-admin-sidebar />

      <!-- Main Settings Content -->
      <main class="min-w-0 flex-1 p-5 pt-20 md:p-8 lg:mr-64">
        
        <!-- Header -->
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-black font-baloo text-gray-800">إعدادات المتجر والفروع</h1>
            <p class="text-xs text-gray-400">إدارة معلومات الاتصال، شريط الإعلانات، رسوم التوصيل وفروع المطعم</p>
          </div>
          <button 
            (click)="saveSettings()" 
            [disabled]="isSaving()"
            class="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primaryHover text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto">
            @if (isSaving()) {
              <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            }
            <span>💾 حفظ التغييرات</span>
          </button>
        </header>

        <!-- Feedback Alert -->
        @if (feedbackMessage()) {
          <div [class]="feedbackType() === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'" 
               class="mb-6 p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between">
            <span>{{ feedbackMessage() }}</span>
            <button (click)="feedbackMessage.set('')" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- General Store Configuration -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div class="border-b border-gray-100 pb-4">
              <h2 class="text-base font-bold font-baloo text-gray-800">إعدادات الواجهة والطلبات</h2>
              <p class="text-[11px] text-gray-400">القيم المعروضة للزبائن في المتجر وشريط الإعلانات</p>
            </div>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-gray-700 mb-1">نص شريط الإعلانات العلوي (Announcement Banner)</label>
                <input 
                  type="text" 
                  [(ngModel)]="settings.Announcement" 
                  name="announcement"
                  placeholder="مثال: خصم 15% على الفطير المشلتت لطلبات الأونلاين!"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">رقم هاتف الاتصال الرئيسي</label>
                  <input 
                    type="text" 
                    [(ngModel)]="settings.PhoneNumber" 
                    name="phone"
                    placeholder="02 633 3136"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
                </div>

                <div>
                  <label class="block font-bold text-gray-700 mb-1">رقم خدمة الواتساب</label>
                  <input 
                    type="text" 
                    [(ngModel)]="settings.WhatsApp" 
                    name="whatsapp"
                    placeholder="+971 50 315 7884"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">رسوم التوصيل الافتراضية (درهم)</label>
                  <input 
                    type="text" 
                    [(ngModel)]="settings.DeliveryFee" 
                    name="deliveryFee"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
                </div>

                <div>
                  <label class="block font-bold text-gray-700 mb-1">الحد الأدنى للطلب (درهم)</label>
                  <input 
                    type="text" 
                    [(ngModel)]="settings.MinOrderAmount" 
                    name="minOrder"
                    class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
                </div>
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">ساعات عمل المطعم والتوصيل</label>
                <input 
                  type="text" 
                  [(ngModel)]="settings.WorkingHours" 
                  name="workingHours"
                  placeholder="يومياً من 7:00 ص وحتى 12:00 منتصف الليل"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">نسبة ضريبة القيمة المضافة (VAT %)</label>
                <input 
                  type="text" 
                  [(ngModel)]="settings.VATPercentage" 
                  name="vat"
                  placeholder="5%"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
              </div>
            </div>
          </div>

          <!-- Site logo management -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <div class="border-b border-gray-100 pb-4"><h2 class="text-base font-bold font-baloo text-gray-800">شعار الموقع</h2><p class="text-[11px] text-gray-400">رفع شعار المتجر وحفظه ضمن إعدادات الموقع على الخادم</p></div>
            <div class="flex items-center gap-4"><img [src]="logoPreview()" alt="معاينة شعار الموقع" class="h-24 w-24 rounded-full border bg-orange-50 object-cover"><div><label class="inline-flex cursor-pointer rounded-xl bg-orange-50 px-4 py-3 text-xs font-bold text-orange-800 hover:bg-orange-100">{{ uploadingLogo() ? 'جارٍ الرفع…' : 'اختيار شعار ورفعه' }}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="uploadLogo($event)" class="sr-only"></label><p class="mt-2 text-[10px] text-gray-400">سيتم حفظ مسار الصورة في إعدادات المتجر.</p></div></div>
          </div>

          <!-- Homepage banner management -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <div class="border-b border-gray-100 pb-4">
              <h2 class="text-base font-bold font-baloo text-gray-800">صور واجهة المتجر</h2>
              <p class="text-[11px] text-gray-400">اختيار ورفع صور شرائح الصفحة الرئيسية إلى مجلد wwwroot/uploads/banners</p>
            </div>
            <div class="grid grid-cols-1 gap-4">
              @for (index of [1, 2, 3]; track index) {
                <div class="flex items-center gap-4 rounded-2xl border border-gray-100 p-3">
                  <img [src]="bannerPreview(index)" [alt]="'معاينة الشريحة ' + index" class="w-28 h-16 rounded-xl object-cover bg-orange-50">
                  <div class="flex-1">
                    <p class="font-bold text-xs text-gray-700 mb-2">الشريحة {{ index }}</p>
                    <label class="inline-flex cursor-pointer rounded-lg bg-orange-50 px-3 py-2 text-[11px] font-bold text-orange-700 hover:bg-orange-100">
                      اختيار صورة ورفعها
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="uploadBanner($event, index)" class="sr-only">
                    </label>
                    @if (uploadingBanner() === index) { <span class="mr-2 text-[10px] text-gray-500">جارٍ الرفع...</span> }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Additional homepage promo banners -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <div class="border-b border-gray-100 pb-4"><h2 class="text-base font-bold font-baloo text-gray-800">بنرات العروض الإضافية</h2><p class="text-[11px] text-gray-400">إدارة الصور الإضافية الظاهرة في الصفحة الرئيسية.</p></div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              @for (index of [1, 2]; track index) {
                <div class="rounded-2xl border border-gray-100 p-3"><img [src]="promoBannerPreview(index)" [alt]="'بنر عرض ' + index" class="mb-3 h-32 w-full rounded-xl bg-orange-50 object-cover"><p class="mb-2 text-xs font-bold">بنر العرض {{ index }}</p><label class="inline-flex cursor-pointer rounded-lg bg-orange-50 px-3 py-2 text-[11px] font-bold text-orange-700">اختيار صورة ورفعها<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="uploadPromoBanner($event, index)" class="sr-only"></label></div>
              }
            </div>
          </div>

          <!-- Restaurant Branches Management -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div class="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 class="text-base font-bold font-baloo text-gray-800">فروع سوق وسفرة</h2>
                <p class="text-[11px] text-gray-400">الفروع المتاحة لاستلام وتوصيل الطلبات</p>
              </div>
              <button 
                (click)="showBranchModal.set(true)"
                class="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors">
                + إضافة فرع
              </button>
            </div>

            <div class="space-y-4">
              @for (branch of branches(); track branch.branchId) {
                <div class="p-4 rounded-2xl border border-gray-100 hover:border-primary/30 transition-colors flex flex-col justify-between gap-3 bg-gray-50/50">
                  <div class="flex items-center justify-between">
                    <div class="font-bold text-xs text-gray-800 flex items-center gap-2">
                      <span class="text-base">📍</span>
                      <span>{{ branch.nameAr }}</span>
                      <span class="text-[10px] text-gray-400">({{ branch.nameEn }})</span>
                    </div>
                    <span class="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                      {{ branch.isActive ? 'نشط' : 'معطل' }}
                    </span>
                  </div>

                  <div class="text-[11px] text-gray-500">
                    <div>{{ branch.addressAr }}</div>
                    <div class="text-gray-400 text-[10px]">{{ branch.addressEn }}</div>
                  </div>

                  <div class="flex items-center gap-4 text-[11px] text-primary font-medium pt-2 border-t border-gray-100">
                    <div>📞 {{ branch.phone }}</div>
                    <div>💬 {{ branch.whatsApp }}</div>
                  </div>
                </div>
              } @empty {
                <div class="p-8 text-center text-gray-400 text-xs">
                  لا توجد فروع مسجلة حالياً
                </div>
              }
            </div>
          </div>

        </div>

      </main>

      <!-- Add Branch Modal -->
      @if (showBranchModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 class="text-base font-bold font-baloo text-gray-800">إضافة فرع جديد</h2>
              <button (click)="showBranchModal.set(false)" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-sm font-bold">✕</button>
            </div>

            <form (ngSubmit)="saveBranch()" class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-gray-700 mb-1">اسم الفرع بالعربية *</label>
                <input type="text" [(ngModel)]="newBranch.nameAr" name="nameAr" required placeholder="مثال: فرع الخالدية"
                       class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">اسم الفرع بالإنجليزية *</label>
                <input type="text" [(ngModel)]="newBranch.nameEn" name="nameEn" required placeholder="e.g. Al Khalidiyah Branch"
                       class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">العنوان بالعربية</label>
                <input type="text" [(ngModel)]="newBranch.addressAr" name="addressAr" placeholder="أبوظبي - الخالدية"
                       class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary">
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">العنوان بالإنجليزية</label>
                <input type="text" [(ngModel)]="newBranch.addressEn" name="addressEn" placeholder="Abu Dhabi - Al Khalidiyah"
                       class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block font-bold text-gray-700 mb-1">رقم الهاتف</label>
                  <input type="text" [(ngModel)]="newBranch.phone" name="phone" placeholder="02 633 3136"
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
                </div>
                <div>
                  <label class="block font-bold text-gray-700 mb-1">رقم الواتساب</label>
                  <input type="text" [(ngModel)]="newBranch.whatsApp" name="whatsApp" placeholder="+971503157884"
                         class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary dir-ltr text-right">
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" (click)="showBranchModal.set(false)" class="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">
                  إلغاء
                </button>
                <button type="submit" [disabled]="isSavingBranch()" class="px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-bold shadow-md">
                  إضافة الفرع
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  private api = inject(ApiService);

  settings: SiteSettings = {
    Announcement: 'أهلاً بكم في مطعم ومخبز سوق وسفرة (Good Food, Good Mood) - التوصيل متاح الآن بأبوظبي!',
    PhoneNumber: '02 633 3136',
    WhatsApp: '+971 50 315 7884',
    DeliveryFee: '10.00',
    MinOrderAmount: '30.00',
    WorkingHours: 'يومياً من 7:00 ص وحتى 12:00 منتصف الليل',
    VATPercentage: '5%'
  };

  branches = signal<Branch[]>([]);

  isSaving = signal<boolean>(false);
  uploadingBanner = signal<number | null>(null);
  uploadingLogo = signal(false);
  isSavingBranch = signal<boolean>(false);
  showBranchModal = signal<boolean>(false);

  feedbackMessage = signal<string>('');
  feedbackType = signal<'success' | 'error'>('success');

  newBranch: Partial<Branch> = {
    nameAr: '',
    nameEn: '',
    addressAr: '',
    addressEn: '',
    phone: '',
    whatsApp: '',
    isActive: true
  };

  bannerPreview(index: number): string {
    const url = this.settings[`HeroBanner${index}`];
    if (!url) return `assets/banners/banner-${index}.jpg`;
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }

  logoPreview(): string {
    const url = this.settings['StoreLogo'];
    if (!url) return 'assets/MAIN.jpg';
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }

  uploadLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { this.showFeedback('حجم الصورة أكبر من 10 ميجابايت.', 'error'); input.value = ''; return; }
    this.uploadingLogo.set(true);
    this.api.uploadImage(file, 'logo').subscribe({
      next: result => this.api.updateSetting('StoreLogo', result.url).subscribe({
        next: () => { this.settings['StoreLogo'] = result.url; this.uploadingLogo.set(false); this.showFeedback('تم رفع شعار الموقع وحفظه.', 'success'); },
        error: () => { this.uploadingLogo.set(false); this.showFeedback('تم الرفع لكن تعذر حفظ إعداد الشعار.', 'error'); }
      }),
      error: () => { this.uploadingLogo.set(false); this.showFeedback('تعذر رفع الشعار إلى الخادم.', 'error'); }
    });
    input.value = '';
  }

  promoBannerPreview(index: number): string {
    const url = this.settings[`PromoBanner${index}`];
    if (!url) return index === 1 ? 'assets/morein-banner-1.png' : 'assets/morein-banner-2.jpg';
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }

  uploadPromoBanner(event: Event, index: number) {
    const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) { this.showFeedback('حجم الصورة أكبر من 10 ميجابايت.', 'error'); input.value = ''; return; }
    this.api.uploadImage(file, 'banners').subscribe({ next: result => this.api.updateSetting(`PromoBanner${index}`, result.url).subscribe({
      next: () => { this.settings[`PromoBanner${index}`] = result.url; this.showFeedback('تم حفظ بنر العرض.', 'success'); },
      error: () => this.showFeedback('تم رفع الصورة لكن تعذر حفظ إعداد البنر.', 'error')
    }), error: () => this.showFeedback('تعذر رفع بنر العرض.', 'error') }); input.value = '';
  }

  uploadBanner(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      this.showFeedback('حجم الصورة أكبر من 10 ميجابايت.', 'error');
      input.value = '';
      return;
    }
    this.uploadingBanner.set(index);
    this.api.uploadImage(file, 'banners').subscribe({
      next: result => {
        const key = `HeroBanner${index}`;
        this.api.updateSetting(key, result.url).subscribe({
          next: () => {
            this.settings[key] = result.url;
            this.uploadingBanner.set(null);
            this.showFeedback('تم رفع صورة الشريحة وحفظها بنجاح.', 'success');
          },
          error: () => {
            this.uploadingBanner.set(null);
            this.showFeedback('تم رفع الصورة لكن تعذر حفظ إعدادها.', 'error');
          }
        });
      },
      error: () => {
        this.uploadingBanner.set(null);
        this.showFeedback('تعذر رفع الصورة. تأكد من تشغيل الباك إند وتسجيل الدخول.', 'error');
      }
    });
    input.value = '';
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      settings: this.api.getSettings(),
      branches: this.api.getBranches()
    }).subscribe({
      next: (res) => {
        if (res.settings && Object.keys(res.settings).length > 0) {
          this.settings = { ...this.settings, ...res.settings };
        }
        this.branches.set(res.branches || []);
      },
      error: () => {
        // Keep defaults on connection error
      }
    });
  }

  saveSettings() {
    this.isSaving.set(true);

    const keys = Object.keys(this.settings) as (keyof SiteSettings)[];
    const updates = keys
      .filter((k) => this.settings[k] !== undefined)
      .map((k) => this.api.updateSetting(k as string, this.settings[k] as string));

    if (updates.length === 0) {
      this.isSaving.set(false);
      return;
    }

    forkJoin(updates).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showFeedback('تم حفظ وتحديث إعدادات المتجر بنجاح.', 'success');
      },
      error: () => {
        this.isSaving.set(false);
        this.showFeedback('فشل حفظ بعض الإعدادات على الخادم.', 'error');
      }
    });
  }

  saveBranch() {
    if (!this.newBranch.nameAr || !this.newBranch.nameEn) {
      alert('يرجى كتابة اسم الفرع بالعربية والإنجليزية.');
      return;
    }

    this.isSavingBranch.set(true);
    this.api.createBranch(this.newBranch).subscribe({
      next: (b) => {
        this.isSavingBranch.set(false);
        this.showBranchModal.set(false);
        this.branches.set([...this.branches(), b]);
        this.newBranch = { nameAr: '', nameEn: '', addressAr: '', addressEn: '', phone: '', whatsApp: '', isActive: true };
        this.showFeedback('تمت إضافة الفرع الجديد بنجاح.', 'success');
      },
      error: () => {
        this.isSavingBranch.set(false);
        this.showFeedback('فشل إضافة الفرع على الخادم.', 'error');
      }
    });
  }

  private showFeedback(msg: string, type: 'success' | 'error') {
    this.feedbackMessage.set(msg);
    this.feedbackType.set(type);
    setTimeout(() => {
      if (this.feedbackMessage() === msg) this.feedbackMessage.set('');
    }, 4000);
  }
}
