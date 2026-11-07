import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-sidebar', standalone: true, imports: [CommonModule, RouterModule],
  template: `
    @if (mobileOpen()) {
      <button class="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden" [attr.aria-label]="language.t('إغلاق القائمة', 'Close menu')" (click)="mobileOpen.set(false)"></button>
    }

    <button type="button" class="fixed right-4 top-4 z-[70] flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-[#42150f] text-amber-100 shadow-xl transition hover:bg-[#6a2415] focus:outline-none focus:ring-4 focus:ring-amber-400/40 lg:hidden" (click)="toggleMobile()" [style.right]="language.isEnglish() ? 'auto' : '1rem'" [style.left]="language.isEnglish() ? '1rem' : 'auto'" [attr.aria-label]="mobileOpen() ? language.t('إغلاق القائمة', 'Close menu') : language.t('فتح القائمة', 'Open menu')" [attr.aria-expanded]="mobileOpen()">
      @if (mobileOpen()) {
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m18 6-12 12M6 6l12 12"/></svg>
      } @else {
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      }
    </button>

    <button type="button" class="admin-sidebar-toggle fixed top-5 z-[70] hidden h-10 w-10 items-center justify-center rounded-xl border border-[#681c0f]/10 bg-white text-[#681c0f] shadow-md transition hover:bg-orange-50 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-200 lg:flex" (click)="toggleCollapsed()" [style.right]="language.isEnglish() ? 'auto' : (isCollapsed() ? '4.25rem' : '17.25rem')" [style.left]="language.isEnglish() ? (isCollapsed() ? '4.25rem' : '17.25rem') : 'auto'" [attr.aria-label]="isCollapsed() ? language.t('فتح القائمة الجانبية', 'Expand sidebar') : language.t('طي القائمة الجانبية', 'Collapse sidebar')" [attr.title]="isCollapsed() ? language.t('فتح القائمة الجانبية', 'Expand sidebar') : language.t('طي القائمة الجانبية', 'Collapse sidebar')">
      <svg viewBox="0 0 24 24" class="h-5 w-5 transition-transform" [class.rotate-180]="!isCollapsed()" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/><path d="M20 12H9"/></svg>
    </button>

    <aside [style.width]="isCollapsed() ? '5rem' : '18rem'" [style.right]="language.isEnglish() ? 'auto' : '0'" [style.left]="language.isEnglish() ? '0' : 'auto'" [class.sidebar-mobile-open]="mobileOpen()" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'" class="admin-sidebar fixed inset-y-0 right-0 z-50 flex h-dvh flex-col overflow-hidden border-l border-white/10 bg-[#32120e] text-white shadow-[0_20px_70px_rgba(36,12,8,.32)] transition-[width,transform] duration-300 ease-out">
      <div class="sidebar-brand relative flex h-[6.25rem] shrink-0 items-center gap-3 border-b border-white/[.08] px-4">
        <div class="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-amber-300 via-orange-400 to-transparent"></div>
        <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-[0_5px_22px_rgba(247,176,77,.18)] ring-1 ring-amber-200/30">
          <img src="assets/favicon.png" [alt]="language.t('شعار مطعم سوق وسفرة', 'Souq & Sofra restaurant logo')" class="h-full w-full object-contain" />
        </div>
        @if (!isCollapsed()) {
          <div class="min-w-0"><h2 class="font-baloo text-lg font-black tracking-wide text-amber-100">{{ language.t('سوق وسفرة', 'Souq & Sofra') }}</h2><p class="mt-0.5 text-[11px] tracking-wide text-orange-100/55">{{ language.t('لوحة إدارة المطعم', 'Restaurant dashboard') }}</p></div>
        }
      </div>

      @if (!isCollapsed()) { <div class="px-5 pb-1 pt-5 text-[10px] font-extrabold tracking-[.16em] text-orange-100/45">{{ language.t('القائمة الرئيسية', 'MAIN MENU') }}</div> }
      <nav class="flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-3 [scrollbar-color:#ffffff28_transparent] [scrollbar-width:thin]">
        @for (item of visibleItems(); track item.path) {
          <a [routerLink]="item.path" routerLinkActive="admin-nav-active" [routerLinkActiveOptions]="{exact:item.path === '/admin'}" (click)="mobileOpen.set(false)" [title]="isCollapsed() ? language.t(item.label, item.labelEn) : ''" class="admin-nav-link group relative flex min-h-[3.15rem] items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-white/65 transition duration-200 hover:bg-white/[.07] hover:text-white">
            <span class="admin-nav-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[.055] text-amber-100/75 transition duration-200 group-hover:bg-amber-300/10 group-hover:text-amber-100">
              <svg viewBox="0 0 24 24" class="h-[19px] w-[19px]" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                @switch (item.icon) {
                  @case ('dashboard') { <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/> }
                  @case ('orders') { <path d="M8 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 13 2.2 2.2L16 9.5"/> }
                  @case ('all-orders') { <path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/> }
                  @case ('products') { <path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8M7.5 5.5l9 5"/> }
                  @case ('categories') { <path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/> }
                  @case ('addons') { <path d="M12 3v18M3 12h18"/><path d="M19 5v4M17 7h4M5 17v4M3 19h4"/> }
                  @case ('settings') { <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3h-.2a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z" transform="translate(0 1) scale(.92) translate(1 0)"/> }
                  @case ('delivery') { <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="17.5" cy="19" r="1.5"/><path d="M6 10h5M6 13h4"/> }
                  @case ('analytics') { <path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/><path d="M17 6h3v3"/> }
                  @case ('reviews') { <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 10h8M8 14h5"/> }
                  @case ('staff') { <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/> }
                }
              </svg>
            </span>
            @if (!isCollapsed()) { <span class="truncate">{{language.t(item.label, item.labelEn)}}</span><span class="mr-auto h-1.5 w-1.5 rounded-full bg-transparent transition group-[.admin-nav-active]:bg-amber-200"></span> }
          </a>
        }
      </nav>

      <div class="shrink-0 border-t border-white/[.08] bg-black/[.12] p-3">
        @if (!isCollapsed()) {
          <div class="mb-3 flex items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.045] p-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-400 font-black text-[#48170f] shadow">{{ initials() }}</div>
            <div class="min-w-0"><p class="truncate text-xs font-bold text-white">{{auth.currentUser()?.fullName || language.t('مستخدم لوحة التحكم', 'Dashboard user')}}</p><p class="mt-1 text-[10px] text-amber-100/55">{{roleLabel()}}</p></div>
          </div>
        }
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" (click)="language.toggle()" class="flex min-h-10 items-center rounded-xl px-3 text-xs font-bold text-amber-100 transition hover:bg-white/[.07]">{{ isCollapsed() ? (language.isEnglish() ? 'ع' : 'EN') : (language.isEnglish() ? 'العربية' : 'English') }}</button>
          <a routerLink="/" class="flex min-h-10 flex-1 items-center gap-2 rounded-xl px-3 text-xs text-white/65 transition hover:bg-white/[.07] hover:text-white" [title]="isCollapsed() ? language.t('المتجر العام', 'Storefront') : ''"><svg viewBox="0 0 24 24" class="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"/></svg>@if (!isCollapsed()) { <span>{{ language.t('المتجر', 'Storefront') }}</span> }</a>
          <button type="button" (click)="logout()" class="flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-rose-200/75 transition hover:bg-rose-400/10 hover:text-rose-100" [title]="isCollapsed() ? language.t('تسجيل الخروج', 'Log out') : ''"><svg viewBox="0 0 24 24" class="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg>@if (!isCollapsed()) { <span>{{ language.t('خروج', 'Log out') }}</span> }</button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host{display:contents}
    /* Use transform instead of Tailwind's translate utility: Tailwind's translate property
       can otherwise keep the drawer off-canvas even when transform is reset. */
    .admin-sidebar{translate:none!important;will-change:transform}
    .admin-sidebar[dir="rtl"]{transform:translate3d(100%,0,0)}
    .admin-sidebar[dir="ltr"]{transform:translate3d(-100%,0,0)}
    .admin-sidebar.sidebar-mobile-open{transform:translate3d(0,0,0)}
    @media (min-width:1024px){.admin-sidebar{transform:translate3d(0,0,0)!important;will-change:auto}}
    .admin-nav-active{background:linear-gradient(105deg,rgba(230,104,33,.98),rgba(196,72,23,.98));color:#fff;box-shadow:0 7px 20px rgba(230,104,33,.20)}
    .admin-nav-active .admin-nav-icon{background:rgba(255,255,255,.16);color:#fff}
  `]
})
export class AdminSidebarComponent {
  language = inject(LanguageService);
  auth = inject(AuthService); private router = inject(Router); private notifications = inject(NotificationService);
  collapsed = signal(localStorage.getItem('souq_admin_sidebar_collapsed') === 'true');
  mobileOpen = signal(false);
  private items = [
    { path:'/admin', label:'لوحة المؤشرات', labelEn:'Dashboard', icon:'dashboard', permission:'dashboard.view', roles:['Admin','SuperAdmin'] },
    { path:'/admin/analytics', label:'التحليلات', labelEn:'Analytics', icon:'analytics', permission:'analytics.view', roles:['Admin','SuperAdmin'] },
    { path:'/admin/orders', label:'إدارة الطلبات', labelEn:'Orders', icon:'orders', permission:'orders.view', roles:['User','Admin','SuperAdmin'] },
    { path:'/admin/all-orders', label:'كل الطلبات', labelEn:'All orders', icon:'all-orders', permission:'orders.view', roles:['User','Admin','SuperAdmin'] },
    { path:'/admin/products', label:'المنتجات والمنيو', labelEn:'Products & menu', icon:'products', permission:'products.view', roles:['Admin','SuperAdmin'] },
    { path:'/admin/categories', label:'أقسام المنيو', labelEn:'Categories', icon:'categories', permission:'categories.view', roles:['Admin','SuperAdmin'] },
    { path:'/admin/addons', label:'المنتجات الإضافية', labelEn:'Product extras', icon:'addons', permission:'addons.view', roles:['Admin','SuperAdmin'] },
    { path:'/admin/reviews', label:'إدارة التقييمات', labelEn:'Reviews', icon:'reviews', permission:'reviews.view', roles:['Admin','SuperAdmin'] },
    { path:'/admin/settings', label:'إعدادات المتجر', labelEn:'Store settings', icon:'settings', permission:'settings.view', roles:['Admin','SuperAdmin'] },
    { path:'/admin/delivery-settings', label:'مناطق ورسوم التوصيل', labelEn:'Delivery areas & fees', icon:'delivery', permission:'settings.view', roles:['Admin','SuperAdmin'] },
    { path:'/admin/staff', label:'إدارة المستخدمين والصلاحيات', labelEn:'Users & roles', icon:'staff', permission:'users.view', roles:['Admin','SuperAdmin'] },
  ];
  visibleItems() { const role=this.auth.currentUser()?.role || ''; return this.items.filter(item => this.auth.hasPermission(item.permission)); }
  roleLabel() { const labels: Record<string,[string,string]> = { User:['موظف الطلبات','Orders staff'], Admin:['مدير','Admin'], SuperAdmin:['مدير عام','Super Admin'] }; const pair=labels[this.auth.currentUser()?.role || '']; return pair ? this.language.t(pair[0],pair[1]) : this.language.t('حساب','Account'); }
  initials() { return (this.auth.currentUser()?.fullName || 'م').trim().slice(0,1); }
  isCollapsed() { return this.collapsed() && typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches; }
  toggleCollapsed() { this.collapsed.update(value => !value); localStorage.setItem('souq_admin_sidebar_collapsed',String(this.collapsed())); }
  toggleMobile() { this.mobileOpen.update(value => !value); }
  async logout() { if (await this.notifications.confirm(this.language.t('هل أنت متأكد من تسجيل الخروج؟','Are you sure you want to log out?'))) this.auth.logout(); }
}
