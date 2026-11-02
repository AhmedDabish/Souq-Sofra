import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { LocationService } from '../../../../core/services/location.service';
import { ApiService } from '../../../../core/services/api.service';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Desktop & Tablet Header - Balanced Height & Cohesive Grouping -->
    <header [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'" class="relative md:sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-headerBg backdrop-blur-md shadow-xs py-1.5 md:py-2">
      <div class="container-wide mx-auto px-2 md:px-4">
        <div class="flex items-center justify-between flex-nowrap min-h-[72px] md:min-h-[82px]">

          <!-- Right/Start Group: Large Logo, Enriched Location Selector, and Compactly Placed Navigation Links -->
          <div class="flex items-center gap-3.5 md:gap-5 lg:gap-6 flex-nowrap">
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
            <nav class="hidden font-bold navbar-links md:flex items-center gap-4 lg:gap-6 flex-nowrap overflow-hidden">
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
          <div class="hidden md:flex items-center gap-2 md:gap-3 shrink-0">
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

          <!-- Mobile Header (Visible on screens < md) -->
          <div class="md:hidden flex items-center justify-between w-full py-1.5">
            <a routerLink="/" class="shrink-0 flex items-center gap-2.5">
              <img [src]="logoUrl()" [alt]="language.t('سوق وسفرة', 'Souq & Sofra')" class="w-14 h-14 rounded-full object-cover border-2 border-secondary shadow-sm">
              <span class="text-base font-extrabold font-baloo text-primaryDark">{{ language.t('سوق وسفرة', 'Souq & Sofra') }}</span>
            </a>

            <div class="flex items-center gap-2">
              <button type="button" (click)="language.toggle()" [attr.aria-label]="language.isEnglish() ? 'Switch to Arabic' : 'Switch to English'" class="h-[42px] rounded-full border border-gray-200 bg-white px-3 text-xs font-bold text-primaryDark">{{ language.isEnglish() ? 'عربي' : 'EN' }}</button>
              <button type="button" (click)="toggleSearch($event)" [attr.aria-label]="language.t('فتح البحث عن المنتجات', 'Open product search')" class="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>
              <button
                type="button"
                (click)="openLocationModal()"
                class="flex items-center gap-1.5 px-3.5 py-1.5 border border-secondary/80 rounded-full text-xs font-bold text-gray-700 bg-white shadow-xs">
                <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span class="max-w-[130px] truncate">{{ locationLabel(locationService.selectedLocation()) }}</span>
              </button>

              <a
                routerLink="/cart"
                [attr.aria-label]="language.t('سلة المشتريات', 'Shopping cart')"
                class="relative gray-bg border border-gray-200 rounded-[24px] w-[42px] h-[42px] flex items-center justify-center">
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

    <!-- Location & Delivery Selection Modal -->
    @if (locationService.isModalOpen()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs transition-opacity duration-300"
        (click)="locationService.closeModal()">
      </div>

      <!-- Dialog Body -->
      <div
        role="dialog"
        aria-modal="true"
        data-state="open"
        class="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] border shadow-lg duration-200 sm:rounded-3xl max-w-2xl xl:max-w-3xl p-0 overflow-hidden gap-0 bg-theme-bg/50 backdrop-blur-sm border-white/20 max-h-[95vh] animate-in fade-in zoom-in-95"
        tabindex="-1">

        <!-- Close Button -->
        <button
          type="button"
          [attr.aria-label]="language.t('إغلاق', 'Close')"
          (click)="locationService.closeModal()"
          class="absolute top-4 end-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 shadow-sm border border-gray-200 transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-5 h-5" aria-hidden="true">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>

        <div class="flex flex-col h-full md:h-[90vh] bg-white relative">

          <!-- Top Header: Title & Segmented Delivery / Pickup Switch -->
          <div class="shrink-0 px-4 pt-3 md:pt-5 pb-3 border-b border-gray-100 bg-linear-to-b from-orange-50/40 to-white">
            <div class="text-center mb-4">
              <h2 class="tracking-tight text-xl 2xl:text-2xl font-bold text-gray-900 font-baloo">{{ language.t('كيف تود أن تطلب؟', 'How would you like to order?') }}</h2>
              <p class="text-gray-500 text-xs mt-1">{{ language.t('اختر الطريقة المفضلة لديك.', 'Choose your preferred method.') }}</p>
            </div>

            <!-- Segmented Pill Tabs -->
            <div class="relative flex bg-gray-100 p-1 rounded-xl">
              <!-- Sliding Active Pill Indicator -->
              <div
                class="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-out"
                [style.right]="modalOrderType === 'delivery' ? '4px' : 'calc(50% + 2px)'">
              </div>

              <!-- Delivery Tab Button -->
              <button
                type="button"
                (click)="setModalOrderType('delivery')"
                class="relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors duration-300 cursor-pointer"
                [class.text-primary]="modalOrderType === 'delivery'"
                [class.text-gray-500]="modalOrderType !== 'delivery'">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck w-5 h-5">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 1 1 1h2"></path>
                  <path d="M15 18H9"></path>
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path>
                  <circle cx="17" cy="18" r="2"></circle>
                  <circle cx="7" cy="18" r="2"></circle>
                </svg>
                <span>{{ language.t('توصيل', 'Delivery') }}</span>
              </button>

              <!-- Pickup Tab Button -->
              <button
                type="button"
                (click)="setModalOrderType('pickup')"
                class="relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors duration-300 cursor-pointer"
                [class.text-primary]="modalOrderType === 'pickup'"
                [class.text-gray-500]="modalOrderType !== 'pickup'">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store w-5 h-5">
                  <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"></path>
                  <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"></path>
                  <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"></path>
                </svg>
                <span>{{ language.t('استلام من الفرع', 'Pickup') }}</span>
              </button>
            </div>
          </div>

          <!-- Middle Content Area -->
          <div class="flex flex-col flex-1 min-h-0 relative p-4 pb-0">

            <!-- 1. Delivery Mode View -->
            @if (modalOrderType === 'delivery') {
              <div class="relative flex flex-col flex-1 min-h-0 gap-3 w-full">

                @if (!isManualMode) {
                  <!-- Interactive Map Container -->
                  <div class="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">

                    <!-- Search Input Floating over Map -->
                    <div class="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[1000]">
                      <div class="relative w-full shadow-xl shadow-black/5">
                        <div class="relative group">
                          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search w-5 h-5">
                              <path d="m21 21-4.34-4.34"></path>
                              <circle cx="11" cy="11" r="8"></circle>
                            </svg>
                          </div>
                          <input
                            [attr.aria-label]="language.t('ابحث عن موقعك', 'Search for your location')"
                            [placeholder]="language.t('ابحث عن موقعك...', 'Search for your location...')"
                            [(ngModel)]="searchLocationText"
                            (keyup.enter)="onLocationSearch()"
                            class="w-full pl-12 pr-4 py-3.5 rounded-full border-0 bg-white text-gray-800 placeholder:text-gray-400 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                            autocomplete="off"
                            type="text">
                        </div>
                      </div>
                    </div>

                    <!-- Map Tiles Container -->
                    <div class="relative w-full flex-1 h-full min-h-[300px] bg-slate-100 overflow-hidden">
                      <iframe
                        class="w-full h-full border-0 pointer-events-auto filter saturate-110"
                        loading="lazy"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=54.3000%2C24.4400%2C54.4100%2C24.5200&layer=mapnik"
                        [attr.title]="language.t('خريطة توصيل سوق وسفرة أبوظبي', 'Souq & Sofra Abu Dhabi delivery map')">
                      </iframe>

                      <!-- Center Brand Pin Marker -->
                      <div class="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                        <div class="flex flex-col items-center -translate-y-6">
                          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 28 40" class="drop-shadow-xl animate-bounce">
                            <path fill="#f47621" stroke="#ffffff" stroke-width="1.5" d="M14 1C7.4 1 2 6.4 2 13c0 8.2 10.4 23.4 11 24.2.5.7 1.5.7 2 0C15.6 36.4 26 21.2 26 13 26 6.4 20.6 1 14 1z"></path>
                            <circle cx="14" cy="13" r="5" fill="#ffffff"></circle>
                          </svg>
                          <div class="w-3.5 h-1.5 bg-black/25 rounded-full blur-[1px]"></div>
                        </div>
                      </div>

                      <!-- Locate Me Button Floating on Map -->
                      <button
                        type="button"
                        (click)="detectLocation()"
                        class="absolute bottom-6 right-4 bg-white p-2.5 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-[500] text-gray-600 cursor-pointer border border-gray-200"
                        [attr.title]="language.t('تحديد موقعي الحالي', 'Find my current location')"
                        [attr.aria-label]="language.t('تحديد موقعي الحالي', 'Find my current location')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crosshair w-5 h-5">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="22" x2="18" y1="12" y2="12"></line>
                          <line x1="6" x2="2" y1="12" y2="12"></line>
                          <line x1="12" x2="12" y1="6" y2="2"></line>
                          <line x1="12" x2="12" y1="22" y2="18"></line>
                        </svg>
                      </button>

                      <!-- Selected Location Chip on Map -->
                      <div class="absolute bottom-6 left-4 z-[500] bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span>{{ locationLabel(tempLocationName) }}</span>
                      </div>

                      <!-- Initial Pulsing Locate Me Overlay -->
                      @if (!locationDetected) {
                        <div class="absolute inset-0 z-[1100] flex flex-col items-center justify-center gap-5 bg-gray-950/55 px-6 text-center animate-in fade-in duration-300">
                          <button
                            type="button"
                            (click)="detectLocation()"
                            [attr.aria-label]="language.t('تحديد موقعي', 'Find my location')"
                            class="group relative grid gap-5 place-items-center cursor-pointer disabled:cursor-default focus:outline-none">
                            <span class="w-24 h-24 grid place-items-center rounded-full relative">
                              <span aria-hidden="true" class="pointer-events-none absolute inset-0 rounded-full bg-primary/25 animate-ping"></span>
                              <span aria-hidden="true" class="pointer-events-none absolute inset-3 rounded-full bg-primary/35 animate-ping" style="animation-delay: 0.6s;"></span>
                              <span aria-hidden="true" class="pointer-events-none absolute inset-2 rounded-full border border-white/30"></span>
                              <span class="relative grid place-items-center w-16 h-16 rounded-full bg-primary text-white shadow-xl shadow-primary/40 ring-4 ring-white/20 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin w-7 h-7">
                                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                              </span>
                            </span>
                            <div class="max-w-65 space-y-1">
                              <p class="text-base font-bold text-white drop-shadow-sm">{{ language.t('تحديد موقعي', 'Find my location') }}</p>
                              <p class="text-xs font-medium leading-relaxed text-white/70">{{ language.t('فعّل الموقع وهنحدد أقرب فرع ليك تلقائياً.', 'Enable location access to find the nearest branch.') }}</p>
                            </div>
                          </button>
                          <button
                            type="button"
                            (click)="toggleManualMode()"
                            class="text-xs font-bold text-white/80 underline underline-offset-4 hover:text-white transition-colors cursor-pointer" >
                            {{ language.t('أدخل العنوان يدوياً', 'Enter address manually') }}
                          </button>
                        </div>
                      }
                    </div>

                    <!-- Quick Area Selection Pills -->
                    <div class="p-2.5 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                      <span class="text-gray-400 font-bold shrink-0 ml-1">{{ language.t('مناطق التوصيل:', 'Delivery areas:') }}</span>
                      @for (area of popularAreas; track area) {
                        <button
                          type="button"
                          (click)="selectArea(area)"
                          class="px-2.5 py-1 rounded-full border transition-colors shrink-0 font-medium cursor-pointer"
                          [class.bg-primary]="tempLocationName.includes(area)"
                          [class.text-white]="tempLocationName.includes(area)"
                          [class.border-primary]="tempLocationName.includes(area)"
                          [class.border-gray-200]="!tempLocationName.includes(area)"
                          [class.text-gray-700]="!tempLocationName.includes(area)">
                          {{ area }}
                        </button>
                      }
                    </div>
                  </div>
                } @else {
                  <!-- Manual Form Mode -->
                  <div class="flex flex-col gap-4 flex-1 overflow-y-auto pb-4 pr-1">
                    <div class="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                            {{ language.t('المحافظة / الإمارة', 'City / Emirate') }} <span class="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            [(ngModel)]="manualCity"
                            class="w-full rounded-xl h-11 text-sm font-medium border bg-orange-50/40 px-3 py-2 border-orange-200 focus:outline-none focus:border-primary text-gray-800">
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                            {{ language.t('المنطقة / الحي', 'Area / Neighborhood') }} <span class="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            [(ngModel)]="manualArea"
                            [placeholder]="language.t('مثال: الكورنيش، الخالدية، المرور', 'e.g. Corniche, Khalidiya, Al Muroor')"
                            class="w-full rounded-xl h-11 text-sm font-medium border bg-orange-50/40 px-3 py-2 border-orange-200 focus:outline-none focus:border-primary text-gray-800">
                        </div>
                      </div>

                      <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                          {{ language.t('العنوان بالتفصيل', 'Full address') }}
                        </label>
                        <textarea
                          [(ngModel)]="manualStreet"
                          rows="3"
                          [placeholder]="language.t('مثال: شارع الكورنيش، مقابل بنك النيلين، الدور الثاني', 'e.g. Corniche Road, opposite Al Nilein Bank, second floor')"
                          class="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 font-medium text-gray-800 resize-none placeholder:text-gray-400 transition-all border-gray-200 focus:border-primary focus:ring-primary/10">
                        </textarea>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label class="block font-semibold text-gray-600 mb-1">{{ language.t('اسم / رقم المبنى والشقة', 'Building and apartment') }}</label>
                          <input
                            type="text"
                            [(ngModel)]="manualBuilding"
                            [placeholder]="language.t('رقم المبنى، الطابق، الشقة', 'Building, floor, apartment number')"
                            class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary">
                        </div>
                        <div>
                          <label class="block font-semibold text-gray-600 mb-1">{{ language.t('ملاحظات للمندوب', 'Delivery notes') }}</label>
                          <input
                            type="text"
                            [(ngModel)]="manualNotes"
                            [placeholder]="language.t('أي تفاصيل لتسهيل الوصول...', 'Any details to help the driver find you...')"
                            class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary">
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center justify-between gap-2 text-sm px-1">
                      <button
                        type="button"
                        class="text-gray-500 font-medium hover:text-primary hover:underline transition-colors cursor-pointer text-xs">
                        {{ language.t('لا يمكن العثور على موقعك؟', 'Can’t find your location?') }}
                      </button>
                      <button
                        type="button"
                        (click)="toggleManualMode()"
                        class="text-primary font-bold hover:underline flex items-center gap-1.5 cursor-pointer text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map w-4 h-4">
                          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                          <line x1="9" x2="9" y1="3" y2="18"></line>
                          <line x1="15" x2="15" y1="6" y2="21"></line>
                        </svg>
                        {{ language.t('حدد الموقع على الخريطة', 'Pin location on map') }}
                      </button>
                    </div>
                  </div>
                }

              </div>
            }

            <!-- 2. Pickup Mode View -->
            @if (modalOrderType === 'pickup') {
              <div class="bg-white w-full flex-1 flex flex-col min-h-0">
                <div class="flex items-center justify-between shrink-0 mb-3">
                  <h3 class="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store w-4 h-4 text-primary">
                      <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"></path>
                      <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"></path>
                      <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"></path>
                    </svg>
                    {{ language.t('الفروع المتاحة', 'Available branches') }}
                  </h3>
                  <span class="text-[10px] font-semibold bg-orange-100 text-primary px-2 py-0.5 rounded-full">
                    {{ language.t('فرع متاح', 'Branch available') }}
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto flex-1 content-start auto-rows-max pb-2 pr-1">
                  <div class="p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between relative min-h-[96px] border-primary/50 bg-orange-50/20 cursor-pointer shadow-xs">
                    <div>
                      <div class="flex justify-between items-start gap-1 mb-1.5">
                        <h4 class="font-bold text-xs md:text-sm line-clamp-1 branchname text-gray-900">
                          {{ language.t('فرع الكورنيش الرئيسي (أبوظبي)', 'Corniche Main Branch (Abu Dhabi)') }}
                        </h4>
                        <span class="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{{ language.t('مفتوح', 'Open') }}</span>
                      </div>
                      <p class="text-[10px] md:text-[11px] text-gray-500 line-clamp-2 leading-snug">
                        {{ language.t('أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين', 'Abu Dhabi - Corniche - opposite Al Madina Fresh Mart and Al Nilein Bank') }}
                      </p>
                      <div class="flex items-center gap-1 mt-2 text-[9px] md:text-[10px] text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-3.5 h-3.5 shrink-0">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{{ language.t('8:00 صباحاً - 12:00 منتصف الليل', '8:00 AM - 12:00 midnight') }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 leading-relaxed border border-gray-100 mt-2">
                  ✨ <strong>{{ language.t('ميزة الاستلام من الفرع:', 'Branch pickup benefit:') }}</strong> {{ language.t('يتم تجهيز طلبك طازجاً وساخناً فور وصولك دون أي رسوم توصيل أو انتظار.', 'Your order is prepared fresh and hot when you arrive, with no delivery fee or waiting.') }}
                </div>
              </div>
            }

          </div>

          <!-- Bottom Actions Bar -->
          <div class="shrink-0 pb-4 pt-2 px-4 flex flex-col gap-2 bg-white">
            <button
              type="button"
              (click)="confirmModalSelection()"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 w-full theme-btn cursor-pointer font-bold" >
              {{ language.t('تأكيد', 'Confirm') }}
            </button>

            @if (modalOrderType === 'delivery') {
              <div class="flex items-center justify-between text-xs sm:text-sm pt-1">
                <button
                  type="button"
                  (click)="toggleManualMode()"
                  class="text-gray-500 font-medium hover:text-primary hover:underline transition-colors cursor-pointer">
                  {{ isManualMode ? language.t('الرجوع إلى الخريطة', 'Back to map') : language.t('لا يمكن العثور على موقعك؟', 'Can’t find your location?') }}
                </button>

                <button
                  type="button"
                  (click)="toggleManualMode()"
                  class="text-primary font-bold hover:underline flex items-center gap-1.5 cursor-pointer">
                  @if (isManualMode) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map w-4 h-4">
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                      <line x1="9" x2="9" y1="3" y2="18"></line>
                      <line x1="15" x2="15" y1="6" y2="21"></line>
                    </svg>
                    {{ language.t('حدد الموقع على الخريطة', 'Pin location on map') }}
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-checks w-4 h-4">
                      <path d="M13 5h8"></path>
                      <path d="M13 12h8"></path>
                      <path d="M13 19h8"></path>
                      <path d="m3 17 2 2 4-4"></path>
                      <path d="m3 7 2 2 4-4"></path>
                    </svg>
                    {{ language.t('أدخل العنوان يدوياً', 'Enter address manually') }}
                  }
                </button>
              </div>
            }
          </div>

        </div>
      </div>
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

  searchQuery = '';
  searchOpen = false;

  // Modal State
  modalOrderType: 'delivery' | 'pickup' = 'delivery';
  isManualMode = false;
  locationDetected = false;
  searchLocationText = '';
  tempLocationName = 'أبوظبي - الكورنيش';

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
    this.modalOrderType = this.locationService.orderType();
    const currentLoc = this.locationService.selectedLocation();
    this.tempLocationName = (currentLoc && currentLoc !== 'اختر الموقع...') ? currentLoc : 'أبوظبي - الكورنيش';
    if (currentLoc && currentLoc !== 'اختر الموقع...') {
      this.locationDetected = true;
    }
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

  setModalOrderType(type: 'delivery' | 'pickup') {
    this.modalOrderType = type;
    if (type === 'pickup') {
      this.tempLocationName = 'استلام من فرع الكورنيش';
    } else {
      const cur = this.locationService.selectedLocation();
      this.tempLocationName = (cur && cur !== 'اختر الموقع...') ? cur : 'أبوظبي - الكورنيش';
    }
  }

  toggleManualMode() {
    this.isManualMode = !this.isManualMode;
  }

  selectArea(area: string) {
    this.locationDetected = true;
    this.tempLocationName = `أبوظبي - ${area}`;
    this.manualArea = area;
  }

  onLocationSearch() {
    if (this.searchLocationText.trim()) {
      this.locationDetected = true;
      this.tempLocationName = `أبوظبي - ${this.searchLocationText.trim()}`;
      this.manualArea = this.searchLocationText.trim();
    }
  }

  detectLocation() {
    this.locationDetected = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          this.tempLocationName = 'أبوظبي - شارع الكورنيش (موقعي الحالي)';
        },
        () => {
          this.tempLocationName = 'أبوظبي - شارع الكورنيش';
        }
      );
    } else {
      this.tempLocationName = 'أبوظبي - شارع الكورنيش';
    }
  }

  confirmModalSelection() {
    let finalLocationName = this.tempLocationName;
    if (this.modalOrderType === 'pickup') {
      finalLocationName = 'استلام من فرع الكورنيش';
    } else if (this.isManualMode && this.manualArea.trim()) {
      const parts = [this.manualCity, this.manualArea, this.manualStreet].filter(p => !!p?.trim());
      finalLocationName = parts.join(' - ');
    }

    this.locationService.saveSelection(
      this.modalOrderType,
      finalLocationName,
      {
        city: this.manualCity,
        area: this.manualArea,
        street: this.manualStreet,
        building: this.manualBuilding,
        notes: this.manualNotes
      }
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
