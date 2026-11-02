import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar', standalone: true, imports: [CommonModule, RouterModule],
  template: `
    @if (mobileOpen()) { <button class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" aria-label="إغلاق القائمة" (click)="mobileOpen.set(false)"></button> }
    <button type="button" class="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl bg-[#681c0f] text-xl text-white shadow-lg lg:hidden" (click)="mobileOpen.set(!mobileOpen())" aria-label="فتح القائمة">☰</button>
    <aside [style.width]="collapsed() ? '5.5rem' : '16rem'" [ngClass]="{'-translate-x-full': !mobileOpen(), 'translate-x-0': mobileOpen()}" class="fixed inset-y-0 right-0 z-50 flex h-dvh flex-col border-l border-white/10 bg-gradient-to-b from-[#42150f] via-[#551b11] to-[#2d100c] text-white shadow-2xl transition-all duration-300 lg:translate-x-0">
      <div class="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        <img src="assets/MAIN.jpg" alt="سوق وسفرة" class="h-11 w-11 shrink-0 rounded-2xl border border-amber-300/40 object-cover shadow-lg">
        @if (!collapsed()) { <div class="min-w-0"><h2 class="font-baloo text-base font-black text-amber-100">سوق وسفرة</h2><p class="text-xs text-white/55">لوحة الإدارة</p></div> }
        <button type="button" class="mr-auto hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white lg:flex" (click)="toggleCollapsed()" [attr.aria-label]="collapsed() ? 'توسيع القائمة' : 'طي القائمة'">{{ collapsed() ? '⇤' : '⇥' }}</button>
      </div>
      <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        @for (item of visibleItems(); track item.path) {
          <a [routerLink]="item.path" routerLinkActive="admin-nav-active" [routerLinkActiveOptions]="{exact:item.path === '/admin'}" (click)="mobileOpen.set(false)" [title]="collapsed() ? item.label : ''" class="group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg group-hover:bg-amber-400/15">{{item.icon}}</span>
            @if (!collapsed()) { <span>{{item.label}}</span> }
          </a>
        }
      </nav>
      <div class="border-t border-white/10 p-4">
        @if (!collapsed()) { <div class="mb-4 flex items-center gap-3 rounded-xl bg-black/15 p-3"><div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/15 font-bold text-amber-100">{{ initials() }}</div><div class="min-w-0"><p class="truncate text-sm font-bold">{{auth.currentUser()?.fullName || 'مستخدم لوحة التحكم'}}</p><p class="mt-0.5 text-xs text-white/55">{{roleLabel()}}</p></div></div> }
        <div class="flex items-center justify-between gap-2"><a routerLink="/" class="rounded-lg px-2 py-2 text-xs text-white/60 hover:bg-white/10 hover:text-white" [title]="collapsed() ? 'المتجر العام' : ''">🏠 @if (!collapsed()) { <span>المتجر</span> }</a><button type="button" (click)="logout()" class="rounded-lg px-2 py-2 text-xs font-bold text-rose-200 hover:bg-rose-400/10">↪ @if (!collapsed()) { <span>تسجيل الخروج</span> }</button></div>
      </div>
    </aside>
  `,
  styles: [`.admin-nav-active{background:linear-gradient(110deg,#f47621,#db5b12);color:#fff;box-shadow:0 8px 24px #f4762130}.admin-nav-active span:first-child{background:#ffffff25}`]
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
    { path:'/admin/settings', label:'إعدادات المتجر', icon:'⚙', roles:['Admin','SuperAdmin'] },
    { path:'/admin/staff', label:'إدارة المستخدمين والصلاحيات', icon:'♙', roles:['Admin','SuperAdmin'] },
  ];
  visibleItems() { const role=this.auth.currentUser()?.role || ''; return this.items.filter(item => item.roles.includes(role)); }
  roleLabel() { return ({User:'موظف الطلبات',Admin:'مدير',SuperAdmin:'مدير عام'} as Record<string,string>)[this.auth.currentUser()?.role || ''] || 'حساب'; }
  initials() { return (this.auth.currentUser()?.fullName || 'م').trim().slice(0,1); }
  toggleCollapsed() { this.collapsed.update(value => !value); localStorage.setItem('souq_admin_sidebar_collapsed',String(this.collapsed())); }
  logout() { if (confirm('هل أنت متأكد من تسجيل الخروج؟')) this.auth.logout(); }
}
