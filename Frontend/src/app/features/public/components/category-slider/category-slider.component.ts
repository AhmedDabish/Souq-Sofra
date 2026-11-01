import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../../core/models/models';

@Component({
  selector: 'app-category-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-wide mx-auto px-2 md:px-4 py-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg sm:text-xl font-black font-baloo text-primaryDark">أقسام منيو سوق وسفرة</h2>
        <a routerLink="/menu" class="text-xs sm:text-sm font-bold text-primary cursor-pointer hover:underline">عرض جميع الأقسام</a>
      </div>

      <!-- Scrollable horizontal category badges matching More-In -->
      <div class="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
        <button 
          (click)="selectCategory(0)"
          [class]="selectedId === 0 
            ? 'bg-primary text-white border-primary shadow-md' 
            : 'bg-white text-gray-700 border-gray-200 hover:border-secondary'"
          class="shrink-0 px-5 py-2.5 rounded-full border text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm">
          <span>🍽</span>
          <span>الكل</span>
        </button>

        @for (cat of categories; track cat.categoryId) {
          <button 
            (click)="selectCategory(cat.categoryId)"
            [class]="selectedId === cat.categoryId 
              ? 'bg-primary text-white border-primary shadow-md' 
              : 'bg-white text-gray-700 border-gray-200 hover:border-secondary'"
            class="shrink-0 px-4 py-2 rounded-full border text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-xs group">
            <span class="w-7 h-7 rounded-full bg-[#fff7ec] group-hover:bg-secondary/30 flex items-center justify-center text-xs">
              🥐
            </span>
            <span>{{ cat.nameAr }}</span>
          </button>
        }
      </div>
    </div>
  `
})
export class CategorySliderComponent {
  @Input() categories: Category[] = [];
  @Input() selectedId: number = 0;
  @Output() categorySelected = new EventEmitter<number>();

  selectCategory(id: number) {
    this.categorySelected.emit(id);
  }
}
