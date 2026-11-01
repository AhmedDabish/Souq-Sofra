import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Slim location/announcement bar inspired by the reference header -->
    <div class="bg-[#fff7ec] border-b border-orange-100 text-[#4a5565] text-[11px] sm:text-xs">
      <div class="max-w-[1500px] mx-auto px-3 sm:px-6 h-9 flex items-center justify-between gap-3">
        <a href="tel:026333136" class="flex items-center gap-2 hover:text-[#f47621] transition-colors"><span class="text-[#f47621]">☎</span><span>02 633 3136</span></a>
        <p class="truncate text-center">طازج من فرن سوق وسفرة إلى سفرتك</p>
        <button type="button" class="font-bold hover:text-[#f47621] transition-colors" aria-label="تغيير اللغة">EN</button>
      </div>
    </div>

    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div class="max-w-[1500px] mx-auto px-3 sm:px-6">
        <div class="min-h-[76px] flex items-center justify-between gap-3">
          <!-- Brand and delivery location -->
          <div class="flex items-center gap-3 sm:gap-5">
            <a routerLink="/" class="shrink-0 flex items-center gap-2.5 group">
              <img src="assets/MAIN.jpg" alt="شعار سوق وسفرة" class="w-12 h-12 sm:w-[54px] sm:h-[54px] rounded-full object-cover border border-[#fbb042]/60 shadow-sm group-hover:scale-[1.03] transition-transform">
              <span class="hidden sm:flex flex-col leading-tight">
                <span class="text-lg sm:text-xl font-extrabold font-baloo text-[#681c0f]">سوق وسفرة</span>
                <span class="text-[10px] text-gray-400">مطعم ومخبز</span>
              </span>
            </a>
            <a routerLink="/contact" class="hidden md:flex items-center gap-2 border border-gray-200 hover:border-[#fbb042] px-3 py-1.5 rounded-full transition-colors text-gray-600">
              <span class="w-8 h-8 rounded-full bg-[#fbb042]/20 text-[#681c0f] flex items-center justify-center">⌖</span>
              <span class="flex flex-col"><span class="text-[10px] text-gray-400">التوصيل إلى</span><span class="text-xs font-bold">أبوظبي - الكورنيش</span></span>
            </a>
          </div>

          <!-- Main navigation -->
          <nav class="hidden lg:flex items-center gap-6 xl:gap-8 font-bold text-[#8b96a2]">
            <a routerLink="/" routerLinkActive="text-black" [routerLinkActiveOptions]="{exact: true}" class="relative py-2 text-sm xl:text-base hover:text-black transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-[#f47621] after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:transition-transform">الرئيسية</a>
            <a routerLink="/menu" routerLinkActive="text-black" class="relative py-2 text-sm xl:text-base hover:text-black transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-[#f47621] after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:transition-transform">منيو سوق وسفرة</a>
            <a routerLink="/contact" routerLinkActive="text-black" class="relative py-2 text-sm xl:text-base hover:text-black transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-[#f47621] after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:transition-transform">عن سوق وسفرة</a>
          </nav>

          <!-- Actions -->
          <div class="flex items-center gap-2 sm:gap-3">
            <a href="tel:026333136" class="hidden md:flex items-center gap-2 text-sm font-bold text-[#681c0f] hover:text-[#f47621] transition-colors">اتصل بنا</a>
            <button (click)="cart.toggleDrawer()" aria-label="فتح السلة" class="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#fff7ec] text-[#681c0f] hover:bg-[#fbb042]/30 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              @if (cart.totalCount() > 0) { <span class="absolute -top-1 -right-1 bg-[#f47621] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{{ cart.totalCount() }}</span> }
            </button>
            <a routerLink="/admin" aria-label="حسابي" class="hidden sm:flex w-10 h-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-[#fbb042] hover:text-[#f47621] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </a>
            <a routerLink="/menu" class="hidden sm:inline-flex rounded-full bg-[#f47621] hover:bg-[#e66b1c] text-white font-bold text-xs px-4 py-2.5 shadow-sm transition-colors">اطلب الآن</a>
          </div>
        </div>
        <!-- Mobile menu strip -->
        <nav class="lg:hidden flex items-center gap-5 overflow-x-auto no-scrollbar border-t border-gray-100 py-2.5 text-xs font-bold text-[#8b96a2]">
          <a routerLink="/" class="shrink-0 hover:text-[#f47621]">الرئيسية</a>
          <a routerLink="/menu" class="shrink-0 hover:text-[#f47621]">المنيو</a>
          <a routerLink="/contact" class="shrink-0 hover:text-[#f47621]">الفروع والتواصل</a>
          <a href="https://wa.me/971503157884" class="shrink-0 hover:text-[#f47621]">واتساب</a>
        </nav>
      </div>
    </header>
  `
})
export class HeaderComponent {
  cart = inject(CartService);
}
