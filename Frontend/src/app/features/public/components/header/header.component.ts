import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-3 sm:px-6">
        <div class="flex items-center justify-between h-20">
          
          <!-- Right: Logo & Location (RTL) -->
          <div class="flex items-center gap-4">
            <a routerLink="/" class="flex items-center gap-3 group">
              <div class="w-14 h-14 rounded-full border-2 border-primary/30 p-0.5 overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                <img src="assets/MAIN.jpg" alt="سوق وسفرة" class="w-full h-full object-cover rounded-full">
              </div>
              <div class="hidden sm:flex flex-col">
                <span class="text-xl font-bold font-baloo text-primaryDark tracking-wide">سوق وسفرة</span>
                <span class="text-xs text-gray-400 font-medium -mt-1">مطعم ومخبز | طعم أصيل</span>
              </div>
            </a>

            <!-- Location Selector (Matching More-In) -->
            <button class="hidden md:flex items-center gap-2 text-sm font-medium border border-gray-200 hover:border-primary px-3 py-1.5 rounded-full transition-colors text-gray-700 bg-gray-50/70">
              <div class="bg-primary/20 p-1.5 rounded-full text-primaryDark">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div class="flex flex-col text-start">
                <span class="text-[10px] text-gray-400">التوصيل إلى</span>
                <span class="font-bold text-xs truncate max-w-[160px]">أبوظبي - الكورنيش</span>
              </div>
            </button>
          </div>

          <!-- Center: Nav links -->
          <nav class="hidden lg:flex items-center gap-8 font-bold text-gray-700">
            <a routerLink="/" routerLinkActive="text-primary border-b-2 border-primary" [routerLinkActiveOptions]="{exact: true}" class="hover:text-primary transition-colors py-2 text-base">الرئيسية</a>
            <a routerLink="/menu" routerLinkActive="text-primary border-b-2 border-primary" class="hover:text-primary transition-colors py-2 text-base">منيو سوق وسفرة</a>
            <a routerLink="/about" class="hover:text-primary transition-colors py-2 text-base">عن المطعم</a>
            <a routerLink="/contact" class="hover:text-primary transition-colors py-2 text-base">الفروع والتواصل</a>
          </nav>

          <!-- Left: Actions (Search, Lang, Cart, User) -->
          <div class="flex items-center gap-2 sm:gap-3">
            
            <!-- Language Switcher -->
            <button class="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-xs font-bold hover:bg-gray-100 transition-colors">
              EN
            </button>

            <!-- Cart Trigger with Badge (More-In design) -->
            <button (click)="cart.toggleDrawer()" class="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primaryDark hover:bg-primary/20 transition-colors shadow-xs cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              @if (cart.totalCount() > 0) {
                <span class="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {{ cart.totalCount() }}
                </span>
              }
            </button>

            <!-- Admin / Profile Button -->
            <a routerLink="/admin" class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primaryHover transition-colors shadow-sm" title="لوحة التحكم">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </a>
          </div>

        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  cart = inject(CartService);
}
