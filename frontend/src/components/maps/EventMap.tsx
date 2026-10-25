import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom colored icons
const createIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const MapUpdater = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface EventMapProps {
  event: any;
  parkingZones: any[];
  trafficZones: any[];
}

export default function EventMap({ event, parkingZones, trafficZones }: EventMapProps) {
  // Default to Chennai coordinates if none provided
  const center: [number, number] = [13.0827, 80.2707];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        {/* Dark theme tiles for aesthetic */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapUpdater center={center} zoom={13} />

        {/* Venue Marker */}
        <Marker position={center} icon={createIcon('#facc15')}>
          <Popup>
            <div style={{ color: '#000' }}>
              <strong>{event?.venue}</strong><br/>
              {event?.name}
            </div>
          </Popup>
        </Marker>

        {/* Traffic Zones (Rendered as lines/circles for visual demo) */}
        {trafficZones.map((tz, i) => {
          // Dummy coordinates based on index around the venue
          const lat = center[0] + (i % 2 === 0 ? 0.01 : -0.01) * (i + 1);
          const lng = center[1] + (i % 2 === 0 ? -0.01 : 0.01) * (i + 1);
          const color = tz.traffic_status === 'HEAVY' ? '#ef4444' : tz.traffic_status === 'MODERATE' ? '#f97316' : '#22c55e';
          
          return (
            <React.Fragment key={tz.id}>
              <Polyline 
                positions={[[center[0], center[1]], [lat, lng]]} 
                color={color} 
                weight={4}
                opacity={0.6}
              />
              <Circle center={[lat, lng]} radius={200} color={color} fillColor={color} fillOpacity={0.2}>
                <Tooltip permanent direction="top" className="custom-tooltip">
                  {tz.road_name}: {tz.traffic_status}
                </Tooltip>
              </Circle>
            </React.Fragment>
          );
        })}

        {/* Parking Zones */}
        {parkingZones.map((pz, i) => {
          const lat = center[0] + (i % 3 === 0 ? 0.015 : -0.015);
          const lng = center[1] + (i % 2 === 0 ? 0.015 : -0.015) + (i*0.005);
          const util = pz.capacity ? Math.round((pz.occupied_count/pz.capacity)*100) : 0;
          const color = util > 90 ? '#ef4444' : util > 75 ? '#f97316' : '#3b82f6';
          
          return (
            <Marker key={pz.id} position={[lat, lng]} icon={createIcon(color)}>
              <Popup>
                <div style={{ color: '#000', minWidth: 150 }}>
                  <strong>{pz.name}</strong><br/>
                  Utilized: {util}%<br/>
                  Available: {pz.available_spaces}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Custom styles for tooltip override */}
      <style>{`
        .custom-tooltip {
          background-color: rgba(0,0,0,0.8);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          font-weight: 600;
          border-radius: 4px;
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background-color: var(--bg-card);
          color: white;
          border: 1px solid var(--border);
        }
        .leaflet-popup-content { color: white !important; }
        .leaflet-popup-content strong { color: var(--accent-blue-light); }
        .leaflet-container { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}
