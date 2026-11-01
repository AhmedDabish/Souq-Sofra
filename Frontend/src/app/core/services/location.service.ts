import { Injectable, signal } from '@angular/core';

export interface ManualAddress {
  city: string;
  area: string;
  street: string;
  building: string;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly STORAGE_KEY_ORDER_TYPE = 'souq_sofra_order_type';
  private readonly STORAGE_KEY_LOCATION = 'souq_sofra_location';
  private readonly STORAGE_KEY_MANUAL_ADDR = 'souq_sofra_manual_address';

  orderType = signal<'delivery' | 'pickup'>('delivery');
  selectedLocation = signal<string>('اختر الموقع...');
  isModalOpen = signal<boolean>(false);
  
  manualAddress = signal<ManualAddress>({
    city: 'أبوظبي',
    area: 'الكورنيش',
    street: '',
    building: '',
    notes: ''
  });

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedType = localStorage.getItem(this.STORAGE_KEY_ORDER_TYPE) as 'delivery' | 'pickup' | null;
        if (savedType) {
          this.orderType.set(savedType);
        }

        const savedLoc = localStorage.getItem(this.STORAGE_KEY_LOCATION);
        if (savedLoc) {
          this.selectedLocation.set(savedLoc);
        }

        const savedAddr = localStorage.getItem(this.STORAGE_KEY_MANUAL_ADDR);
        if (savedAddr) {
          this.manualAddress.set(JSON.parse(savedAddr));
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveSelection(type: 'delivery' | 'pickup', locationName: string, manual?: ManualAddress) {
    this.orderType.set(type);
    this.selectedLocation.set(locationName);

    if (manual) {
      this.manualAddress.set(manual);
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY_ORDER_TYPE, type);
        localStorage.setItem(this.STORAGE_KEY_LOCATION, locationName);
        if (manual) {
          localStorage.setItem(this.STORAGE_KEY_MANUAL_ADDR, JSON.stringify(manual));
        }
      }
    } catch {
      // Ignore storage errors
    }

    this.closeModal();
  }
}
