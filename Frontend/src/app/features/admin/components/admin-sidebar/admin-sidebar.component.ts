import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar', standalone: true, imports: [CommonModule, RouterModule],
  template: `
    @if (mobileOpen()) { <button class="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" aria-label="إغلاق القائمة" (click)="mobileOpen.set(false)"></button> }
    <button type="button" class="fixed right-4 top-4 z-[60] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-[#42150f] text-xl text-amber-100 shadow-xl transition hover:bg-[#6a2415] focus:outline-none focus:ring-4 focus:ring-amber-400/40 lg:hidden" (click)="toggleMobile()" [attr.aria-label]="mobileOpen() ? 'إغلاق القائمة' : 'فتح القائمة'" [attr.aria-expanded]="mobileOpen()">{{ mobileOpen() ? '×' : '☰' }}</button>
    <button type="button" class="fixed top-4 z-[60] hidden h-11 w-11 items-center justify-center rounded-2xl border border-[#681c0f]/10 bg-white text-xl text-[#681c0f] shadow-lg transition hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-200 lg:flex" (click)="toggleCollapsed()" [style.right]="collapsed() ? '0.65rem' : '12.25rem'" [attr.aria-label]="collapsed() ? 'فتح القائمة الجانبية' : 'طي القائمة الجانبية'" [attr.title]="collapsed() ? 'فتح القائمة الجانبية' : 'طي القائمة الجانبية'">{{ collapsed() ? '☰' : '‹' }}</button>
    <aside [style.width]="collapsed() ? '5rem' : '16rem'" [class.sidebar-mobile-open]="mobileOpen()" class="admin-sidebar fixed inset-y-0 right-0 z-50 flex h-dvh flex-col overflow-hidden border-l border-white/10 bg-gradient-to-b from-[#39130e] via-[#521a10] to-[#26100c] text-white shadow-2xl transition-[width,transform] duration-300 ease-out translate-x-full lg:translate-x-0">
      <div class="relative flex h-24 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-amber-300 via-orange-400 to-transparent"></div>
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200/20 bg-white/10 text-2xl shadow-inner">🍽️</div>
        @if (!collapsed()) { <div class="min-w-0"><h2 class="font-baloo text-base font-black tracking-wide text-amber-100">سوق وسفرة</h2><p class="mt-0.5 text-[11px] text-white/50">إدارة المتجر باحتراف</p></div> }
      </div>
      @if (!collapsed()) { <div class="px-4 pb-2 pt-5 text-[10px] font-bold tracking-[.18em] text-amber-100/40">القائمة الرئيسية</div> }
      <nav class="flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-3 [scrollbar-color:#ffffff30_transparent] [scrollbar-width:thin]">
        @for (item of visibleItems(); track item.path) {
          <a [routerLink]="item.path" routerLinkActive="admin-nav-active" [routerLinkActiveOptions]="{exact:item.path === '/admin'}" (click)="mobileOpen.set(false)" [title]="collapsed() ? item.label : ''" class="group flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-white/65 transition duration-200 hover:translate-x-[-2px] hover:bg-white/[.08] hover:text-white">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[.06] text-lg text-amber-100/80 transition group-hover:bg-amber-300/10">{{item.icon}}</span>
            @if (!collapsed()) { <span class="truncate">{{item.label}}</span><span class="mr-auto h-1.5 w-1.5 rounded-full bg-transparent group-[.admin-nav-active]:bg-white"></span> }
          </a>
        }
      </nav>
      <div class="shrink-0 border-t border-white/10 bg-black/10 p-3">
        @if (!collapsed()) { <div class="mb-3 flex items-center gap-3 rounded-2xl border border-white/[.06] bg-white/[.04] p-3"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 font-black text-[#48170f] shadow">{{ initials() }}</div><div class="min-w-0"><p class="truncate text-xs font-bold text-white">{{auth.currentUser()?.fullName || 'مستخدم لوحة التحكم'}}</p><p class="mt-1 text-[10px] text-amber-100/55">{{roleLabel()}}</p></div></div> }
        <div class="flex items-center gap-2"><a routerLink="/" class="flex min-h-10 flex-1 items-center gap-2 rounded-xl px-3 text-xs text-white/65 transition hover:bg-white/[.08] hover:text-white" [title]="collapsed() ? 'المتجر العام' : ''"><span>🏠</span>@if (!collapsed()) { <span>المتجر</span> }</a><button type="button" (click)="logout()" class="flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-rose-200/80 transition hover:bg-rose-400/10 hover:text-rose-100" [title]="collapsed() ? 'تسجيل الخروج' : ''"><span>↪</span>@if (!collapsed()) { <span>خروج</span> }</button></div>
      </div>
    </aside>
  `,
  styles: [`:host{display:contents}.admin-sidebar.sidebar-mobile-open{transform:translateX(0)}.admin-nav-active{background:linear-gradient(110deg,#f47621,#db5b12);color:#fff;box-shadow:0 8px 24px #f4762130}.admin-nav-active span:first-child{background:#ffffff25;color:#fff}`]
})
export class AdminSidebarComponent {
  auth = inject(AuthService); private router = inject(Router);
  collapsed = signal(localStorage.getItem('souq_admin_sidebar_collapsed') === 'true');
  mobileOpen = signal(false);
  private items = [
    { path:'/admin', label:'لوحة المؤشرات', icon:'▦', roles:['Admin','SuperAdmin'] },
    { path:'/admin/orders', label:'إدارة الطلبات', icon:'▤', roles:['User','Admin','SuperAdmin'] },
    { path:'/admin/products', label:'المنتجات والمنيو', icon:'🍽️', roles:['Admin','SuperAdmin'] },
    { path:'/admin/categories', label:'أقسام المنيو', icon:'◈', roles:['Admin','SuperAdmin'] },
    { path:'/admin/addons', label:'المنتجات الإضافية', icon:'✦', roles:['Admin','SuperAdmin'] },
    { path:'/admin/settings', label:'إعدادات المتجر', icon:'⚙', roles:['Admin','SuperAdmin'] },
    { path:'/admin/staff', label:'إدارة المستخدمين والصلاحيات', icon:'♙', roles:['Admin','SuperAdmin'] },
  ];
  visibleItems() { const role=this.auth.currentUser()?.role || ''; return this.items.filter(item => item.roles.includes(role)); }
  roleLabel() { return ({User:'موظف الطلبات',Admin:'مدير',SuperAdmin:'مدير عام'} as Record<string,string>)[this.auth.currentUser()?.role || ''] || 'حساب'; }
  initials() { return (this.auth.currentUser()?.fullName || 'م').trim().slice(0,1); }
  toggleCollapsed() { this.collapsed.update(value => !value); localStorage.setItem('souq_admin_sidebar_collapsed',String(this.collapsed())); }
  openSidebar() { this.collapsed.set(false); localStorage.setItem('souq_admin_sidebar_collapsed','false'); }
  toggleMobile() { this.mobileOpen.update(value => !value); }
  logout() { if (confirm('هل أنت متأكد من تسجيل الخروج؟')) this.auth.logout(); }
}
