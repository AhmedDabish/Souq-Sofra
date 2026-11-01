import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { LocationService } from '../../../../core/services/location.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Desktop & Tablet Header - Elevated Height & Exact More-In Structure -->
    <header class="relative md:sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-headerBg backdrop-blur-md shadow-sm py-1.5 md:py-2.5">
      <div class="container-wide mx-auto px-2 md:px-4">
        <div class="flex items-center justify-between flex-nowrap min-h-[76px] md:min-h-[84px]">
          
          <!-- Start/Right: Logo and Location -->
          <div class="flex gap-2.5 md:gap-3.5 items-center">
            <a class="shrink-0 hidden md:block relative z-50" routerLink="/">
              <div class="logo-img-wrap left-0 bg-contain bg-no-repeat bg-top flex items-center justify-center drop-shadow-md">
                <div class="relative py-1 logo-img">
                  <img 
                    alt="سوق وسفرة" 
                    width="54" 
                    height="54" 
                    class="w-13 h-13 object-cover rounded-full border border-secondary/40 shadow-xs" 
                    src="assets/MAIN.jpg">
                </div>
              </div>
            </a>

            <!-- Location Selector Pill - Exact More-In Classes & Specs -->
            <button 
              type="button"
              (click)="openLocationModal()"
              class="cursor-pointer hidden md:flex items-center gap-2 text-sm font-medium group border-[1.5px] hover:border-secondary p-2 py-1.5 rounded-full transition-colors text-headerText duration-200">
              <div class="bg-secondary p-1.5 rounded-full text-primaryDark group-hover:text-white transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin" aria-hidden="true">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <span class="hidden lg:inline-block xl:max-w-[250px] max-w-[150px] truncate font-bold text-gray-700" [title]="locationService.selectedLocation()">
                {{ locationService.selectedLocation() || 'اختر الموقع...' }}
              </span>
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
              <div class="relative transition-all duration-300 gray-bg hover:bg-gray-100 flex items-center rounded-[24px] border border-gray-200 cursor-pointer h-[34px] w-[38px] focus-within:w-[220px] focus-within:px-2 justify-center group">
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
              class="lang-btn !font-bold cursor-pointer rtl:pt-1 gray-bg hidden md:flex items-center justify-center w-[38px] h-[34px] rounded-[24px] hover:bg-gray-100 transition-colors text-sm border border-gray-200">
              EN
            </button>

            <!-- Cart Drawer Button -->
            <div class="gray-bg hidden md:block border border-gray-200 rounded-[24px] w-[38px] h-[34px] md:flex items-center justify-center hover:bg-gray-100 transition-colors relative">
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
            <div class="hidden md:block bg-primary rounded-[24px] w-[38px] h-[34px] md:flex items-center justify-center">
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
              <img src="assets/MAIN.jpg" alt="سوق وسفرة" class="w-11 h-11 rounded-full object-cover border border-secondary shadow-sm">
              <span class="text-base font-extrabold font-baloo text-primaryDark">سوق وسفرة</span>
            </a>

            <div class="flex items-center gap-2">
              <button 
                type="button"
                (click)="openLocationModal()" 
                class="flex items-center gap-1.5 px-3 py-1.5 border border-secondary/80 rounded-full text-xs font-bold text-gray-700 bg-white shadow-xs">
                <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span class="max-w-[110px] truncate">{{ locationService.selectedLocation() }}</span>
              </button>

              <button 
                type="button" 
                (click)="cart.toggleDrawer()" 
                aria-label="سلة المشتريات" 
                class="relative gray-bg border border-gray-200 rounded-[24px] w-[36px] h-[34px] flex items-center justify-center">
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

    <!-- Location & Delivery Selection Modal (Radix/More-In Style Parity) -->
    @if (locationService.isModalOpen()) {
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        (click)="locationService.closeModal()">
      </div>

      <!-- Dialog Body -->
      <div 
        role="dialog" 
        aria-modal="true"
        data-state="open" 
        class="fixed left-[50%] top-[50%] z-50 grid w-[94%] sm:w-full -translate-x-1/2 -translate-y-1/2 border border-white/20 shadow-2xl rounded-3xl max-w-2xl xl:max-w-3xl p-0 overflow-hidden gap-0 bg-white max-h-[92vh] animate-in fade-in zoom-in-95"
        tabindex="-1">
        
        <!-- Close Button -->
        <button 
          type="button" 
          aria-label="Close" 
          (click)="locationService.closeModal()" 
          class="absolute top-4 end-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 shadow-sm border border-gray-200 transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-5 h-5" aria-hidden="true">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>

        <div class="flex flex-col h-full max-h-[90vh] bg-white relative">
          
          <!-- Top Header: Title & Segmented Delivery / Pickup Switch -->
          <div class="shrink-0 px-4 pt-4 md:pt-5 pb-3 border-b border-gray-100 bg-linear-to-b from-orange-50/50 to-white">
            <div class="text-center mb-3">
              <h2 class="tracking-tight text-xl 2xl:text-2xl font-bold text-gray-900 font-baloo">كيف تود أن تطلب؟</h2>
              <p class="text-gray-500 text-xs mt-1">اختر الطريقة المفضلة لديك.</p>
            </div>

            <!-- Segmented Pill Tabs -->
            <div class="relative flex bg-gray-100 p-1 rounded-xl max-w-md mx-auto">
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
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
                  <path d="M15 18H9"></path>
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path>
                  <circle cx="17" cy="18" r="2"></circle>
                  <circle cx="7" cy="18" r="2"></circle>
                </svg>
                <span>توصيل</span>
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
                <span>استلام من الفرع</span>
              </button>
            </div>
          </div>

          <!-- Middle Content Area -->
          <div class="flex flex-col flex-1 min-h-[340px] md:min-h-[400px] relative p-4 pb-2 overflow-y-auto">
            
            <!-- 1. Delivery Mode View -->
            @if (modalOrderType === 'delivery') {
              <div class="relative flex flex-col flex-1 min-h-0 gap-3 w-full">
                
                @if (!isManualMode) {
                  <!-- Interactive Map Container -->
                  <div class="relative flex-1 min-h-[290px] md:min-h-[350px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">
                    
                    <!-- Search Input Floating over Map -->
                    <div class="absolute top-3 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-20">
                      <div class="relative w-full shadow-lg shadow-black/10">
                        <div class="relative group">
                          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search w-5 h-5">
                              <path d="m21 21-4.34-4.34"></path>
                              <circle cx="11" cy="11" r="8"></circle>
                            </svg>
                          </div>
                          <input 
                            aria-label="Search for location" 
                            placeholder="ابحث عن منطقتك في أبوظبي..." 
                            [(ngModel)]="searchLocationText"
                            (keyup.enter)="onLocationSearch()"
                            class="w-full pl-12 pr-4 py-3 rounded-full border-0 bg-white/95 text-gray-800 placeholder:text-gray-400 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all text-sm font-medium" 
                            autocomplete="off" 
                            type="text">
                        </div>
                      </div>
                    </div>

                    <!-- Map Tiles -->
                    <div class="relative w-full flex-1 h-full min-h-[290px] bg-slate-100 overflow-hidden">
                      <iframe 
                        class="w-full h-full border-0 pointer-events-auto filter saturate-110"
                        loading="lazy"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=54.3000%2C24.4400%2C54.4100%2C24.5200&layer=mapnik"
                        title="خريطة توصيل سوق وسفرة أبوظبي">
                      </iframe>

                      <!-- Center Brand Pin Marker - Matching Exact Design -->
                      <div class="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                        <div class="flex flex-col items-center -translate-y-6">
                          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 28 40" class="drop-shadow-xl animate-bounce">
                            <path fill="#f47621" stroke="#ffffff" stroke-width="1.5" d="M14 1C7.4 1 2 6.4 2 13c0 8.2 10.4 23.4 11 24.2.5.7 1.5.7 2 0C15.6 36.4 26 21.2 26 13 26 6.4 20.6 1 14 1z"></path>
                            <circle cx="14" cy="13" r="5" fill="#ffffff"></circle>
                          </svg>
                          <div class="w-3.5 h-1.5 bg-black/25 rounded-full blur-[1px]"></div>
                        </div>
                      </div>

                      <!-- Locate Me Button -->
                      <button 
                        type="button" 
                        (click)="detectLocation()" 
                        class="absolute bottom-4 right-4 bg-white p-2.5 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-20 text-gray-700 cursor-pointer border border-gray-200" 
                        title="تحديد موقعي الحالي" 
                        aria-label="تحديد موقعي الحالي">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crosshair w-5 h-5">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="22" x2="18" y1="12" y2="12"></line>
                          <line x1="6" x2="2" y1="12" y2="12"></line>
                          <line x1="12" x2="12" y1="6" y2="2"></line>
                          <line x1="12" x2="12" y1="22" y2="18"></line>
                        </svg>
                      </button>

                      <!-- Selected Location Chip on Map -->
                      <div class="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span>{{ tempLocationName }}</span>
                      </div>
                    </div>

                    <!-- Quick Area Selection Pills -->
                    <div class="p-2.5 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                      <span class="text-gray-400 font-bold shrink-0 ml-1">مناطق التوصيل:</span>
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
                  <div class="bg-gray-50/70 rounded-2xl p-4 sm:p-5 border border-gray-200 space-y-3">
                    <h4 class="font-bold text-sm text-gray-800 flex items-center gap-2">
                      <span>📝</span> تفاصيل عنوان التوصيل في أبوظبي
                    </h4>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label class="block font-semibold text-gray-600 mb-1">المدينة / الإمارة</label>
                        <input 
                          type="text" 
                          [(ngModel)]="manualCity" 
                          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary">
                      </div>
                      <div>
                        <label class="block font-semibold text-gray-600 mb-1">المنطقة / الحي *</label>
                        <input 
                          type="text" 
                          [(ngModel)]="manualArea" 
                          placeholder="مثال: الكورنيش، الخالدية، المرور" 
                          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary">
                      </div>
                      <div>
                        <label class="block font-semibold text-gray-600 mb-1">اسم الشارع *</label>
                        <input 
                          type="text" 
                          [(ngModel)]="manualStreet" 
                          placeholder="مثال: شارع الكورنيش، مقابل بنك النيلين" 
                          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary">
                      </div>
                      <div>
                        <label class="block font-semibold text-gray-600 mb-1">اسم / رقم المبنى ورقم الشقة</label>
                        <input 
                          type="text" 
                          [(ngModel)]="manualBuilding" 
                          placeholder="رقم المبنى، الطابق، الشقة" 
                          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary">
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1">علامة مميزة أو ملاحظات خاصة للمندوب</label>
                      <input 
                        type="text" 
                        [(ngModel)]="manualNotes" 
                        placeholder="أي تفاصيل لتسهيل وصول المندوب إليك سريعاً..." 
                        class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-primary text-xs">
                    </div>
                  </div>
                }

              </div>
            }

            <!-- 2. Pickup Mode View (Branches) -->
            @if (modalOrderType === 'pickup') {
              <div class="flex flex-col gap-3 py-2">
                <div class="p-4 sm:p-5 rounded-2xl border-2 border-primary bg-orange-50/40 flex flex-col gap-2.5 relative shadow-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-sm sm:text-base text-primaryDark flex items-center gap-2">
                      <span>🏪</span> فرع الكورنيش الرئيسي (أبوظبي)
                    </span>
                    <span class="text-[11px] font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span> يستقبل الطلبات
                    </span>
                  </div>

                  <p class="text-xs text-gray-700 leading-relaxed font-medium">
                    أبوظبي - الكورنيش - مقابل المدينة فريش مارت وبنك النيلين
                  </p>

                  <div class="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-2 border-t border-orange-200/50">
                    <span class="flex items-center gap-1">
                      <span>🕒</span> 8:00 صباحاً - 12:00 منتصف الليل
                    </span>
                    <a href="tel:026333136" class="flex items-center gap-1 text-primary hover:underline font-bold">
                      <span>📞</span> 02 633 3136
                    </a>
                    <a href="https://wa.me/971503157884" target="_blank" class="flex items-center gap-1 text-green-600 hover:underline font-bold">
                      <span>💬</span> واتساب: 0503157884
                    </a>
                  </div>
                </div>

                <div class="p-3.5 bg-gray-50 rounded-xl text-xs text-gray-500 leading-relaxed border border-gray-200">
                  ✨ <strong>ميزة الاستلام من الفرع:</strong> يتم تجهيز طلبك طازجاً وساخناً فور وصولك دون أي رسوم توصيل أو انتظار في الطابور.
                </div>
              </div>
            }

          </div>

          <!-- Bottom Actions Bar -->
          <div class="shrink-0 p-4 border-t border-gray-100 flex flex-col gap-2 bg-white">
            <button 
              type="button" 
              (click)="confirmModalSelection()" 
              class="w-full py-3.5 rounded-xl bg-primary hover:bg-primaryDark text-white font-bold text-sm shadow-md transition-all flex items-center justify-center cursor-pointer active:scale-98">
              تأكيد
            </button>

            @if (modalOrderType === 'delivery') {
              <div class="flex items-center justify-between text-xs md:text-sm pt-1 px-1">
                <button 
                  type="button" 
                  (click)="toggleManualMode()" 
                  class="text-gray-500 font-medium hover:text-primary hover:underline transition-colors cursor-pointer">
                  {{ isManualMode ? 'الرجوع إلى الخريطة' : 'لا يمكن العثور على موقعك؟' }}
                </button>

                <button 
                  type="button" 
                  (click)="toggleManualMode()" 
                  class="text-primary font-bold hover:underline flex items-center gap-1.5 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-checks w-4 h-4">
                    <path d="M13 5h8"></path>
                    <path d="M13 12h8"></path>
                    <path d="M13 19h8"></path>
                    <path d="m3 17 2 2 4-4"></path>
                    <path d="m3 7 2 2 4-4"></path>
                  </svg>
                  {{ isManualMode ? 'تحديد عبر الخريطة' : 'أدخل العنوان يدوياً' }}
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
  private router = inject(Router);

  searchQuery = '';

  // Modal State
  modalOrderType: 'delivery' | 'pickup' = 'delivery';
  isManualMode = false;
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
  }

  private syncFromService() {
    this.modalOrderType = this.locationService.orderType();
    this.tempLocationName = this.locationService.selectedLocation();
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
      this.tempLocationName = this.locationService.selectedLocation() || 'أبوظبي - الكورنيش';
    }
  }

  toggleManualMode() {
    this.isManualMode = !this.isManualMode;
  }

  selectArea(area: string) {
    this.tempLocationName = `أبوظبي - ${area}`;
    this.manualArea = area;
  }

  onLocationSearch() {
    if (this.searchLocationText.trim()) {
      this.tempLocationName = `أبوظبي - ${this.searchLocationText.trim()}`;
      this.manualArea = this.searchLocationText.trim();
    }
  }

  detectLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          this.tempLocationName = 'أبوظبي - شارع الكورنيش (موقعي الحالي)';
        },
        () => {
          this.tempLocationName = 'أبوظبي - شارع الكورنيش (موقع تقديري)';
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

  onSearch() {
    if (this.searchQuery && this.searchQuery.trim()) {
      this.router.navigate(['/menu'], { queryParams: { search: this.searchQuery.trim() } });
    }
  }
}
