import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-delivery-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full overflow-hidden rounded-2xl border border-orange-200/80 shadow-xs bg-slate-100">
      <!-- Google Maps / Satellite Layer Switcher -->
      <div class="absolute top-3 end-3 z-[1000] flex bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-gray-200 text-xs font-bold gap-1">
        <button
          type="button"
          (click)="setMapType('roadmap')"
          [class.bg-primary]="mapType === 'roadmap'"
          [class.text-white]="mapType === 'roadmap'"
          [class.text-gray-700]="mapType !== 'roadmap'"
          [class.hover:bg-gray-100]="mapType !== 'roadmap'"
          class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
          <span>🗺️</span>
          <span>{{ language.t('خريطة', 'Map') }}</span>
        </button>
        <button
          type="button"
          (click)="setMapType('satellite')"
          [class.bg-primary]="mapType === 'satellite'"
          [class.text-white]="mapType === 'satellite'"
          [class.text-gray-700]="mapType !== 'satellite'"
          [class.hover:bg-gray-100]="mapType !== 'satellite'"
          class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer">
          <span>🛰️</span>
          <span>{{ language.t('قمر صناعي', 'Satellite') }}</span>
        </button>
      </div>

      <!-- Map Container -->
      <div
        #mapHost
        class="h-64 w-full sm:h-72"
        role="application"
        [attr.aria-label]="language.t('خريطة تحديد عنوان التوصيل', 'Pin delivery address on map')">
      </div>
    </div>
  `,
})
export class DeliveryMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  language = inject(LanguageService);
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Output() locationChange = new EventEmitter<{ latitude: number; longitude: number }>();
  @ViewChild('mapHost', { static: true }) mapHost!: ElementRef<HTMLDivElement>;

  mapType: 'roadmap' | 'satellite' = 'roadmap';
  private map?: L.Map;
  private marker?: L.Marker;
  private activeLayer?: L.TileLayer;

  private readonly ROADMAP_URL = 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  private readonly SATELLITE_URL = 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

  ngAfterViewInit() {
    const initial: L.LatLngExpression = this.latitude !== null && this.longitude !== null
      ? [this.latitude, this.longitude] : [24.4539, 54.3773];
    this.map = L.map(this.mapHost.nativeElement, {
      scrollWheelZoom: false,
      zoomControl: true
    }).setView(initial, this.latitude !== null ? 15 : 12);

    this.applyTileLayer();

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.setMarker(event.latlng);
      this.locationChange.emit({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    });

    if (this.latitude !== null && this.longitude !== null) {
      this.setMarker(L.latLng(this.latitude, this.longitude));
    }
    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  setMapType(type: 'roadmap' | 'satellite') {
    if (this.mapType === type) return;
    this.mapType = type;
    this.applyTileLayer();
  }

  private applyTileLayer() {
    if (!this.map) return;
    if (this.activeLayer) {
      this.map.removeLayer(this.activeLayer);
    }
    const url = this.mapType === 'satellite' ? this.SATELLITE_URL : this.ROADMAP_URL;
    this.activeLayer = L.tileLayer(url, {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    }).addTo(this.map);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['latitude'] && this.map && this.latitude !== null && this.longitude !== null) {
      const point = L.latLng(this.latitude, this.longitude);
      this.map.setView(point, Math.max(this.map.getZoom(), 15));
      this.setMarker(point);
    }
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  private setMarker(point: L.LatLng) {
    if (!this.map) return;
    const icon = L.divIcon({
      className: '',
      html: '<div class="delivery-map-pin" aria-hidden="true"></div>',
      iconSize: [28, 36],
      iconAnchor: [14, 34]
    });
    if (!this.marker) {
      this.marker = L.marker(point, { icon, draggable: true }).addTo(this.map);
    } else {
      this.marker.setLatLng(point);
    }
    this.marker.off('dragend');
    this.marker.on('dragend', () => {
      const position = this.marker!.getLatLng();
      this.locationChange.emit({ latitude: position.lat, longitude: position.lng });
    });
  }
}
