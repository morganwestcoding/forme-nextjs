// hooks/useCities.ts
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

interface GeoNameCity {
  name: string;
  geonameId: string;
  adminCode1: string; // state code, e.g. "CA"
  fcl: string;        // feature class, e.g. "P"
  fcode: string;      // feature code, e.g. "PPL"
  population?: number;
  // GeoNames has lots more fields; we only use these above
}

/** What the select expects */
export interface CityItem {
  label: string; // e.g., "Silver Lake, Los Angeles"
  value: string; // e.g., "gn_5368361" or "osm_12345"
}

/** Public options */
interface UseCitiesOptions {
  minPopulation?: number;          // default 0 (allow neighborhoods)
  includeNeighborhoods?: boolean;  // default true (PPLX, PPLL)
  maxRows?: number;                // default 1000
  username?: string;               // GeoNames username
  enableOsmFallback?: boolean;     // default true
  cacheTtlMs?: number;             // default 24 hours
}

/** OSM / Nominatim minimal types */
interface OSMAddress {
  city?: string;
  town?: string;
  village?: string;
  borough?: string;
  municipality?: string;
  county?: string;
  state?: string;
}

interface OSMItem {
  display_name: string;
  osm_id: number;
  type: string;   // city | town | suburb | neighbourhood | village | …
  class: string;  // 'place'
  importance?: number;
  address?: OSMAddress;
}

/** Defaults */
const CORE_FCODES = ['PPLC', 'PPLA', 'PPLA2', 'PPL'];
const EXTRA_FCODES = ['PPLX', 'PPLL'];

const DEFAULTS: Required<UseCitiesOptions> = {
  minPopulation: 0,
  includeNeighborhoods: true,
  maxRows: 1000,
  username: 'slaminmew',
  enableOsmFallback: true,
  cacheTtlMs: 24 * 60 * 60 * 1000, // 24h
};

/** US state names for OSM search */
const STATE_NAME_BY_CODE: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

/* ---------------- In-memory cache (module-level) ---------------- */
type CacheKey = string;
interface CacheEntry {
  at: number;
  items: CityItem[];
}
const _cache = new Map<CacheKey, CacheEntry>();

function makeCacheKey(stateCode: string, featureCodes: string[], o: Required<UseCitiesOptions>): CacheKey {
  return [
    'v3', // bump if you change logic
    stateCode,
    featureCodes.join('|'),
    o.minPopulation,
    o.maxRows,
    o.username,
    o.enableOsmFallback ? 1 : 0,
  ].join('::');
}

/* ---------------- GeoNames helpers ---------------- */
const GEONAMES_ENDPOINT = 'https://secure.geonames.org/searchJSON';

async function fetchGeoNamesForCode(
  stateCode: string,
  featureCode: string,
  maxRows: number,
  username: string
): Promise<GeoNameCity[]> {
  const { data } = await axios.get(GEONAMES_ENDPOINT, {
    params: {
      country: 'US',
      adminCode1: stateCode,
      featureClass: 'P',
      featureCode,          // send 1 code per request
      maxRows,
      username,
      style: 'full',
      orderby: 'population',
    },
  });
  if (data?.status?.message) throw new Error(data.status.message);
  return data?.geonames ?? [];
}

/* ---------------- OSM / Nominatim helpers ---------------- */
async function fetchOsmPlacesByState(stateCode: string): Promise<OSMItem[]> {
  const stateName = STATE_NAME_BY_CODE[stateCode.toUpperCase()];
  if (!stateName) return [];
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', `${stateName}, USA`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1'); // we use address.{city,...}
  url.searchParams.set('limit', '500');

  const res = await fetch(url.toString(), { method: 'GET' });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);

  const arr = (await res.json()) as any[];
  const wanted = new Set(['city', 'town', 'suburb', 'neighbourhood', 'village']);
  return arr.filter((x) => x?.class === 'place' && wanted.has(String(x?.type)));
}

/** Pretty label from an OSM item: "Name, ParentCity" if available */
function labelForOsm(item: OSMItem): string {
  // the first part of display_name is typically the locality name
  const main = (item.display_name || '').split(',')[0]?.trim() || '';
  const addr = item.address || {};
  const parent =
    addr.city || addr.town || addr.village || addr.borough || addr.municipality || '';
  if (parent && parent.toLowerCase() !== main.toLowerCase()) {
    return `${main}, ${parent}`;
  }
  return main || parent || item.display_name || '';
}

/* ---------------- Hook ---------------- */
const useCities = (stateCode: string, opts?: UseCitiesOptions) => {
  const options: Required<UseCitiesOptions> = { ...DEFAULTS, ...(opts || {}) };

  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const reqIdRef = useRef(0);

  const featureCodes = useMemo(
    () =>
      options.includeNeighborhoods
        ? [...CORE_FCODES, ...EXTRA_FCODES]
        : [...CORE_FCODES],
    [options.includeNeighborhoods]
  );

  useEffect(() => {
    if (!stateCode) {
      setCities([]);
      setError(null);
      setLoading(false);
      return;
    }

    const reqId = ++reqIdRef.current;

    const run = async () => {
      setLoading(true);
      setError(null);

      const cacheKey = makeCacheKey(stateCode, featureCodes, options);
      const cached = _cache.get(cacheKey);
      const now = Date.now();
      if (cached && now - cached.at < options.cacheTtlMs) {
        setCities(cached.items);
        setLoading(false);
        return;
      }

      try {
        // 1) GeoNames in parallel by featureCode
        const geoBatches = await Promise.all(
          featureCodes.map((fc) =>
            fetchGeoNamesForCode(stateCode, fc, options.maxRows, options.username)
              .catch(() => [] as GeoNameCity[])
          )
        );
        const geoMerged: GeoNameCity[] = ([] as GeoNameCity[]).concat(...geoBatches);

        // 2) Optional OSM fallback
        let osmItems: OSMItem[] = [];
        if (options.enableOsmFallback) {
          try {
            osmItems = await fetchOsmPlacesByState(stateCode);
          } catch {
            // silent ignore for UX
          }
        }

        if (reqId !== reqIdRef.current) return;

        // Normalize to common row structure
        type AnyRow = { name: string; id: string; pop: number; label?: string };

        const rows: AnyRow[] = [];

        // GeoNames -> AnyRow
        for (const c of geoMerged) {
          if (c.fcl !== 'P') continue;
          if (!featureCodes.includes(c.fcode)) continue;
          const name = (c.name || '').trim();
          if (!name) continue;
          rows.push({
            name,
            id: `gn_${c.geonameId}`,
            pop: typeof c.population === 'number' ? c.population : 0,
            // GeoNames label = name only (we could add county, but it’s noisy)
            label: name,
          });
        }

        // OSM -> AnyRow (with parent-city suffix, e.g., ", Los Angeles")
        for (const o of osmItems) {
          const label = labelForOsm(o).trim();
          const main = label.split(',')[0]?.trim() || label; // primary name
          if (!main) continue;
          rows.push({
            name: main,           // used for dedupe key
            id: `osm_${o.osm_id}`,
            pop: Math.round(((o.importance ?? 0) * 100000) as number), // salience proxy
            label,                // pretty label (with parent city when available)
          });
        }

        // Deduplicate by lowercase name; keep row with higher "pop"
        const bestByName = new Map<string, AnyRow>();
        for (const r of rows) {
          const key = r.name.toLowerCase();
          const cur = bestByName.get(key);
          if (!cur || r.pop > cur.pop) bestByName.set(key, r);
        }

        // Map to CityItem
        const items: CityItem[] = Array.from(bestByName.values()).map((r) => ({
          label: r.label || r.name,
          value: r.id,
        }));

        // Sort by pop desc then label asc
        items.sort((a, b) => {
          const pa = bestByName.get(a.label.split(',')[0].trim().toLowerCase())?.pop ?? 0;
          const pb = bestByName.get(b.label.split(',')[0].trim().toLowerCase())?.pop ?? 0;
          if (pb !== pa) return pb - pa;
          return a.label.localeCompare(b.label);
        });

        // Cache & set
        _cache.set(cacheKey, { at: now, items });
        setCities(items);
      } catch (e: any) {
        if (reqId !== reqIdRef.current) return;
        // eslint-disable-next-line no-console
        console.error('[useCities] error:', e);
        setError(e?.message || 'Failed to fetch cities');
        setCities([]);
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    };

    run();

    // “cancel” guard
    return () => { reqIdRef.current++; };
  }, [stateCode, featureCodes, options]);

  return { cities, loading, error };
};

export default useCities;
