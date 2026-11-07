import { DeliveryZone } from '../models/models';
import { DEFAULT_DELIVERY_ZONES } from '../data/default-delivery-zones';

const CHUNK_PREFIX = 'DeliveryZonesChunk_';
const CHUNK_COUNT_KEY = 'DeliveryZonesChunkCount';
const CHUNK_SIZE = 800;

export function readDeliveryZones(settings: Record<string, string | undefined> | null | undefined): DeliveryZone[] {
  if (!settings) return [];
  try {
    const count = Number.parseInt(settings[CHUNK_COUNT_KEY] || '0', 10);
    const json = count > 0
      ? Array.from({ length: count }, (_, index) => settings[`${CHUNK_PREFIX}${index}`] ?? '').join('')
      : settings['DeliveryZones'] || '[]';
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed as DeliveryZone[] : [];
  } catch {
    return [];
  }
}

export function mergeDeliveryZones(saved: DeliveryZone[] | null | undefined): DeliveryZone[] {
  const overrides = new Map((saved || []).filter(zone => zone && zone.id).map(zone => [zone.id, zone]));
  const defaults = DEFAULT_DELIVERY_ZONES.map(zone => ({ ...zone, ...(overrides.get(zone.id) || {}) }));
  // Old saved settings can contain every default zone as disabled, leaving the whole
  // checkout without a selectable area. Keep a safe emirate-wide option available
  // until the merchant explicitly enables at least one delivery area.
  const hasEnabledZone = [...defaults, ...(saved || []).filter(zone => zone?.id && !DEFAULT_DELIVERY_ZONES.some(item => item.id === zone.id))]
    .some(zone => zone.enabled);
  if (!hasEnabledZone) {
    for (const zone of defaults) zone.enabled = true;
  }
  const defaultIds = new Set(DEFAULT_DELIVERY_ZONES.map(zone => zone.id));
  return [...defaults, ...(saved || []).filter(zone => zone?.id && !defaultIds.has(zone.id))];
}

export function chunkDeliveryZones(zones: DeliveryZone[]): Record<string, string> {
  const json = JSON.stringify(zones);
  const chunks: string[] = [];
  for (let start = 0; start < json.length;) {
    let end = Math.min(start + CHUNK_SIZE, json.length);
    if (end < json.length && end > start && /[\uD800-\uDBFF]/.test(json[end - 1]) && /[\uDC00-\uDFFF]/.test(json[end])) end--;
    chunks.push(json.slice(start, end));
    start = end;
  }
  return {
    [CHUNK_COUNT_KEY]: String(chunks.length),
    ...Object.fromEntries(chunks.map((chunk, index) => [`${CHUNK_PREFIX}${index}`, chunk]))
  };
}
