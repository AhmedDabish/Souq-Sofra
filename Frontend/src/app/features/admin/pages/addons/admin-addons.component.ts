import { LanguageService } from '../../../../core/services/language.service';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { AddonTemplate, AddonTemplateCreate, Category, Product } from '../../../../core/models/models';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-admin-addons',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-shell min-h-screen bg-[#f7f7f5] font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">
      <app-admin-sidebar />
      <main class="admin-main min-w-0 p-5 pt-20 md:p-8 lg:mr-64">
        <header class="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800"><span>✦</span> {{ language.t('مكتبة الإضافات', 'Extras library') }}</div>
            <h1 class="font-baloo text-3xl font-black text-slate-900">{{ language.t('المنتجات الإضافية', 'Product extras') }}</h1>
            <p class="mt-1 text-sm text-slate-500">{{ language.t('أنشئ الإضافات مرة واحدة، ثم طبّقها على كل المنتجات أو قسم أو صنف بعينه.', 'Create extras once and apply them to all products, a category, or a product.') }}</p>
          </div>
          <button [hidden]="!auth.hasPermission('addons.create')" (click)="openNew()" class="rounded-2xl bg-[#e86719] px-5 py-3 font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#d65710]">＋ {{ language.t('إضافة منتج إضافي', 'Add extra') }}</button>
        </header>

        @if (notice()) { <div class="mb-5 rounded-2xl border px-4 py-3 text-sm font-bold" [class.border-emerald-200]="!error()" [class.bg-emerald-50]="!error()" [class.text-emerald-800]="!error()" [class.border-rose-200]="error()" [class.bg-rose-50]="error()" [class.text-rose-800]="error()">{{notice()}}</div> }

        <section class="mb-6 grid gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-white bg-white p-4 shadow-sm"><div class="text-xs font-bold text-slate-500">{{ language.t('كل الإضافات', 'All extras') }}</div><div class="mt-2 text-2xl font-black text-slate-900">{{templates().length}}</div></div>
          <div class="rounded-2xl border border-white bg-white p-4 shadow-sm"><div class="text-xs font-bold text-slate-500">{{ language.t('مفعّلة', 'Active') }}</div><div class="mt-2 text-2xl font-black text-emerald-700">{{activeCount()}}</div></div>
          <div class="rounded-2xl border border-white bg-white p-4 shadow-sm"><div class="text-xs font-bold text-slate-500">{{ language.t('مطبّقة على كل المنتجات', 'Applied to all products') }}</div><div class="mt-2 text-2xl font-black text-orange-700">{{globalCount()}}</div></div>
        </section>

        <section class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div><h2 class="font-baloo text-lg font-black text-slate-900">{{ language.t('قائمة الإضافات', 'Extras list') }}</h2><p class="mt-0.5 text-xs text-slate-500">{{ language.t('التعديل على إضافة يحدّثها في المنتجات المرتبطة بها.', 'Editing an extra updates linked products.') }}</p></div>
            <div class="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">{{ language.t('✦ الأسعار بالدرهم الإماراتي', '✦ Prices in UAE dirhams') }}</div>
          </div>
          @if (loading()) { <div class="p-12 text-center text-sm text-slate-500">{{ language.t('جارٍ تحميل الإضافات...', 'Loading extras...') }}</div> }
          @else if (!templates().length) { <div class="p-12 text-center"><div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">✦</div><p class="font-bold text-slate-800">{{ language.t('لا توجد إضافات بعد', 'No extras yet') }}</p><p class="mt-1 text-sm text-slate-500">{{ language.t('ابدأ بإضافة خيارات مثل الجبن الإضافي أو البطاطس.', 'Add choices such as extra cheese or fries.') }}</p><button [hidden]="!auth.hasPermission('addons.create')" (click)="openNew()" class="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white">{{ language.t('إضافة أول منتج إضافي', 'Add your first extra') }}</button></div> }
          @else {
            <div class="overflow-x-auto"><table class="w-full min-w-[760px] text-right text-sm"><thead class="bg-slate-50 text-xs font-bold text-slate-500"><tr><th class="px-5 py-3">{{ language.t('الإضافة', 'Extra') }}</th><th class="px-5 py-3">{{ language.t('السعر', 'Price') }}</th><th class="px-5 py-3">{{ language.t('تُطبّق على', 'Applies to') }}</th><th class="px-5 py-3">{{ language.t('الحالة', 'Status') }}</th><th class="px-5 py-3">{{ language.t('إجراءات', 'Actions') }}</th></tr></thead><tbody class="divide-y divide-slate-100">
              @for (item of templates(); track item.addonTemplateId) {
                <tr class="transition hover:bg-orange-50/30"><td class="px-5 py-4"><div class="font-bold text-slate-900">{{ language.isEnglish() ? (item.nameEn || item.nameAr) : item.nameAr }}</div></td><td class="px-5 py-4 font-black text-slate-800">{{item.price}} <span class="text-xs font-semibold text-slate-400">{{ language.isEnglish() ? 'AED' : 'درهم' }}</span></td><td class="px-5 py-4"><span class="rounded-full px-3 py-1 text-xs font-bold" [class.bg-orange-100]="item.scopeType === 'All'" [class.text-orange-800]="item.scopeType === 'All'" [class.bg-sky-100]="item.scopeType === 'Category'" [class.text-sky-800]="item.scopeType === 'Category'" [class.bg-violet-100]="item.scopeType === 'Product'" [class.text-violet-800]="item.scopeType === 'Product'">{{scopeLabel(item)}}</span></td><td class="px-5 py-4"><span class="rounded-full px-3 py-1 text-xs font-bold" [class.bg-emerald-50]="item.isAvailable" [class.text-emerald-700]="item.isAvailable" [class.bg-slate-100]="!item.isAvailable" [class.text-slate-500]="!item.isAvailable">{{ language.t(item.isAvailable ? 'مفعّلة' : 'موقوفة', item.isAvailable ? 'Active' : 'Disabled') }}</span></td><td class="px-5 py-4"><div class="flex gap-2"><button [hidden]="!auth.hasPermission('addons.update')" (click)="openEdit(item)" class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">{{ language.t('تعديل', 'Edit') }}</button><button [hidden]="!auth.hasPermission('addons.delete')" (click)="remove(item)" class="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100">{{ language.t('حذف', 'Delete') }}</button></div></td></tr>
              }
            </tbody></table></div>
          }
        </section>

        @if (formOpen()) {
          <div class="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" (click)="close()">
            <section class="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7" (click)="$event.stopPropagation()">
              <div class="mb-6 flex items-start justify-between gap-3"><div><span class="text-xs font-bold text-orange-600">{{ language.t('مكتبة الإضافات', 'Extras library') }}</span><h2 class="mt-1 font-baloo text-2xl font-black text-slate-900">{{editingId() ? language.t('تعديل الإضافة','Edit extra') : language.t('إضافة منتج إضافي','Add extra')}}</h2></div><button (click)="close()" class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500 hover:bg-slate-200">×</button></div>
              <form (ngSubmit)="save()" class="space-y-5">
                <div class="grid gap-4 sm:grid-cols-2"><label class="text-sm font-bold text-slate-700">{{ language.t('الاسم بالعربية', 'Arabic name') }}<input [(ngModel)]="form.nameAr" name="nameAr" required maxlength="100" class="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"></label><label class="text-sm font-bold text-slate-700">{{ language.t('الاسم بالإنجليزية', 'Name in English') }}<input [(ngModel)]="form.nameEn" name="nameEn" required maxlength="100" dir="ltr" class="mt-2 w-full rounded-xl border border-slate-200 p-3 text-left font-normal outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"></label></div>
                <label class="block text-sm font-bold text-slate-700">{{ language.t('السعر بالدرهم الإماراتي', 'Price (AED)') }}<div class="mt-2 flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100"><input [(ngModel)]="form.price" name="price" type="number" min="0" step="0.01" required class="min-w-0 flex-1 p-3 outline-none"><span class="border-r border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">{{ language.isEnglish() ? 'AED' : 'درهم' }}</span></div></label>
                <fieldset><legend class="mb-3 text-sm font-bold text-slate-700">{{ language.t('نطاق تطبيق الإضافة', 'Apply to') }}</legend><div class="grid gap-2 sm:grid-cols-3"><label class="cursor-pointer rounded-xl border p-3 transition" [class.border-orange-400]="form.scopeType === 'All'" [class.bg-orange-50]="form.scopeType === 'All'"><input type="radio" [(ngModel)]="form.scopeType" name="scope" value="All" class="ml-2 accent-orange-600">{{ language.t('كل المنتجات', 'All products') }}</label><label class="cursor-pointer rounded-xl border p-3 transition" [class.border-orange-400]="form.scopeType === 'Category'" [class.bg-orange-50]="form.scopeType === 'Category'"><input type="radio" [(ngModel)]="form.scopeType" name="scope" value="Category" class="ml-2 accent-orange-600">{{ language.t('قسم معين', 'Specific category') }}</label><label class="cursor-pointer rounded-xl border p-3 transition" [class.border-orange-400]="form.scopeType === 'Product'" [class.bg-orange-50]="form.scopeType === 'Product'"><input type="radio" [(ngModel)]="form.scopeType" name="scope" value="Product" class="ml-2 accent-orange-600">{{ language.t('صنف معين', 'Specific product') }}</label></div></fieldset>
                @if (form.scopeType === 'Category') { <label class="block text-sm font-bold text-slate-700">{{ language.t('القسم', 'Category') }}<select [(ngModel)]="form.categoryId" name="categoryId" required class="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"><option [ngValue]="undefined" disabled>{{ language.t('اختر القسم', 'Choose category') }}</option>@for (category of categories(); track category.categoryId) { <option [ngValue]="category.categoryId">{{ language.isEnglish() ? (category.nameEn || category.nameAr) : category.nameAr }}</option> }</select></label> }
                @if (form.scopeType === 'Product') { <label class="block text-sm font-bold text-slate-700">{{ language.t('الصنف', 'Product') }}<select [(ngModel)]="form.productId" name="productId" required class="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"><option [ngValue]="undefined" disabled>{{ language.t('اختر الصنف', 'Choose product') }}</option>@for (product of products(); track product.productId) { <option [ngValue]="product.productId">{{ language.isEnglish() ? (product.nameEn || product.nameAr) : product.nameAr }} · {{categoryName(product.categoryId)}}</option> }</select></label> }
                <label class="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3"><input type="checkbox" [(ngModel)]="form.isAvailable" name="isAvailable" class="h-4 w-4 accent-orange-600"><span class="text-sm font-bold text-slate-700">{{ language.t('الإضافة متاحة للطلب', 'Available to order') }}</span></label>
                <div class="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" (click)="close()" class="rounded-xl px-5 py-3 font-bold text-slate-500 hover:bg-slate-100">{{ language.t('إلغاء', 'Cancel') }}</button><button [disabled]="saving()" class="rounded-xl bg-[#e86719] px-6 py-3 font-bold text-white shadow-lg shadow-orange-200 disabled:opacity-60">{{saving() ? language.t('جارٍ الحفظ...','Saving...') : editingId() ? language.t('حفظ التعديلات','Save changes') : language.t('إضافة إلى المكتبة','Add to library')}}</button></div>
              </form>
            </section>
          </div>
        }
      </main>
    </div>
  `
})
export class AdminAddonsComponent implements OnInit {
  language = inject(LanguageService);
  auth = inject(AuthService);
  private api = inject(ApiService);
  templates = signal<AddonTemplate[]>([]);
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  loading = signal(true);
  saving = signal(false);
  formOpen = signal(false);
  editingId = signal<number | null>(null);
  notice = signal('');
  error = signal(false);
  activeCount = () => this.templates().filter(item => item.isAvailable).length;
  globalCount = () => this.templates().filter(item => item.scopeType === 'All').length;
  form: AddonTemplateCreate = this.emptyForm();

  ngOnInit() {
    this.api.getAdminCategories().subscribe({ next: rows => this.categories.set(rows) });
    this.api.getAllAdminProducts().subscribe({ next: rows => this.products.set(rows) });
    this.load();
  }
  private emptyForm(): AddonTemplateCreate { return { nameAr: '', nameEn: '', price: 0, isAvailable: true, scopeType: 'All' }; }
  load() { this.loading.set(true); this.api.getAddonTemplates().subscribe({ next: rows => { this.templates.set(rows); this.loading.set(false); }, error: () => { this.loading.set(false); this.notify(this.language.t('تعذر تحميل الإضافات. تأكد من تطبيق تحديث قاعدة البيانات ثم أعد المحاولة.', 'Could not load extras. Apply the database update and try again.'), true); } }); }
  openNew() { this.editingId.set(null); this.form = this.emptyForm(); this.formOpen.set(true); }
  openEdit(item: AddonTemplate) { this.editingId.set(item.addonTemplateId); this.form = { nameAr: item.nameAr, nameEn: item.nameEn, price: item.price, isAvailable: item.isAvailable, scopeType: item.scopeType, categoryId: item.categoryId, productId: item.productId }; this.formOpen.set(true); }
  close() { this.formOpen.set(false); }
  save() {
    if (!this.form.nameAr.trim() || !this.form.nameEn.trim() || this.form.price < 0) { this.notify(this.language.t('أكمل الاسمين والسعر بشكل صحيح.', 'Enter both names and a valid price.'), true); return; }
    if (this.form.scopeType === 'Category' && !this.form.categoryId) { this.notify(this.language.t('اختر القسم الذي ستطبق عليه الإضافة.', 'Choose a category for this extra.'), true); return; }
    if (this.form.scopeType === 'Product' && !this.form.productId) { this.notify(this.language.t('اختر الصنف الذي ستطبق عليه الإضافة.', 'Choose a product for this extra.'), true); return; }
    const payload = { ...this.form, categoryId: this.form.scopeType === 'Category' ? this.form.categoryId : undefined, productId: this.form.scopeType === 'Product' ? this.form.productId : undefined };
    this.saving.set(true);
    const request = this.editingId() ? this.api.updateAddonTemplate(this.editingId()!, payload) : this.api.createAddonTemplate(payload);
    request.subscribe({ next: () => { this.saving.set(false); this.close(); this.load(); this.notify(this.editingId() ? this.language.t('تم تحديث الإضافة وربطها بالمنتجات المحددة.', 'Extra updated and linked to selected products.') : this.language.t('تمت إضافة المنتج الإضافي وربطه بنجاح.', 'Extra added and linked successfully.')); }, error: err => { this.saving.set(false); this.notify(this.language.isEnglish() ? 'Could not save the extra.' : (err.error?.message || 'تعذر حفظ الإضافة.'), true); } });
  }
  remove(item: AddonTemplate) { if (!confirm(this.language.t(`إيقاف الإضافة «${item.nameAr}»؟ ستبقى ظاهرة في الطلبات السابقة، ولن تظهر في الطلبات الجديدة.`, `Disable “${item.nameEn}”? It will remain on past orders and won't be available on new orders.`))) return; this.api.deleteAddonTemplate(item.addonTemplateId).subscribe({ next: () => { this.load(); this.notify(this.language.t('تم إيقاف الإضافة عن الطلبات الجديدة.', 'Extra disabled for new orders.')); }, error: () => this.notify(this.language.t('تعذر إيقاف الإضافة.', 'Could not disable the extra.'), true) }); }
  scopeLabel(item: AddonTemplate) { if (item.scopeType === 'Category') return `${this.language.t('قسم:', 'Category:')} ${this.categoryName(item.categoryId || 0)}`; if (item.scopeType === 'Product') return `${this.language.t('صنف:', 'Product:')} ${(this.products().find(product => product.productId === item.productId)?.[this.language.isEnglish() ? 'nameEn' : 'nameAr'] || this.products().find(product => product.productId === item.productId)?.nameAr || this.language.t('غير معروف', 'Unknown'))}`; return this.language.t('كل المنتجات', 'All products'); }
  categoryName(id: number) { const category = this.categories().find(row => row.categoryId === id); return category ? (this.language.isEnglish() ? category.nameEn || category.nameAr : category.nameAr) : `${this.language.t('قسم', 'Category')} ${id}`; }
  private notify(message: string, isError = false) { this.notice.set(message); this.error.set(isError); setTimeout(() => { if (this.notice() === message) this.notice.set(''); }, 4500); }
}
