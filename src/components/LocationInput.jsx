import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

async function nominatimSearch(query, { signal } = {}) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    addressdetails: '1',
    limit: '5',
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    method: 'GET',
    signal,
    headers: {
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

async function nominatimReverse(lat, lng, { signal } = {}) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(lat),
    lon: String(lng),
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    method: 'GET',
    signal,
    headers: {
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error('Reverse geocode failed');
  return res.json();
}

export default function LocationInput({
  value,
  onChange,
  placeholder = 'Search a place or enter an address...',
  required = false,
  name = 'location',
}) {
  const inputRef = useRef(null);
  const [locating, setLocating] = useState(false);
  const [hint, setHint] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const mapsLink = useMemo(() => {
    const q = (value ?? '').trim();
    if (!q) return null;
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`;
  }, [value]);

  useEffect(() => {
    const q = (value ?? '').trim();
    if (!open) return;
    if (q.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      nominatimSearch(q, { signal: controller.signal })
        .then((data) => setResults(Array.isArray(data) ? data : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [value, open]);

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

      const controller = new AbortController();
      const data = await nominatimReverse(lat, lng, { signal: controller.signal });
      const address = data?.display_name ?? null;
      onChange({
        target: {
          name,
          value: address ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        },
      });
      setOpen(false);
    } catch (e) {
      setHint('Could not fetch your location. Please allow location permission and try again.');
    } finally {
      setLocating(false);
    }
  };

  const handlePick = (item) => {
    const label = item?.display_name;
    if (!label) return;
    onChange({ target: { name, value: label } });
    setHint('');
    setOpen(false);
    setResults([]);
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
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
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

        {open && (loading || results.length > 0) && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 app-card overflow-hidden">
            <div className="max-h-60 overflow-auto p-2">
              {loading && (
                <div className="px-3 py-2 text-sm text-slate-600">Searching…</div>
              )}
              {!loading && results.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-600">
                  No results. Try a more specific query.
                </div>
              ) : (
                <ul className="space-y-1">
                  {results.map((r) => (
                    <li key={`${r.place_id}`}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handlePick(r)}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
                      >
                        <div className="font-medium line-clamp-2">{r.display_name}</div>
                        {r.type && (
                          <div className="mt-0.5 text-xs text-slate-500">
                            {String(r.type).replaceAll('_', ' ')}
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Search powered by OpenStreetMap (Nominatim).</span>
        {mapsLink && (
          <a
            href={mapsLink}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            Open in OpenStreetMap
          </a>
        )}
      </div>

      {hint && <p className="text-xs text-red-600">{hint}</p>}
    </div>
  );
}

