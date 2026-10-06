import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SurplusListing } from '../data/yardstockEngine';

interface MarketplaceMapProps {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  listings: SurplusListing[];
  selectedListingId: string | null;
  onSelectListing: (listing: SurplusListing) => void;
  onChangeCenter?: (lat: number, lng: number) => void;
}

export const MarketplaceMap: React.FC<MarketplaceMapProps> = ({
  centerLat,
  centerLng,
  radiusKm,
  listings,
  selectedListingId,
  onSelectListing,
  onChangeCenter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors · PostGIS ST_DWithin',
      maxZoom: 18,
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = group;

    if (onChangeCenter) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onChangeCenter(Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4)));
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Draw buyer center marker
    const centerIcon = L.divIcon({
      className: 'custom-center-marker',
      html: `<div style="width:18px;height:18px;border-radius:9999px;background:#0f172a;border:3px solid #f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,0.28);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    L.marker([centerLat, centerLng], { icon: centerIcon })
      .bindPopup(
        `<div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;">
          <strong>Active Project Search Center</strong><br/>
          Lat: ${centerLat.toFixed(4)}, Lng: ${centerLng.toFixed(4)}<br/>
          PostGIS ST_DWithin Radius: <strong>${radiusKm} km</strong>
        </div>`
      )
      .addTo(group);

    // Draw ST_DWithin search radius circle
    L.circle([centerLat, centerLng], {
      radius: radiusKm * 1000,
      color: '#d97706',
      weight: 1.5,
      dashArray: '6 4',
      fillColor: '#f59e0b',
      fillOpacity: 0.06,
    }).addTo(group);

    // Draw up to 80 nearby listings to keep DOM super snappy
    const visibleSlice = listings.slice(0, 80);

    visibleSlice.forEach((item) => {
      const isSelected = item.id === selectedListingId;
      const isEscrowLocked = item.escrowStatus !== 'available';
      const displayLat = isEscrowLocked ? item.exactLat : item.fuzzedLat;
      const displayLng = isEscrowLocked ? item.exactLng : item.fuzzedLng;

      // Privacy fuzz ring for uncommitted listings
      if (!isEscrowLocked && isSelected) {
        L.circle([displayLat, displayLng], {
          radius: item.fuzzRadiusMeters,
          color: '#0284c7',
          weight: 1,
          fillColor: '#38bdf8',
          fillOpacity: 0.15,
        }).addTo(group);
      }

      const bg =
        item.fraudStatus !== 'verified'
          ? '#dc2626'
          : isSelected
          ? '#d97706'
          : isEscrowLocked
          ? '#059669'
          : '#0f172a';

      const markerIcon = L.divIcon({
        className: 'yardstock-price-pin',
        html: `<div style="display:inline-flex;align-items:center;padding:2px 7px;border-radius:6px;background:${bg};color:#ffffff;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;white-space:nowrap;border:1.5px solid #ffffff;box-shadow:0 2px 6px rgba(15,23,42,0.28);transform:${
          isSelected ? 'scale(1.12)' : 'scale(1)'
        };">₹${item.listedPriceInr.toLocaleString('en-IN')}</div>`,
        iconSize: [68, 24],
        iconAnchor: [34, 12],
      });

      const marker = L.marker([displayLat, displayLng], { icon: markerIcon });
      marker.on('click', () => {
        onSelectListing(item);
      });
      marker.addTo(group);
    });
  }, [centerLat, centerLng, radiusKm, listings, selectedListingId]);

  return (
    <div className="relative w-full h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 shadow-xs pointer-events-none">
        <div className="font-medium text-slate-900">
          Privacy Protected (~600m area shown until booked)
        </div>
        <div className="text-slate-500 mt-0.5 font-mono tabular-nums">
          Tap anywhere on map to change search area · Showing {Math.min(80, listings.length)} nearby items
        </div>
      </div>
    </div>
  );
};
