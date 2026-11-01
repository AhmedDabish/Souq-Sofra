import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Bottom Navigation Bar (More-In Parity) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl px-2 py-1.5 flex items-center justify-around">
      
      <!-- Home -->
      <a routerLink="/" routerLinkActive="text-primary font-bold" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center justify-center p-1.5 text-gray-500 hover:text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span class="text-[10px] mt-0.5">الرئيسية</span>
      </a>

      <!-- Menu -->
      <a routerLink="/menu" routerLinkActive="text-primary font-bold" class="flex flex-col items-center justify-center p-1.5 text-gray-500 hover:text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        <span class="text-[10px] mt-0.5">المنيو</span>
      </a>

      <!-- Floating Cart Center Button -->
      <button 
        type="button" 
        (click)="cart.toggleDrawer()"
        class="relative -top-3 w-12 h-12 rounded-full bg-primary hover:bg-primaryHover text-white shadow-xl flex items-center justify-center transition-transform active:scale-90 border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        @if (cart.totalCount() > 0) {
          <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-black text-[10px] flex items-center justify-center animate-pulse border border-white">
            {{ cart.totalCount() }}
          </span>
        }
      </button>

      <!-- Contact / Locations -->
      <a routerLink="/contact" routerLinkActive="text-primary font-bold" class="flex flex-col items-center justify-center p-1.5 text-gray-500 hover:text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <span class="text-[10px] mt-0.5">الفروع</span>
      </a>

      <!-- Admin Dashboard -->
      <a routerLink="/admin" routerLinkActive="text-primary font-bold" class="flex flex-col items-center justify-center p-1.5 text-gray-500 hover:text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span class="text-[10px] mt-0.5">الإدارة</span>
      </a>

    </nav>
  `
})
export class BottomNavComponent {
  cart = inject(CartService);
}
