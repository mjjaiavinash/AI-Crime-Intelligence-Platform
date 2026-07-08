import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issues in Leaflet with bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to center the map when crimes/hotspots load
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function CrimeMap({ crimes = [], hotspots = [], center = [12.9716, 77.5946], zoom = 12 }) {
  // Default center is Bengaluru
  const mapCenter = crimes.length > 0 && crimes[0].latitude
    ? [crimes[0].latitude, crimes[0].longitude]
    : center;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-slate-700 bg-slate-800" style={{ minHeight: "450px" }}>
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={true} className="w-full h-full z-10" style={{ height: "100%", width: "100%" }}>
        <ChangeView center={mapCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Premium dark mode map
        />
        
        {/* Crime Location Markers */}
        {crimes.map((crime) => {
          if (!crime.latitude || !crime.longitude) return null;
          return (
            <Marker key={crime.id} position={[crime.latitude, crime.longitude]}>
              <Popup>
                <div className="p-1 text-slate-800">
                  <h4 className="font-bold text-sm">{crime.title}</h4>
                  <p className="text-xs text-gray-500 font-semibold">{crime.fir_number}</p>
                  <p className="text-xs mt-1">Status: <span className="font-semibold text-blue-600">{crime.status}</span></p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Hotspot Clusters */}
        {hotspots.map((hotspot, idx) => {
          if (!hotspot.latitude || !hotspot.longitude) return null;
          
          // Color code by intensity
          const color = hotspot.intensity > 5 ? "#ef4444" : "#f97316"; # Red vs Orange
          
          return (
            <Circle
              key={idx}
              center={[hotspot.latitude, hotspot.longitude]}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.35,
                weight: 2
              }}
              radius={hotspot.radius_km * 1000} // radius in meters
            >
              <Popup>
                <div className="p-1 text-slate-800">
                  <h4 className="font-bold text-sm text-red-600">AI Crime Hotspot</h4>
                  <p className="text-xs">Intensity weight: <b>{hotspot.intensity}</b> incidents</p>
                  <p className="text-xs">Radius: <b>{hotspot.radius_km.toFixed(2)} km</b></p>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
}
