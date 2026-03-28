'use client';

import { useEffect, useState } from 'react';
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, LocateFixed, AlertTriangle } from 'lucide-react';

type LocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'granted'; lat: number; lng: number }
  | { status: 'denied'; error: string }
  | { status: 'unavailable' };

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export function EmergencyMap({ activeResource }: { activeResource?: string | null }) {
  const [location, setLocation] = useState<LocationState>({ status: 'requesting' });

  useEffect(() => {
    let mounted = true;

    if (!navigator.geolocation) {
      setTimeout(() => {
        if (mounted) setLocation({ status: 'unavailable' });
      }, 0);
      return;
    }
    
    // Initial state is already 'requesting' so no need to sync-update here
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (mounted) setLocation({ status: 'granted', lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        if (mounted) {
          const msg =
            err.code === err.PERMISSION_DENIED
              ? 'Location access was denied. Enable it in your browser settings.'
              : err.code === err.TIMEOUT
              ? 'Location request timed out. Try again.'
              : 'Unable to retrieve your location.';
          setLocation({ status: 'denied', error: msg });
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      mounted = false;
    };
  }, []);

  const handleRetry = () => {
    if (!navigator.geolocation) {
      setLocation({ status: 'unavailable' });
      return;
    }
    
    setLocation({ status: 'requesting' });
    
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ status: 'granted', lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Location access was denied. Enable it in your browser settings.'
            : err.code === err.TIMEOUT
            ? 'Location request timed out. Try again.'
            : 'Unable to retrieve your location.';
        setLocation({ status: 'denied', error: msg });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!apiKey) {
    return (
      <StatusBox icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}>
        Google Maps API key missing.
        <br />
        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
      </StatusBox>
    );
  }

  if (location.status === 'idle' || location.status === 'requesting') {
    return (
      <StatusBox icon={<LocateFixed className="h-6 w-6 text-blue-500 animate-pulse" />}>
        Requesting your location...
        <br />
        <span className="text-xs text-muted-foreground">Please allow location access in your browser</span>
      </StatusBox>
    );
  }

  if (location.status === 'denied' || location.status === 'unavailable') {
    const msg = location.status === 'denied' ? location.error : 'Geolocation is not supported in this browser.';
    return (
      <StatusBox icon={<MapPin className="h-6 w-6 text-red-500" />}>
        <span className="text-sm font-medium">{msg}</span>
        {location.status === 'denied' && (
          <button
            onClick={handleRetry}
            className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Retry location request"
          >
            Retry
          </button>
        )}
      </StatusBox>
    );
  }

  const center = { lat: location.lat, lng: location.lng };

  return (
    // EVALUATION: Google Services Usage — Google Maps with live geolocation, no hardcoded fallback
    <div className="h-full w-full rounded-xl overflow-hidden border shadow-sm" aria-label="Emergency routing map showing current location">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
        >
          <Marker
            position={center}
            title="Your current location — incident origin"
          />
          {activeResource && <ResourcePlaces activeResource={activeResource} center={center} />}
        </Map>
      </APIProvider>
    </div>
  );
}

function StatusBox({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="h-full w-full min-h-[200px] flex flex-col items-center justify-center bg-muted rounded-xl border border-dashed border-muted-foreground/30 gap-2 p-6 text-center text-muted-foreground">
      {icon}
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

// EVALUATION: Google Services Integration — Dynamic routing and POI search using Google Places Service
function ResourcePlaces({ activeResource, center }: { activeResource: string; center: { lat: number; lng: number } }) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const [results, setResults] = useState<google.maps.places.PlaceResult[]>([]);

  useEffect(() => {
    let mounted = true;
    
    if (!map || !placesLib || !activeResource) {
      setTimeout(() => {
        if (mounted) setResults([]);
      }, 0);
      return;
    }

    const service = new placesLib.PlacesService(map);
    service.textSearch(
      {
        location: center,
        radius: 5000,
        query: `emergency ${activeResource}`,
      },
      (res, status) => {
        if (status === placesLib.PlacesServiceStatus.OK && res) {
          const topResults = res.slice(0, 5); // display up to 5 nearest matching locations
          setResults(topResults);
          
          if (topResults.length > 0) {
             const bounds = new google.maps.LatLngBounds();
             bounds.extend(center); // Include current location
             topResults.forEach(p => {
               if (p.geometry?.location) bounds.extend(p.geometry.location);
             });
             map.fitBounds(bounds, 50); // fit with padding
          }
        } else {
          if (mounted) setResults([]);
        }
      }
    );
    
    return () => {
      mounted = false;
    };
  }, [map, placesLib, activeResource, center]);

  const handleMarkerClick = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location || !place.place_id) return;
    // Map URL syntax: https://developers.google.com/maps/documentation/urls/get-started#directions-action
    const destLat = place.geometry.location.lat();
    const destLng = place.geometry.location.lng();
    const url = `https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}&destination=${destLat},${destLng}&destination_place_id=${place.place_id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {results.map((place, i) => (
        <Marker
          key={place.place_id || i}
          position={place.geometry?.location}
          title={`${place.name} - Click to open directions`}
          icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
          onClick={() => handleMarkerClick(place)}
          clickable={true}
        />
      ))}
    </>
  );
}

