import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function LocationPicker({ onLocationSelect, initialPosition = null }) {
  const [position, setPosition] = useState(initialPosition || { lat: 31.5204, lng: 74.3587 }); // Lahore default
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (position) {
      // Reverse geocoding using Nominatim (free)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
        .then(res => res.json())
        .then(data => {
          const addr = data.display_name || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
          setAddress(addr);
          if (onLocationSelect) {
            onLocationSelect({ ...position, address: addr });
          }
        })
        .catch(() => {
          const addr = `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
          setAddress(addr);
          if (onLocationSelect) {
            onLocationSelect({ ...position, address: addr });
          }
        });
    }
  }, [position, onLocationSelect]);

  return (
    <div>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ height: '300px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      {address && (
        <div className="mt-2 text-muted small">
          <i className="bi bi-geo-alt me-1"></i>
          {address}
        </div>
      )}
    </div>
  );
}
