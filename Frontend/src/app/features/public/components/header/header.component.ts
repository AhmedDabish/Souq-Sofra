import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { LocationService } from '../../../../core/services/location.service';
import { ApiService } from '../../../../core/services/api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { DeliveryMapComponent } from '../delivery-map/delivery-map.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DeliveryMapComponent],
  template: `
    <!-- Desktop & Tablet Header - Balanced Height & Cohesive Grouping -->
    <header [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'" class="relative lg:sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-headerBg backdrop-blur-md shadow-xs py-1.5 lg:py-2">
      <div class="container-wide mx-auto px-2 md:px-4">
        <div class="flex items-center justify-between flex-nowrap min-h-[72px] lg:min-h-[82px]">

          <!-- Right/Start Group: Large Logo, Enriched Location Selector, and Compactly Placed Navigation Links -->
          <div class="hidden lg:flex items-center gap-3.5 md:gap-5 lg:gap-6 flex-nowrap">
            <!-- Large Logo -->
            <a class="shrink-0 hidden md:block relative z-50" routerLink="/">
              <div class="flex items-center justify-center drop-shadow-md">
                <div class="relative py-0.5">
                  <img
                    [alt]="language.t('سوق وسفرة', 'Souq & Sofra')"
                    width="84"
                    height="84"
                    class="w-16 h-16 md:w-20 md:h-20 lg:w-22 lg:h-22 object-cover rounded-full border-2 border-secondary/60 shadow-sm transition-transform duration-200 hover:scale-105"
                    [src]="logoUrl()">
                </div>
              </div>
            </a>

            <!-- Enlarged Location Selector Pill -->
            <button
              type="button"
              (click)="openLocationModal()"
              class="cursor-pointer hidden md:flex items-center gap-2.5 text-sm md:text-base font-bold group border-2 border-gray-200 hover:border-secondary px-3.5 py-2 md:py-2.5 rounded-full transition-all text-gray-800 duration-200 shadow-2xs bg-white hover:shadow-xs">
              <div class="bg-secondary p-2 rounded-full text-primaryDark group-hover:text-white transition-colors duration-200 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin" aria-hidden="true">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <span class="hidden lg:inline-block xl:max-w-[260px] max-w-[170px] truncate text-gray-800 font-extrabold" [title]="locationService.selectedLocation()">
                {{ locationService.selectedLocation() }}
              </span>
            </button>

            <!-- Navigation Links adjacent to Logo & Location to eliminate wide empty gap -->
            <nav class="hidden font-bold navbar-links lg:flex items-center gap-4 lg:gap-6 flex-nowrap overflow-hidden">
              <a
                routerLink="/menu"
                routerLinkActive="text-headerTextActive after:scale-x-100"
                class="itm header-link relative text-sm lg:text-base xl:text-lg transition-colors hover:text-headerTextActive after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-headerTextActive after:transition-transform after:duration-300 after:origin-center text-headerText after:scale-x-0 hover:after:scale-x-100 whitespace-nowrap" >
                {{ language.t('منيو سوق وسفرة', 'Souq & Sofra Menu') }}
              </a>
              <a
                routerLink="/contact"
                routerLinkActive="text-headerTextActive after:scale-x-100"
                class="itm header-link relative text-sm lg:text-base xl:text-lg transition-colors hover:text-headerTextActive after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-headerTextActive after:transition-transform after:duration-300 after:origin-center text-headerText after:scale-x-0 hover:after:scale-x-100 whitespace-nowrap" >
                {{ language.t('الفروع وتواصل معنا', 'Branches & Contact') }}
              </a>
            </nav>
          </div>

          <!-- Left/End: User Actions (Search, Language, Cart, Profile) -->
          <div class="hidden lg:flex items-center gap-2 md:gap-3 shrink-0">
            <!-- Search Expandable Input -->
            <div class="hidden md:block">
              <form (ngSubmit)="onSearch()" class="relative transition-all duration-300 gray-bg hover:bg-gray-100 flex items-center rounded-[24px] border border-gray-200 h-[42px]" [class.w-[280px]]="searchOpen" [class.w-[44px]]="!searchOpen" [class.px-2]="searchOpen">
                @if (searchOpen) {
                  <input #productSearch autofocus [attr.aria-label]="language.t('ابحث عن منتج...', 'Search for a product...')" type="search" [placeholder]="language.t('ابحث عن منتج...', 'Search for a product...')" [(ngModel)]="searchQuery" name="productSearch" class="min-w-0 flex-1 bg-transparent outline-none border-0 text-sm text-gray-800">
                  @if (searchQuery) { <button type="button" (click)="searchQuery = ''; onSearch()" [attr.aria-label]="language.t('مسح البحث', 'Clear search')" class="px-1 text-gray-400 hover:text-primary">×</button> }
                }
                <button [type]="searchOpen && searchQuery.trim() ? 'submit' : 'button'" (click)="!searchOpen || !searchQuery.trim() ? toggleSearch($event) : null" [attr.aria-label]="searchOpen && searchQuery.trim() ? language.t('تنفيذ البحث', 'Submit search') : language.t('فتح البحث عن المنتجات', 'Open product search')" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-700 hover:bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
                </button>
                @if (searchOpen && searchQuery.trim()) { <button type="submit" [attr.aria-label]="language.t('تنفيذ البحث', 'Submit search')" class="absolute -bottom-10 left-0 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow" >{{ language.t('بحث عن المنتج', 'Search products') }}</button> }
              </form>
            </div>

            <!-- Language Button -->
            <button
              type="button"
              (click)="language.toggle()"
              [attr.aria-label]="language.isEnglish() ? 'Switch to Arabic' : 'Switch to English'"
              class="lang-btn !font-bold cursor-pointer rtl:pt-1 gray-bg hidden md:flex items-center justify-center w-[44px] h-[42px] rounded-[24px] hover:bg-gray-100 transition-colors text-sm border border-gray-200">
              {{ language.isEnglish() ? 'عربي' : 'EN' }}
            </button>

            <!-- Cart Drawer Button -->
            <div class="gray-bg hidden md:block border border-gray-200 rounded-[24px] w-[44px] h-[42px] md:flex items-center justify-center hover:bg-gray-100 transition-colors relative">
              <a
                routerLink="/cart"
                [attr.aria-label]="language.t('سلة المشتريات', 'Shopping cart')"
                class="relative p-2 rounded-full transition-colors text-gray-800 cursor-pointer">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="176" cy="416" r="16" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></circle>
                  <circle cx="400" cy="416" r="16" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></circle>
                  <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M48 80h64l48 272h256"></path>
                  <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M160 288h249.44a8 8 0 0 0 7.85-6.43l28.8-144a8 8 0 0 0-7.85-9.57H128"></path>
                </svg>
                @if (cart.totalCount() > 0) {
                  <span class="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {{ cart.totalCount() }}
                  </span>
                }
              </a>
            </div>

            <!-- Login / Admin Button -->
            <div class="hidden md:block bg-primary rounded-[24px] w-[44px] h-[42px] md:flex items-center justify-center">
              <a
                class="hidden md:flex p-2 rounded-full transition-colors text-white"
                routerLink="/admin/login"
                [attr.title]="language.t('لوحة الإدارة', 'Admin dashboard')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user" aria-hidden="true">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </a>
            </div>
          </div>

          <!-- Compact header for phones and tablets -->
          <div class="lg:hidden flex items-center justify-between w-full py-1.5">
            <a routerLink="/" class="min-w-0 shrink-0 flex items-center gap-1.5 sm:gap-2.5">
              <img [src]="logoUrl()" [alt]="language.t('سوق وسفرة', 'Souq & Sofra')" class="h-11 w-11 rounded-full object-cover border-2 border-secondary shadow-sm sm:h-14 sm:w-14">
              <span class="max-[359px]:hidden text-sm sm:text-base font-extrabold font-baloo text-primaryDark">{{ language.t('سوق وسفرة', 'Souq & Sofra') }}</span>
            </a>

            <div class="flex shrink-0 items-center gap-1 sm:gap-2">
              <button type="button" (click)="language.toggle()" [attr.aria-label]="language.isEnglish() ? 'Switch to Arabic' : 'Switch to English'" class="h-9 rounded-full border border-gray-200 bg-white px-2.5 text-xs font-bold text-primaryDark sm:h-[42px] sm:px-3">{{ language.isEnglish() ? 'عربي' : 'EN' }}</button>
              <button type="button" (click)="toggleSearch($event)" [attr.aria-label]="language.t('فتح البحث عن المنتجات', 'Open product search')" class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 sm:h-[42px] sm:w-[42px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>
              <button
                type="button"
                (click)="openLocationModal()"
                class="flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-secondary/80 bg-white px-2 text-xs font-bold text-gray-700 shadow-xs sm:h-auto sm:w-auto sm:py-1.5 sm:px-3.5">
                <svg class="h-4 w-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                <span class="max-w-[130px] truncate max-[359px]:hidden">{{ locationLabel(locationService.selectedLocation()) }}</span>
              </button>

              <a
                routerLink="/cart"
                [attr.aria-label]="language.t('سلة المشتريات', 'Shopping cart')"
                class="relative gray-bg border border-gray-200 rounded-full h-9 w-9 sm:h-[42px] sm:w-[42px] flex items-center justify-center">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="176" cy="416" r="16" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></circle>
                  <circle cx="400" cy="416" r="16" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></circle>
                  <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M48 80h64l48 272h256"></path>
                  <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M160 288h249.44a8 8 0 0 0 7.85-6.43l28.8-144a8 8 0 0 0-7.85-9.57H128"></path>
                </svg>
                @if (cart.totalCount() > 0) {
                  <span class="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {{ cart.totalCount() }}
                  </span>
                }
              </a>
            </div>
          </div>
          @if (searchOpen) {
            <form (ngSubmit)="onSearch()" class="md:hidden flex items-center gap-2 pb-3">
              <input [(ngModel)]="searchQuery" name="mobileProductSearch" type="search" autofocus [placeholder]="language.t('ابحث عن منتج...', 'Search for a product...')" [attr.aria-label]="language.t('ابحث عن منتج', 'Search for a product')" class="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary">
              @if (searchQuery.trim()) { <button type="submit" [attr.aria-label]="language.t('تنفيذ البحث', 'Submit search')" class="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">{{ language.t('بحث', 'Search') }}</button> }
              <button type="button" (click)="searchQuery = ''; onSearch()" [attr.aria-label]="language.t('مسح البحث', 'Clear search')" class="rounded-xl bg-gray-100 px-3 py-2 text-lg text-gray-600">×</button>
            </form>
          }

        </div>
      </div>
    </header>

    <!-- Location Selection Modal -->
    @if (locationService.isModalOpen()) {
      <div class="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm transition-opacity" (click)="locationService.closeModal()"></div>
      <section
        role="dialog"
        aria-modal="true"
        [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'"
        [attr.aria-label]="language.t('حدد موقعك', 'Set your location')"
        class="fixed inset-0 z-[101] m-auto flex max-h-[min(94dvh,820px)] w-[min(960px,calc(100%-24px))] flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_32px_90px_-28px_rgba(0,0,0,.55)] animate-in fade-in zoom-in-95">
        <header class="relative z-10 flex shrink-0 items-center justify-between gap-4 border-b border-orange-100 bg-gradient-to-l from-orange-50 via-white to-white px-5 py-4 sm:px-7">
          <div class="flex min-w-0 items-center gap-3">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl text-white shadow-lg shadow-orange-900/15">📍</span>
            <div class="min-w-0">
              <h2 class="font-baloo text-xl font-black tracking-tight text-primaryDark sm:text-2xl">{{ language.t('حدد موقعك', 'Set your location') }}</h2>
              <p class="mt-0.5 text-xs leading-5 text-gray-500 sm:text-sm">{{ language.t('حرّك الدبوس أو اضغط على الخريطة لاختيار مكان التوصيل بدقة', 'Move the pin or tap the map to set your delivery location') }}</p>
            </div>
          </div>
          <button type="button" [attr.aria-label]="language.t('إغلاق', 'Close')" (click)="locationService.closeModal()" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </header>

        <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[#fffaf5] p-4 sm:p-6">
          <div class="relative min-h-[350px] flex-1 overflow-hidden rounded-[22px] border border-gray-200 bg-slate-900 shadow-[0_16px_40px_-20px_rgba(15,23,42,.45)] sm:min-h-[430px]">
            <div class="absolute inset-x-3 top-3 z-[1001] mx-auto w-full max-w-lg sm:inset-x-5 sm:top-5">
              <div class="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 p-1.5 shadow-xl shadow-black/15 backdrop-blur-md">
                <span class="ms-2 shrink-0 text-primary" aria-hidden="true">⌕</span>
                <input [attr.aria-label]="language.t('ابحث عن موقعك', 'Search for your location')" [placeholder]="language.t('ابحث عن شارع أو منطقة...', 'Search street or area...')" [(ngModel)]="searchLocationText" (keyup.enter)="onLocationSearch()" class="min-w-0 flex-1 border-0 bg-transparent px-1 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400" autocomplete="off" type="text">
                <button type="button" (click)="onLocationSearch()" class="shrink-0 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-primaryDark">{{ language.t('بحث', 'Search') }}</button>
              </div>
            </div>

            <app-delivery-map class="absolute inset-0 block h-full w-full" [latitude]="currentLat" [longitude]="currentLng" [defaultMapType]="'satellite'" (locationChange)="onModalLocationChange($event)"></app-delivery-map>

            <button type="button" (click)="detectLocation()" class="absolute bottom-4 end-4 z-[1001] flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-primaryDark shadow-xl transition hover:-translate-y-0.5 hover:bg-orange-50" [attr.title]="language.t('تحديد موقعي الحالي', 'Find my current location')" [attr.aria-label]="language.t('تحديد موقعي الحالي', 'Find my current location')">
              <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" x2="18" y1="12" y2="12"></line><line x1="6" x2="2" y1="12" y2="12"></line><line x1="12" x2="12" y1="6" y2="2"></line><line x1="12" x2="12" y1="22" y2="18"></line></svg>
            </button>

            <div class="absolute bottom-4 start-4 z-[1001] flex max-w-[calc(100%-88px)] items-center gap-2 rounded-2xl border border-white/70 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur-md sm:max-w-[70%]">
              <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
              <span class="truncate text-xs font-extrabold text-gray-800 sm:text-sm">{{ locationLabel(tempLocationName) }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 overflow-x-auto rounded-2xl border border-orange-100 bg-white p-3 shadow-sm">
            <span class="shrink-0 text-[11px] font-extrabold text-gray-400">{{ language.t('مناطق قريبة', 'Popular areas') }}</span>
            @for (area of popularAreas; track area) {
              <button type="button" (click)="selectArea(area)" class="shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition" [class.border-primary]="tempLocationName.includes(area)" [class.bg-primary]="tempLocationName.includes(area)" [class.text-white]="tempLocationName.includes(area)" [class.border-gray-200]="!tempLocationName.includes(area)" [class.text-gray-700]="!tempLocationName.includes(area)">{{ area }}</button>
            }
          </div>

          @if (isManualMode) {
            <div class="grid grid-cols-1 gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:grid-cols-2">
              <label class="text-xs font-bold text-gray-700">{{ language.t('المحافظة / الإمارة', 'City / Emirate') }}<input type="text" [(ngModel)]="manualCity" class="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-primary focus:bg-white"></label>
              <label class="text-xs font-bold text-gray-700">{{ language.t('المنطقة / الحي', 'Area / Neighborhood') }}<input type="text" [(ngModel)]="manualArea" class="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-primary focus:bg-white"></label>
              <label class="text-xs font-bold text-gray-700 sm:col-span-2">{{ language.t('تفاصيل العنوان', 'Address details') }}<textarea [(ngModel)]="manualStreet" rows="2" class="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"></textarea></label>
              <label class="text-xs font-bold text-gray-700">{{ language.t('المبنى والشقة', 'Building and apartment') }}<input type="text" [(ngModel)]="manualBuilding" class="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-primary focus:bg-white"></label>
              <label class="text-xs font-bold text-gray-700">{{ language.t('ملاحظات للمندوب', 'Delivery notes') }}<input type="text" [(ngModel)]="manualNotes" class="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-primary focus:bg-white"></label>
            </div>
          }
        </div>

        <footer class="flex shrink-0 flex-col gap-3 border-t border-orange-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button type="button" (click)="toggleManualMode()" class="order-2 self-center rounded-xl px-3 py-2 text-xs font-bold text-gray-500 transition hover:bg-orange-50 hover:text-primaryDark sm:order-1">{{ isManualMode ? language.t('الرجوع للخريطة', 'Back to map') : language.t('إضافة تفاصيل العنوان يدوياً', 'Add address details manually') }}</button>
          <button type="button" (click)="confirmModalSelection()" class="order-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-900/15 transition hover:-translate-y-0.5 hover:bg-primaryDark sm:order-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>{{ language.t('حفظ الموقع وتأكيد العنوان', 'Save location & confirm') }}</span>
          </button>
        </footer>
      </section>
    }
  `
})
export class HeaderComponent implements OnInit {
  cart = inject(CartService);
  locationService = inject(LocationService);
  private api = inject(ApiService);
  logo = signal('assets/MAIN.jpg');
  private router = inject(Router);
  language = inject(LanguageService);

  constructor() {
    effect(() => {
      if (this.locationService.isModalOpen()) this.syncFromService();
    });
  }

  searchQuery = '';
  searchOpen = false;

  // Modal State
  isManualMode = false;
  locationDetected = false;
  searchLocationText = '';
  tempLocationName = 'أبوظبي - الكورنيش';
  currentLat: number = 24.4750;
  currentLng: number = 54.3400;

  // Manual Form Fields
  manualCity = 'أبوظبي';
  manualArea = 'الكورنيش';
  manualStreet = '';
  manualBuilding = '';
  manualNotes = '';

  popularAreas = [
    'الكورنيش',
    'الخالدية',
    'المرور',
    'البطين',
    'جزيرة الريم',
    'جزيرة المارية',
    'مدينة خليفة',
    'شاطئ الراحة'
  ];

  ngOnInit() {
    this.syncFromService();
    this.api.getSettings().subscribe({ next: settings => { this.logo.set(this.resolveImage(settings['StoreLogo'])); }, error: () => {} });
  }

  logoUrl() { return this.logo(); }
  locationLabel(value: string): string {
    if (!this.language.isEnglish()) return value;
    const names: Record<string, string> = { 'أبوظبي': 'Abu Dhabi', 'دبي': 'Dubai', 'الشارقة': 'Sharjah', 'عجمان': 'Ajman', 'أم القيوين': 'Umm Al Quwain', 'رأس الخيمة': 'Ras Al Khaimah', 'الفجيرة': 'Fujairah', 'الكورنيش': 'Corniche', 'الخالدية': 'Khalidiya', 'المرور': 'Al Muroor', 'البطين': 'Al Bateen', 'جزيرة الريم': 'Reem Island', 'جزيرة المارية': 'Al Maryah Island', 'مدينة خليفة': 'Khalifa City', 'شاطئ الراحة': 'Al Raha Beach', 'شارع الكورنيش': 'Corniche Street', 'استلام من فرع الكورنيش': 'Pickup at Corniche branch', 'اختر الموقع...': 'Choose a location...', 'موقعي الحالي': 'My current location' };
    return Object.entries(names).sort(([a], [b]) => b.length - a.length).reduce((text, [ar, en]) => text.replaceAll(ar, en), value);
  }
  private resolveImage(url?: string) {
    if (!url) return 'assets/MAIN.jpg';
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }

  private syncFromService() {
    const currentLoc = this.locationService.selectedLocation();
    this.tempLocationName = (currentLoc && currentLoc !== 'اختر الموقع...') ? currentLoc : 'أبوظبي - الكورنيش';
    this.locationDetected = !!currentLoc && currentLoc !== 'اختر الموقع...';
    const coords = this.locationService.selectedCoordinates();
    this.currentLat = coords?.latitude ?? 24.4750;
    this.currentLng = coords?.longitude ?? 54.3400;
    const manual = this.locationService.manualAddress();
    this.manualCity = manual.city || 'أبوظبي';
    this.manualArea = manual.area || 'الكورنيش';
    this.manualStreet = manual.street || '';
    this.manualBuilding = manual.building || '';
    this.manualNotes = manual.notes || '';
  }

  openLocationModal() {
    this.syncFromService();
    this.locationService.openModal();
  }

  onModalLocationChange(point: { latitude: number; longitude: number }) {
    this.currentLat = point.latitude;
    this.currentLng = point.longitude;
    this.locationDetected = true;
    this.reverseGeocode(point.latitude, point.longitude);
  }

  private reverseGeocode(lat: number, lng: number) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`, {
      headers: { 'User-Agent': 'SouqSofraApp/1.0' }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.address) {
          const addr = data.address;
          const parts = [
            addr.road || addr.suburb || addr.neighbourhood,
            addr.city || addr.town || addr.county || 'أبوظبي'
          ].filter(Boolean);
          if (parts.length) {
            this.tempLocationName = parts.join(' - ');
            this.manualArea = addr.road || addr.suburb || addr.neighbourhood || this.manualArea;
          } else if (data.display_name) {
            this.tempLocationName = data.display_name.split(',').slice(0, 2).join(' - ');
          }
        }
      })
      .catch(() => {});
  }

  toggleManualMode() {
    this.isManualMode = !this.isManualMode;
  }

  selectArea(area: string) {
    const coords: Record<string, [number, number]> = {
      'الكورنيش': [24.4750, 54.3400],
      'الخالدية': [24.4700, 54.3500],
      'المرور': [24.4400, 54.3900],
      'البطين': [24.4550, 54.3400],
      'جزيرة الريم': [24.4950, 54.4050],
      'جزيرة المارية': [24.5000, 54.3900],
      'مدينة خليفة': [24.4200, 54.5800],
      'شاطئ الراحة': [24.4450, 54.6000]
    };
    if (coords[area]) {
      this.currentLat = coords[area][0];
      this.currentLng = coords[area][1];
      this.tempLocationName = `أبوظبي - ${area}`;
      this.manualArea = area;
      this.locationDetected = true;
    }
  }

  onLocationSearch() {
    const query = this.searchLocationText.trim();
    if (!query) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' الإمارات')}&accept-language=ar&limit=1`, {
      headers: { 'User-Agent': 'SouqSofraApp/1.0' }
    })
      .then(res => res.json())
      .then(results => {
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          this.currentLat = lat;
          this.currentLng = lon;
          this.tempLocationName = query;
          this.locationDetected = true;
        }
      })
      .catch(() => {});
  }

  detectLocation() {
    this.locationDetected = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.currentLat = pos.coords.latitude;
          this.currentLng = pos.coords.longitude;
          this.tempLocationName = 'موقعي الحالي (GPS)';
          this.reverseGeocode(this.currentLat, this.currentLng);
        },
        () => {
          this.currentLat = 24.4750;
          this.currentLng = 54.3400;
          this.tempLocationName = 'أبوظبي - شارع الكورنيش';
        }
      );
    } else {
      this.currentLat = 24.4750;
      this.currentLng = 54.3400;
      this.tempLocationName = 'أبوظبي - شارع الكورنيش';
    }
  }

  confirmModalSelection() {
    let finalLocationName = this.tempLocationName;
    if (this.isManualMode && this.manualArea.trim()) {
      const parts = [this.manualCity, this.manualArea, this.manualStreet].filter(p => !!p?.trim());
      finalLocationName = parts.join(' - ');
    }

    this.locationService.saveSelection(
      'delivery',
      finalLocationName,
      {
        city: this.manualCity,
        area: this.manualArea,
        street: this.manualStreet,
        building: this.manualBuilding,
        notes: this.manualNotes
      },
      (this.currentLat !== null && this.currentLng !== null)
        ? { latitude: this.currentLat, longitude: this.currentLng }
        : null
    );
  }

  toggleSearch(event?: Event) {
    event?.stopPropagation();
    if (!this.searchOpen) {
      this.searchOpen = true;
      setTimeout(() => document.querySelector<HTMLInputElement>('input[name="productSearch"]')?.focus(), 0);
    } else if (this.searchQuery.trim()) {
      this.onSearch();
    } else {
      this.searchOpen = false;
    }
  }

  onSearch() {
    const query = this.searchQuery.trim();
    this.router.navigate(['/menu'], { queryParams: { search: query || null } });
    if (!query) this.searchOpen = false;
  }
}
