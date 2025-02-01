import { useState, useEffect } from 'react';
import axios from 'axios';

interface GeoNameCity {
  name: string;
  geonameId: string;
  population: number;
  adminCode1: string;
  fcl: string;
  fcode: string;
}

interface CityItem {
  label: string;
  value: string;
}

const useCities = (stateCode: string) => {
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stateCode) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`https://secure.geonames.org/searchJSON`, {
          params: {
            country: 'US',
            adminCode1: stateCode,
            featureClass: 'P',
            featureCode: 'PPL',
            maxRows: 1000,
            username: 'slaminmew',
            style: 'full',
            orderby: 'population',
          },
        });

        if (response.data && response.data.geonames) {
          const formattedCities = response.data.geonames
            .filter((city: GeoNameCity) => 
              city.fcl === 'P' && 
              ['PPL', 'PPLA', 'PPLA2', 'PPLC'].includes(city.fcode) &&
              city.population > 1000
            )
            .map((item: GeoNameCity) => ({
              label: item.name,
              value: item.geonameId,
            }))
            .sort((a: CityItem, b: CityItem) => a.label.localeCompare(b.label));

          setCities(formattedCities);
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Failed to fetch cities');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [stateCode]);

  return { cities, loading, error };
};

export default useCities;