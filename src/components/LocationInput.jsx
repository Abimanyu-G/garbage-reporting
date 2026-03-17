import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function loadGoogleMapsPlaces(apiKey) {
  if (!apiKey) return Promise.resolve(false);
  if (window.google?.maps?.places) return Promise.resolve(true);
  if (window.__gmapsPlacesLoading) return window.__gmapsPlacesLoading;

  window.__gmapsPlacesLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: apiKey,
      libraries: 'places',
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return window.__gmapsPlacesLoading;
}

async function reverseGeocode(apiKey, lat, lng) {
  if (!apiKey) return null;
  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    key: apiKey,
  });
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
  const data = await res.json();
  const first = data?.results?.[0];
  return first?.formatted_address ?? null;
}

export default function LocationInput({
  value,
  onChange,
  placeholder = 'Search a place or enter an address...',
  required = false,
  name = 'location',
}) {
  const inputRef = useRef(null);
  const autoRef = useRef(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [hint, setHint] = useState('');

  const hasApiKey = Boolean(GOOGLE_MAPS_API_KEY);
  const mapsLink = useMemo(() => {
    const q = (value ?? '').trim();
    if (!q) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }, [value]);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMapsPlaces(GOOGLE_MAPS_API_KEY)
      .then((ok) => {
        if (cancelled) return;
        setMapsReady(Boolean(ok));
      })
      .catch(() => {
        if (cancelled) return;
        setMapsReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapsReady) return;
    if (!inputRef.current) return;
    if (autoRef.current) return;

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'name'],
      types: ['geocode', 'establishment'],
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      const formatted = place?.formatted_address || place?.name;
      if (formatted) {
        onChange({ target: { name, value: formatted } });
        setHint('');
      }
    });
    autoRef.current = ac;
  }, [mapsReady, onChange, name]);

  const handleUseMyLocation = async () => {
    setHint('');
    if (!navigator.geolocation) {
      setHint('Geolocation is not supported on this device/browser.');
      return;
    }

    setLocating(true);
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 30000,
        });
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // If API key exists, try to convert coords to a readable address. Otherwise, store coords.
      const address = await reverseGeocode(GOOGLE_MAPS_API_KEY, lat, lng);
      onChange({
        target: {
          name,
          value: address ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        },
      });
    } catch (e) {
      setHint('Could not fetch your location. Please allow location permission and try again.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="app-input pl-10 pr-36"
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="app-btn-ghost px-3 py-2"
            title="Use my current location"
          >
            <Navigation className="h-4 w-4" />
            <span className="hidden sm:inline">{locating ? 'Locating…' : 'Use my location'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>
          {hasApiKey && mapsReady
            ? 'Google suggestions enabled.'
            : hasApiKey
              ? 'Loading Google suggestions…'
              : 'Tip: add VITE_GOOGLE_MAPS_API_KEY to enable Google place search.'}
        </span>
        {mapsLink && (
          <a
            href={mapsLink}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            Open in Google Maps
          </a>
        )}
      </div>

      {hint && <p className="text-xs text-red-600">{hint}</p>}
    </div>
  );
}

