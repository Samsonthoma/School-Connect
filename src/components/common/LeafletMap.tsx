import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bus, Route, Stop, Breadcrumb, IdleLocation } from '../../types/transport';

interface LeafletMapProps {
  buses?: Bus[];
  route?: Route;
  activeBusId?: string;
  isEditingStops?: boolean;
  isAddingStop?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onStopDragEnd?: (stopId: string, lat: number, lng: number) => void;
  selectedStopId?: string;
  onSelectStop?: (stopId: string) => void;
  replayBreadcrumbs?: Breadcrumb[];
  replayIdleLocations?: IdleLocation[];
  replayCurrentIndex?: number;
  highlightedStopId?: string;
  showSchoolHq?: boolean;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  buses = [],
  route,
  activeBusId,
  isEditingStops = false,
  isAddingStop = false,
  onMapClick,
  onStopDragEnd,
  selectedStopId,
  onSelectStop,
  replayBreadcrumbs,
  replayIdleLocations = [],
  replayCurrentIndex,
  highlightedStopId,
  showSchoolHq = true,
  center = [26.0538, 82.6845],
  zoom = 13,
  className = 'h-full w-full min-h-[420px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false
    });

    // High quality OpenStreetMap standard street tiles (normal street view, not satellite)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Map Click for Adding Stops
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (isAddingStop && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [isAddingStop, onMapClick]);

  // Render Markers, Routes, Buses, Replay Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Draw School HQ Marker
    if (showSchoolHq) {
      const schoolIcon = L.divIcon({
        className: 'custom-bus-icon',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 bg-amber-500 text-slate-950 font-bold rounded-xl shadow-lg border-2 border-amber-300">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const schoolLat = route?.schoolLocation?.lat || 26.0538;
      const schoolLng = route?.schoolLocation?.lng || 82.6845;
      const schoolName = route?.schoolLocation?.name || 'THE SOUTH INDIAN SCHOOL';

      L.marker([schoolLat, schoolLng], { icon: schoolIcon })
        .bindPopup(`<strong>${schoolName}</strong><br/><span class="text-xs text-slate-600">Shahganj, Jaunpur, UP - 223101<br/>Phone: 9598142455, 9532546785</span>`)
        .addTo(layers);
    }

    // 2. Draw Route Polyline & Stops (if route provided)
    if (route && route.stops && route.stops.length > 0) {
      const stopLatLngs: [number, number][] = route.stops.map(s => [s.lat, s.lng]);
      if (route.schoolLocation) {
        stopLatLngs.push([route.schoolLocation.lat, route.schoolLocation.lng]);
      }

      // Polyline route
      L.polyline(stopLatLngs, {
        color: route.color || '#3b82f6',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(layers);

      // Stops markers
      route.stops.forEach((stop, idx) => {
        const isSelected = selectedStopId === stop.id;
        const isHighlighted = highlightedStopId === stop.id;

        // 120m arrival detection radius circle
        L.circle([stop.lat, stop.lng], {
          radius: stop.radiusMeters || 120,
          color: isHighlighted ? '#10b981' : isSelected ? '#38bdf8' : '#64748b',
          weight: 1,
          opacity: 0.4,
          fillColor: isHighlighted ? '#10b981' : '#38bdf8',
          fillOpacity: 0.12
        }).addTo(layers);

        const stopIcon = L.divIcon({
          className: 'custom-bus-icon',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-transform cursor-pointer ${
              isHighlighted
                ? 'bg-emerald-500 border-white text-white ring-4 ring-emerald-500/30 scale-125 z-30'
                : isSelected
                ? 'bg-sky-500 border-white text-white ring-4 ring-sky-500/30 scale-110 z-20'
                : 'bg-slate-800 border-slate-300 text-slate-100 hover:scale-110'
            }">
              ${idx + 1}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const stopMarker = L.marker([stop.lat, stop.lng], {
          icon: stopIcon,
          draggable: isEditingStops
        }).addTo(layers);

        stopMarker.bindPopup(`
          <div class="p-1">
            <div class="font-bold text-sm text-slate-900">Stop #${idx + 1}: ${stop.name}</div>
            <div class="text-xs text-slate-600 mt-1">Morning: ${stop.scheduledTimeMorning} · Afternoon: ${stop.scheduledTimeAfternoon}</div>
            <div class="text-xs text-emerald-600 font-semibold mt-0.5">120m Geo-fence active</div>
          </div>
        `);

        if (isEditingStops) {
          stopMarker.on('dragend', (e: L.LeafletEvent) => {
            const marker = e.target as L.Marker;
            const newPos = marker.getLatLng();
            if (onStopDragEnd) {
              onStopDragEnd(stop.id, newPos.lat, newPos.lng);
            }
          });
        }

        stopMarker.on('click', () => {
          if (onSelectStop) onSelectStop(stop.id);
        });
      });
    }

    // 3. Draw Fleet Buses (Pulsing Green for Active Trips!)
    buses.forEach(bus => {
      const isSelected = activeBusId === bus.id;
      const isActive = bus.isTripActive;

      const busIconHtml = `
        <div class="relative flex items-center justify-center">
          ${
            isActive
              ? '<div class="absolute w-12 h-12 rounded-full bg-emerald-500 opacity-75 gps-pulse-ring"></div>'
              : ''
          }
          <div class="relative flex items-center justify-center w-10 h-10 rounded-xl shadow-2xl border-2 transition-transform ${
            isActive
              ? 'bg-emerald-600 border-emerald-300 text-white shadow-emerald-900/50'
              : 'bg-slate-700 border-slate-500 text-slate-300'
          } ${isSelected ? 'ring-4 ring-emerald-400 scale-110' : ''}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 16h16V7a2 2 0 00-2-2H6a2 2 0 00-2 2v9zm0 0v2m16-2v2M4 10h16M7 6v4m10-4v4" />
            </svg>
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        className: 'custom-bus-icon',
        html: busIconHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const busMarker = L.marker([bus.currentLat, bus.currentLng], { icon: busIcon }).addTo(layers);

      const statusBadge = isActive
        ? `<span class="inline-block px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded">ACTIVE TRIP · ${bus.currentSpeedKmh} km/h</span>`
        : `<span class="inline-block px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded">IDLE AT BASE</span>`;

      const replacementNotice = bus.replacement?.isActive
        ? `<div class="mt-1 p-1.5 bg-amber-50 text-amber-800 rounded text-xs border border-amber-200">
            <strong>Substituted:</strong> ${bus.replacement.tempBusNumber} (Driver: ${bus.replacement.tempDriverName})
           </div>`
        : '';

      const trackerHealthNotice = `
        <div class="mt-1 text-xs text-slate-600 flex items-center justify-between">
          <span>Tracker: <strong>${bus.trackingSource.replace('_', ' ').toUpperCase()}</strong></span>
          <span class="${bus.deviceHealth.online ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}">
            ${bus.deviceHealth.online ? 'Online' : 'Offline'}
          </span>
        </div>
      `;

      busMarker.bindPopup(`
        <div class="min-w-[200px] p-1">
          <div class="font-bold text-sm text-slate-900 flex items-center justify-between">
            <span>${bus.busName}</span>
            <span class="text-xs text-slate-500 font-mono">${bus.numberPlate}</span>
          </div>
          <div class="mt-1.5">${statusBadge}</div>
          ${replacementNotice}
          ${trackerHealthNotice}
          <div class="mt-2 text-xs text-slate-500">
            Last Ping: ${bus.deviceHealth.lastPing}
          </div>
        </div>
      `);
    });

    // 4. Ride Replay Layer (if in replay mode)
    if (replayBreadcrumbs && replayBreadcrumbs.length > 0) {
      const replayCoords: [number, number][] = replayBreadcrumbs.map(b => [b.lat, b.lng]);

      // Complete route trace in purple/sky
      L.polyline(replayCoords, {
        color: '#818cf8',
        weight: 4,
        opacity: 0.8
      }).addTo(layers);

      // Draw Idle / Stopped Locations
      replayIdleLocations.forEach((idle, idx) => {
        const idleIcon = L.divIcon({
          className: 'custom-bus-icon',
          html: `
            <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-rose-600 text-white font-bold text-xs border-2 border-white shadow-lg">
              P
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        L.marker([idle.lat, idle.lng], { icon: idleIcon })
          .bindPopup(`
            <div class="p-1">
              <strong class="text-rose-400 text-sm">Standing / Idle #${idx + 1}</strong>
              <div class="text-xs text-slate-200 mt-1">${idle.description}</div>
              <div class="text-xs text-slate-400 mt-1">Duration: ${idle.durationSeconds} seconds (${Math.round(idle.durationSeconds / 60)} min)</div>
              <div class="text-xs text-slate-400">Time: ${idle.startTime}</div>
            </div>
          `)
          .addTo(layers);
      });

      // Animated current replay position marker
      const currIdx = replayCurrentIndex !== undefined ? replayCurrentIndex : replayBreadcrumbs.length - 1;
      const currentCrumb = replayBreadcrumbs[currIdx] || replayBreadcrumbs[0];

      if (currentCrumb) {
        const replayBusIcon = L.divIcon({
          className: 'custom-bus-icon',
          html: `
            <div class="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600 border-2 border-white text-white shadow-2xl ring-4 ring-indigo-400/40">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        L.marker([currentCrumb.lat, currentCrumb.lng], { icon: replayBusIcon })
          .bindPopup(`
            <div class="p-1">
              <strong>Replay Playhead</strong><br/>
              Speed: ${currentCrumb.speedKmh} km/h<br/>
              Time: ${currentCrumb.timestamp}
            </div>
          `)
          .addTo(layers);
      }
    }
  }, [
    buses,
    route,
    activeBusId,
    isEditingStops,
    selectedStopId,
    highlightedStopId,
    showSchoolHq,
    replayBreadcrumbs,
    replayIdleLocations,
    replayCurrentIndex,
    onStopDragEnd,
    onSelectStop
  ]);

  return (
    <div className="relative w-full h-full min-h-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <div ref={mapContainerRef} className={className} />
      
      {/* Live 10s auto-refresh indicator badge */}
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 pointer-events-none shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-mono text-[11px] font-semibold">GPS LIVE · 10s REFRESH</span>
      </div>

      {isAddingStop && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-md animate-bounce">
          Click anywhere on the map to place a new stop pin
        </div>
      )}
    </div>
  );
};
