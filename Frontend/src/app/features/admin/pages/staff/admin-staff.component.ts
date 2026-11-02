import { LanguageService } from '../../../../core/services/language.service';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { StaffUser } from '../../../../core/models/models';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-staff', standalone: true, imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-shell min-h-screen bg-gray-50 font-cairo" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">
      <app-admin-sidebar />
      <main class="admin-main min-w-0 p-5 pt-20 md:p-8 lg:mr-64">
        <header class="mb-8 flex flex-wrap items-center justify-between gap-4"><div><h1 class="font-baloo text-2xl font-black text-gray-900">{{ language.t('إدارة المستخدمين والصلاحيات', 'Users & roles') }}</h1><p class="mt-1 text-sm text-gray-500">{{ language.t('إضافة الموظفين، تعيين الأدوار وإيقاف الحسابات.', 'Add staff, assign roles, and deactivate accounts.') }}</p></div>@if (auth.currentUser()?.role === 'SuperAdmin') { <button (click)="showForm.set(!showForm())" class="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow">{{showForm() ? language.t('إلغاء', 'Cancel') : language.t('+ إضافة مستخدم', '+ Add user')}}</button> }</header>
        @if (message()) { <div class="mb-5 rounded-xl border p-3 text-sm" [class.border-green-200]="!isError()" [class.text-green-800]="!isError()" [class.border-red-200]="isError()" [class.text-red-700]="isError()">{{message()}}</div> }
        @if (auth.currentUser()?.role === 'Admin') {
          <section class="max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 class="font-baloo text-xl font-black text-gray-900">{{ language.t('تفعيل Super Admin لأول مرة', 'Activate Super Admin for the first time') }}</h2>
            <p class="mt-2 text-sm leading-7 text-gray-600">{{ language.t('فعّل حساب المدير الأول كـ Super Admin مرة واحدة. أدخل كلمة المرور الحالية ثم عيّن كلمة مرور جديدة لا تقل عن 10 أحرف. تُحدّث كلمة المرور والصلاحية معًا، وبعدها سجّل الدخول من جديد.', 'Activate the first administrator as Super Admin once. Enter the current password and choose a new password with at least 10 characters. The password and role will be updated together; sign in again afterward.') }}</p>
            <form (ngSubmit)="bootstrap()" class="mt-5 grid gap-3 sm:grid-cols-2">
              <input [(ngModel)]="bootstrapCurrentPassword" name="bootstrapCurrentPassword" type="password" required autocomplete="current-password" [placeholder]="language.t('كلمة المرور الحالية', 'Current password')" class="min-w-0 rounded-xl border border-amber-200 bg-white p-3" dir="ltr">
              <input [(ngModel)]="bootstrapNewPassword" name="bootstrapNewPassword" type="password" required minlength="10" autocomplete="new-password" [placeholder]="language.t('كلمة مرور جديدة (10 أحرف على الأقل)', 'New password (at least 10 characters)')" class="min-w-0 rounded-xl border border-amber-200 bg-white p-3" dir="ltr">
              <button [disabled]="saving()" class="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2">{{saving() ? language.t('جارٍ التفعيل...', 'Activating...') : language.t('تغيير كلمة المرور وتفعيل Super Admin', 'Change password and activate Super Admin')}}</button>
            </form>
          </section>
        } @else {
        @if (auth.currentUser()?.role === 'SuperAdmin') {
        @if (showForm()) {
          <form (ngSubmit)="create()" class="mb-7 grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-5">
            <label class="text-sm font-bold text-gray-700">{{ language.t('الاسم', 'Name') }}<input [(ngModel)]="form.fullName" name="fullName" required maxlength="150" class="mt-1 w-full rounded-xl border p-3 font-normal"></label>
            <label class="text-sm font-bold text-gray-700">{{ language.t('البريد الإلكتروني', 'Email address') }}<input [(ngModel)]="form.email" name="email" type="email" required class="mt-1 w-full rounded-xl border p-3 font-normal" dir="ltr"></label>
            <label class="text-sm font-bold text-gray-700">{{ language.t('كلمة المرور', 'Password') }}<input [(ngModel)]="form.password" name="password" type="password" minlength="10" required class="mt-1 w-full rounded-xl border p-3 font-normal" dir="ltr"></label>
            <label class="text-sm font-bold text-gray-700">{{ language.t('الدور', 'Role') }}<select [(ngModel)]="form.role" name="role" class="mt-1 w-full rounded-xl border bg-white p-3 font-normal"><option value="User">{{ language.t('موظف طلبات', 'Orders staff') }}</option><option value="Admin">{{ language.t('مدير', 'Admin') }}</option><option value="SuperAdmin">{{ language.t('مدير عام', 'Super Admin') }}</option></select></label>
            <div class="flex items-end"><button [disabled]="saving()" class="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{{saving() ? language.t('جارٍ الحفظ...', 'Saving...') : language.t('إنشاء الحساب', 'Create account')}}</button></div>
          </form>
        }
        <section class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"><div class="overflow-x-auto"><table class="w-full text-right text-sm"><thead class="bg-gray-50 text-gray-600"><tr><th class="p-4">{{ language.t('الموظف', 'Staff member') }}</th><th class="p-4">{{ language.t('الصلاحية', 'Role') }}</th><th class="p-4">{{ language.t('الحالة', 'Status') }}</th><th class="p-4">{{ language.t('تغيير الدور', 'Change role') }}</th><th class="p-4">{{ language.t('إجراء', 'Action') }}</th></tr></thead><tbody class="divide-y divide-gray-100">
          @for (user of users(); track user.userId) { <tr><td class="p-4"><div class="font-bold text-gray-900">{{user.fullName}}</div><div dir="ltr" class="text-right text-xs text-gray-500">{{user.email}}</div></td><td class="p-4"><span class="rounded-full px-3 py-1 text-xs font-bold" [class.bg-purple-100]="user.role === 'SuperAdmin'" [class.text-purple-800]="user.role === 'SuperAdmin'" [class.bg-blue-100]="user.role === 'Admin'" [class.text-blue-800]="user.role === 'Admin'" [class.bg-amber-100]="user.role === 'User'" [class.text-amber-800]="user.role === 'User'">{{roleLabel(user.role)}}</span></td><td class="p-4"><span [class.text-green-700]="user.isActive" [class.text-red-600]="!user.isActive">{{user.isActive ? language.t('نشط', 'Active') : language.t('موقوف', 'Disabled')}}</span></td><td class="p-4"><select [value]="user.role" (change)="changeRole(user, $any($event.target).value)" class="rounded-lg border bg-white px-3 py-2"><option value="User">{{ language.t('موظف طلبات', 'Orders staff') }}</option><option value="Admin">{{ language.t('مدير', 'Admin') }}</option><option value="SuperAdmin">{{ language.t('مدير عام', 'Super Admin') }}</option></select></td><td class="p-4"><button (click)="toggleActive(user)" class="rounded-lg px-3 py-2 text-xs font-bold" [class.bg-red-50]="user.isActive" [class.text-red-700]="user.isActive" [class.bg-green-50]="!user.isActive" [class.text-green-700]="!user.isActive">{{user.isActive ? language.t('إيقاف الحساب', 'Deactivate account') : language.t('تفعيل الحساب', 'Activate account')}}</button></td></tr> }
          @empty { <tr><td colspan="5" class="p-10 text-center text-gray-500">{{ language.t('لا يوجد مستخدمون.', 'No users found.') }}</td></tr> }
        </tbody></table></div></section>
        }
        }
      </main>
    </div>
  `
})
export class AdminStaffComponent implements OnInit {
  language = inject(LanguageService);
  private api=inject(ApiService); auth=inject(AuthService); users=signal<StaffUser[]>([]); showForm=signal(false); saving=signal(false); message=signal(''); isError=signal(false);
  form={fullName:'',email:'',password:'',phoneNumber:'',role:'User'}; bootstrapCurrentPassword=''; bootstrapNewPassword='';
  ngOnInit(){if(this.auth.currentUser()?.role === 'SuperAdmin') this.load();}
  bootstrap(){this.saving.set(true);this.api.bootstrapSuperAdmin(this.bootstrapCurrentPassword,this.bootstrapNewPassword).subscribe({next:()=>{this.saving.set(false);this.notify(this.language.t('تم تفعيل المدير العام. سجّل الدخول مجدداً.','Super Admin activated. Please sign in again.'));setTimeout(()=>this.auth.logout(),1500);},error:err=>{this.saving.set(false);this.notify(this.language.isEnglish() ? 'Could not activate Super Admin.' : (err.error?.message || 'تعذر تفعيل Super Admin.'),true);}});}
  load(){this.api.getStaffUsers().subscribe({next:rows=>this.users.set(rows),error:()=>this.notify(this.language.t('تعذر تحميل الحسابات. تأكد من صلاحية Super Admin.','Could not load accounts. Verify Super Admin access.'),true)});}
  create(){this.saving.set(true);this.api.createStaffUser(this.form).subscribe({next:()=>{this.saving.set(false);this.form={fullName:'',email:'',password:'',phoneNumber:'',role:'User'};this.showForm.set(false);this.notify(this.language.t('تم إنشاء الحساب.','Account created.'));this.load();},error:err=>{this.saving.set(false);this.notify(this.language.isEnglish() ? 'Could not create the account.' : (err.error?.message || 'تعذر إنشاء الحساب.'),true);}});}
  changeRole(user:StaffUser, role:string){this.api.updateStaffRole(user.userId,role).subscribe({next:()=>{this.notify(this.language.t('تم تحديث صلاحية الحساب.','Account role updated.'));this.load();},error:()=>{this.notify(this.language.t('تعذر تغيير الصلاحية.','Could not change the role.'),true);this.load();}});}
  toggleActive(user:StaffUser){this.api.toggleStaffActive(user.userId).subscribe({next:()=>{this.notify(this.language.t('تم تحديث حالة الحساب.','Account status updated.'));this.load();},error:()=>this.notify(this.language.t('تعذر تحديث الحساب.','Could not update the account.'),true)});}
  roleLabel(role:string){const labels:Record<string,[string,string]>={User:['موظف طلبات','Orders staff'],Admin:['مدير','Admin'],SuperAdmin:['مدير عام','Super Admin']};const pair=labels[role];return pair?this.language.t(pair[0],pair[1]):role;}
  private notify(text:string,error=false){this.message.set(text);this.isError.set(error);}
}
