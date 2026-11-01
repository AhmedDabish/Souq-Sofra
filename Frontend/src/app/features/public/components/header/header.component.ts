import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Desktop & Tablet Header - Exact More-In Structure & Classes -->
    <header class="relative md:sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-headerBg backdrop-blur-md shadow-sm py-0">
      <div class="container-wide mx-auto px-2 md:px-4">
        <div class="flex items-center justify-between flex-nowrap min-h-[64px]">
          
          <!-- Start/Right: Logo and Location -->
          <div class="flex gap-2 items-center">
            <a class="shrink-0 hidden md:block relative z-50" routerLink="/">
              <div class="logo-img-wrap left-0 bg-contain bg-no-repeat bg-top flex items-center justify-center drop-shadow-md">
                <div class="relative py-2 logo-img">
                  <img 
                    alt="سوق وسفرة" 
                    width="50" 
                    height="50" 
                    class="object-cover rounded-full border border-secondary/40" 
                    src="assets/MAIN.jpg">
                </div>
              </div>
            </a>

            <!-- Location Selector Pill -->
            <button 
              type="button"
              routerLink="/contact"
              class="cursor-pointer hidden md:flex items-center gap-2 text-sm font-medium group border-[1.5px] hover:border-secondary p-2 py-1.5 rounded-full transition-colors text-headerText duration-200">
              <div class="bg-secondary p-1.5 rounded-full text-primaryDark group-hover:text-white transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin" aria-hidden="true">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <span class="hidden lg:inline-block xl:max-w-[250px] max-w-[150px] truncate font-bold text-gray-700" title="أبوظبي - الكورنيش">أبوظبي - الكورنيش</span>
            </button>
          </div>

          <!-- End/Left: Navigation Links, Search, Lang, Cart, User -->
          <div class="hidden md:flex items-center gap-2 md:gap-3 shrink-0">
            <nav class="hidden pe-5 font-bold navbar-links md:flex items-center gap-6 2xl:gap-8 flex-nowrap overflow-hidden transition-[opacity,transform,max-width] duration-500 max-w-[1000px] opacity-100">
              <a 
                routerLink="/menu" 
                routerLinkActive="text-headerTextActive after:scale-x-100" 
                class="itm header-link relative text-sm lg:text-lg transition-colors hover:text-headerTextActive after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-headerTextActive after:transition-transform after:duration-300 after:origin-center text-headerText after:scale-x-0 hover:after:scale-x-100">
                منيو سوق وسفرة
              </a>
              <a 
                routerLink="/contact" 
                routerLinkActive="text-headerTextActive after:scale-x-100" 
                class="itm header-link relative text-sm lg:text-lg transition-colors hover:text-headerTextActive after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-headerTextActive after:transition-transform after:duration-300 after:origin-center text-headerText after:scale-x-0 hover:after:scale-x-100">
                عن سوق وسفرة
              </a>
            </nav>

            <!-- Search Expandable Input -->
            <div class="hidden md:block">
              <div class="relative transition-all duration-300 gray-bg hover:bg-gray-100 flex items-center rounded-[24px] border border-gray-200 cursor-pointer h-[32px] w-[36px] focus-within:w-[220px] focus-within:px-2 justify-center group">
                <input 
                  aria-label="ابحث عن منتج..." 
                  type="text" 
                  placeholder="ابحث عن منتج..." 
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="onSearch()"
                  class="bg-transparent outline-none border-0 transition-all duration-300 ease-in-out text-sm w-0 px-0 opacity-0 group-focus-within:w-full group-focus-within:opacity-100 group-focus-within:px-1 text-gray-800">
                <button type="button" (click)="onSearch()" aria-label="بحث" class="shrink-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search text-gray-700 size-[20px]" aria-hidden="true">
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Language Button -->
            <button 
              type="button"
              class="lang-btn !font-bold cursor-pointer rtl:pt-1 gray-bg hidden md:flex items-center justify-center w-[36px] h-[32px] rounded-[24px] hover:bg-gray-100 transition-colors text-sm border border-gray-200">
              EN
            </button>

            <!-- Cart Drawer Button -->
            <div class="gray-bg hidden md:block border border-gray-200 rounded-[24px] w-[36px] h-[32px] md:flex items-center justify-center hover:bg-gray-100 transition-colors relative">
              <button 
                type="button" 
                (click)="cart.toggleDrawer()" 
                aria-label="سلة المشتريات" 
                class="relative p-2 rounded-full transition-colors text-gray-800 cursor-pointer flex items-center justify-center">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="176" cy="416" r="16" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></circle>
                  <circle cx="400" cy="416" r="16" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></circle>
                  <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M48 80h64l48 272h256"></path>
                  <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M160 288h249.44a8 8 0 0 0 7.85-6.43l28.8-144a8 8 0 0 0-7.85-9.57H128"></path>
                </svg>
                @if (cart.totalCount() > 0) {
                  <span class="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {{ cart.totalCount() }}
                  </span>
                }
              </button>
            </div>

            <!-- Login / Admin Button -->
            <div class="hidden md:block bg-primary rounded-[24px] w-[36px] h-[32px] md:flex items-center justify-center">
              <a 
                class="hidden md:flex p-2 rounded-full transition-colors text-white" 
                routerLink="/admin/login" 
                title="تسجيل الدخول">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user" aria-hidden="true">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </a>
            </div>

          </div>

          <!-- Mobile Header (Visible on screens < md) -->
          <div class="md:hidden flex items-center justify-between w-full py-2">
            <a routerLink="/" class="shrink-0 flex items-center gap-2">
              <img src="assets/MAIN.jpg" alt="سوق وسفرة" class="w-10 h-10 rounded-full object-cover border border-secondary shadow-sm">
              <span class="text-base font-extrabold font-baloo text-primaryDark">سوق وسفرة</span>
            </a>

            <div class="flex items-center gap-2">
              <button 
                routerLink="/contact" 
                class="flex items-center gap-1.5 px-3 py-1 border border-secondary rounded-full text-xs font-bold text-gray-700">
                <span class="w-2 h-2 rounded-full bg-secondary"></span>
                <span>أبوظبي</span>
              </button>

              <button 
                type="button" 
                (click)="cart.toggleDrawer()" 
                aria-label="سلة المشتريات" 
                class="relative gray-bg border border-gray-200 rounded-[24px] w-[36px] h-[32px] flex items-center justify-center">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="176" cy="416" r="16" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></circle>
                  <circle cx="400" cy="416" r="16" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></circle>
                  <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M48 80h64l48 272h256"></path>
                  <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M160 288h249.44a8 8 0 0 0 7.85-6.43l28.8-144a8 8 0 0 0-7.85-9.57H128"></path>
                </svg>
                @if (cart.totalCount() > 0) {
                  <span class="absolute -top-1 -right-1 bg-secondary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {{ cart.totalCount() }}
                  </span>
                }
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  cart = inject(CartService);
  private router = inject(Router);
  searchQuery = '';

  onSearch() {
    if (this.searchQuery && this.searchQuery.trim()) {
      this.router.navigate(['/menu'], { queryParams: { search: this.searchQuery.trim() } });
    }
  }
}
