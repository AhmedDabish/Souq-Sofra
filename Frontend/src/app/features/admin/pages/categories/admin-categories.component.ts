import { LanguageService } from '../../../../core/services/language.service';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { Category, CategoryCreate } from '../../../../core/models/models';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-categories', standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-shell min-h-screen bg-gray-50 flex font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">
      <app-admin-sidebar />
      <main class="admin-main min-w-0 flex-1 p-5 pt-20 md:p-8 lg:mr-64">
        <header class="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div><h1 class="font-baloo text-2xl font-black text-gray-800">{{ language.t('إدارة أقسام المنيو', 'Manage menu categories') }}</h1><p class="mt-1 text-xs text-gray-500">{{ language.t('إدارة الأسماء باللغتين وصور الأقسام والأيقونات من الخادم.', 'Manage bilingual names, category images, and icons.') }}</p></div>
          <button [hidden]="!auth.hasPermission('categories.create')" type="button" (click)="openNew()" class="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">{{ language.t('+ إضافة قسم', '+ Add category') }}</button>
        </header>
        @if (message()) { <p class="mb-5 rounded-xl border p-3 text-sm" [class.border-green-200]="!error()" [class.text-green-700]="!error()" [class.border-red-200]="error()" [class.text-red-700]="error()">{{ message() }}</p> }
        <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          @for (category of categories(); track category.categoryId) {
            <article class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <img [src]="imageUrl(category.imageUrl || category.iconUrl)" [alt]="category.nameAr" class="h-40 w-full bg-orange-50 object-cover">
              <div class="space-y-2 p-4"><h2 class="font-bold text-gray-900">{{ language.isEnglish() ? (category.nameEn || category.nameAr) : category.nameAr }}</h2><p class="text-xs text-gray-400">{{ language.t('ترتيب العرض:', 'Display order:') }} {{ category.displayOrder }}</p>
                <div class="flex gap-2 pt-2"><button type="button" [hidden]="!auth.hasPermission('categories.update')" (click)="edit(category)" class="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">{{ language.t('تعديل', 'Edit') }}</button><button type="button" [hidden]="!auth.hasPermission('categories.delete')" (click)="remove(category)" class="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{{ language.t('تعطيل', 'Disable') }}</button></div>
              </div>
            </article>
          } @empty { <div class="col-span-full rounded-2xl bg-white p-10 text-center text-gray-500">{{ language.t('لا توجد أقسام نشطة.', 'No active categories.') }}</div> }
        </section>
        @if (showForm()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" (click)="showForm.set(false)">
            <form (ngSubmit)="save()" (click)="$event.stopPropagation()" class="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <h2 class="font-baloo text-xl font-black">{{ editingId() ? language.t('تعديل القسم', 'Edit category') : language.t('إضافة قسم', 'Add category') }}</h2>
              <div class="grid gap-3 sm:grid-cols-2"><label class="text-xs font-bold">{{ language.t('الاسم بالعربية', 'Arabic name') }}<input [(ngModel)]="form.nameAr" name="nameAr" required class="mt-1 w-full rounded-xl border p-3"></label><label class="text-xs font-bold">{{ language.t('الاسم بالإنجليزية', 'English name') }}<input [(ngModel)]="form.nameEn" name="nameEn" required dir="ltr" class="mt-1 w-full rounded-xl border p-3"></label></div>
              <label class="block text-xs font-bold">{{ language.t('Slug / URL', 'Slug / URL') }}<input [(ngModel)]="form.slug" name="slug" class="mt-1 w-full rounded-xl border p-3" dir="ltr"></label>
              <div class="grid gap-3 sm:grid-cols-2"><label class="text-xs font-bold">{{ language.t('ترتيب الظهور', 'Display order') }}<input type="number" [(ngModel)]="form.displayOrder" name="displayOrder" class="mt-1 w-full rounded-xl border p-3"></label><label class="flex items-center gap-2 pt-5 text-xs font-bold"><input type="checkbox" [(ngModel)]="form.isActive" name="isActive">{{ language.t('قسم نشط', 'Category active') }}</label></div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div><p class="mb-2 text-xs font-bold">{{ language.t('صورة القسم', 'Category image') }}</p><img [src]="imageUrl(form.imageUrl || form.iconUrl)" class="mb-2 h-24 w-full rounded-xl bg-orange-50 object-cover"><label class="cursor-pointer rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800">{{ language.t('رفع صورة', 'Upload image') }}<input type="file" accept="image/*" (change)="upload($event, 'imageUrl')" class="sr-only"></label></div>
                <div><p class="mb-2 text-xs font-bold">{{ language.t('أيقونة القسم', 'Category icon') }}</p><img [src]="imageUrl(form.iconUrl)" class="mb-2 h-24 w-full rounded-xl bg-orange-50 object-contain"><label class="cursor-pointer rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800">{{ language.t('رفع أيقونة', 'Upload icon') }}<input type="file" accept="image/*" (change)="upload($event, 'iconUrl')" class="sr-only"></label></div>
              </div>
              <div class="flex justify-end gap-2 border-t pt-4"><button type="button" (click)="showForm.set(false)" class="rounded-xl bg-gray-100 px-4 py-2 font-bold">{{ language.t('إلغاء', 'Cancel') }}</button><button type="submit" [disabled]="saving()" class="rounded-xl bg-primary px-5 py-2 font-bold text-white">{{ saving() ? language.t('جارٍ الحفظ…', 'Saving…') : language.t('حفظ القسم', 'Save category') }}</button></div>
            </form>
          </div>
        }
      </main>
    </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  language = inject(LanguageService);
  auth = inject(AuthService);
  private api = inject(ApiService);
  private notifications = inject(NotificationService);
  categories = signal<Category[]>([]); message = signal(''); error = signal(false); showForm = signal(false); saving = signal(false); uploading = signal(false); editingId = signal<number | null>(null);
  form: CategoryCreate = this.emptyForm();
  ngOnInit() { this.load(); }
  emptyForm(): CategoryCreate { return { nameAr: '', nameEn: '', slug: '', iconUrl: '', imageUrl: '', displayOrder: 0, isActive: true }; }
  load() { this.api.getAdminCategories().subscribe({ next: rows => this.categories.set(rows), error: () => this.notify(this.language.t('تعذر تحميل الأقسام من الخادم.', 'Could not load categories from the server.'), true) }); }
  openNew() { this.editingId.set(null); this.form = this.emptyForm(); this.showForm.set(true); }
  edit(category: Category) { this.editingId.set(category.categoryId); this.form = { nameAr: category.nameAr, nameEn: category.nameEn, slug: category.slug, iconUrl: category.iconUrl || '', imageUrl: category.imageUrl || '', displayOrder: category.displayOrder, isActive: category.isActive !== false }; this.showForm.set(true); }
  save() { if (!this.form.nameAr.trim() || !this.form.nameEn.trim()) return; this.saving.set(true); const id = this.editingId(); const request = id ? this.api.updateCategory(id, this.form) : this.api.createCategory(this.form); request.subscribe({ next: () => { this.saving.set(false); this.showForm.set(false); this.notify(this.language.t('تم حفظ القسم على الخادم.', 'Category saved.')); this.load(); }, error: () => { this.saving.set(false); this.notify(this.language.t('تعذر حفظ القسم. تحقق من تسجيل دخول المدير والاتصال بالخادم.', 'Could not save the category. Check your admin sign-in and server connection.'), true); } }); }
  async remove(category: Category) { if (!(await this.notifications.confirm(this.language.t(`تعطيل القسم «${category.nameAr}»؟`, `Disable category “${this.language.isEnglish() ? category.nameEn : category.nameAr}”?`)))) return; this.api.deleteCategory(category.categoryId).subscribe({ next: () => { this.notify(this.language.t('تم تعطيل القسم.', 'Category disabled.')); this.load(); }, error: () => this.notify(this.language.t('تعذر تعطيل القسم.', 'Could not disable the category.'), true) }); }
  upload(event: Event, field: 'imageUrl' | 'iconUrl') { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; if (file.size > 10 * 1024 * 1024) { this.notify(this.language.t('حجم الصورة يجب ألا يتجاوز 10 ميجابايت.', 'Image must be 10 MB or smaller.'), true); input.value = ''; return; } this.uploading.set(true); this.api.uploadImage(file, 'categories').subscribe({ next: result => { this.form[field] = result.url; this.uploading.set(false); }, error: () => { this.uploading.set(false); this.notify(this.language.t('تعذر رفع الصورة إلى الخادم.', 'Could not upload the image to the server.'), true); } }); input.value = ''; }
  imageUrl(url?: string) { if (!url) return 'assets/MAIN.jpg'; if (/^https?:\/\//i.test(url) || url.startsWith('assets/')) return url; return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`; }
  private notify(text: string, isError = false) { this.message.set(text); this.error.set(isError); this.notifications.show(text, isError ? 'error' : 'success'); setTimeout(() => { if (this.message() === text) this.message.set(''); }, 4000); }
}
