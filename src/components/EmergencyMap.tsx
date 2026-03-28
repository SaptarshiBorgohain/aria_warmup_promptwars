'use client';

import { useEffect, useState } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export function EmergencyMap() {
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => console.warn('Geolocation denied or failed')
      );
    }
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted rounded-xl border border-dashed border-muted-foreground/30">
        <p className="text-muted-foreground text-sm text-center px-4">
          Google Maps API missing.<br/> Map visualization unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border shadow-sm">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={14}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          <Marker position={center} />
        </Map>
      </APIProvider>
    </div>
  );
}
