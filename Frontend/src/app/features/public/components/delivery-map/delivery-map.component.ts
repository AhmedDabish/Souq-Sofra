import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-delivery-map',
  standalone: true,
  template: `<div #mapHost class="h-64 w-full overflow-hidden rounded-2xl border border-orange-100 bg-orange-50 sm:h-72" role="application" aria-label="خريطة تحديد عنوان التوصيل"></div>`,
})
export class DeliveryMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Output() locationChange = new EventEmitter<{ latitude: number; longitude: number }>();
  @ViewChild('mapHost', { static: true }) mapHost!: ElementRef<HTMLDivElement>;
  private map?: L.Map;
  private marker?: L.Marker;

  ngAfterViewInit() {
    const initial: L.LatLngExpression = this.latitude !== null && this.longitude !== null
      ? [this.latitude, this.longitude] : [24.4539, 54.3773];
    this.map = L.map(this.mapHost.nativeElement, { scrollWheelZoom: false }).setView(initial, this.latitude !== null ? 14 : 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
    }).addTo(this.map);
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.setMarker(event.latlng);
      this.locationChange.emit({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    });
    if (this.latitude !== null && this.longitude !== null) this.setMarker(L.latLng(this.latitude, this.longitude));
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['latitude'] && this.map && this.latitude !== null && this.longitude !== null) {
      const point = L.latLng(this.latitude, this.longitude);
      this.map.setView(point, Math.max(this.map.getZoom(), 14));
      this.setMarker(point);
    }
  }

  ngOnDestroy() { this.map?.remove(); }

  private setMarker(point: L.LatLng) {
    if (!this.map) return;
    const icon = L.divIcon({ className: '', html: '<div class="delivery-map-pin" aria-hidden="true"></div>', iconSize: [28, 36], iconAnchor: [14, 34] });
    if (!this.marker) this.marker = L.marker(point, { icon, draggable: true }).addTo(this.map);
    else this.marker.setLatLng(point);
    this.marker.off('dragend');
    this.marker.on('dragend', () => {
      const position = this.marker!.getLatLng();
      this.locationChange.emit({ latitude: position.lat, longitude: position.lng });
    });
  }
}
