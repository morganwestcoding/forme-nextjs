import { useState, useEffect } from 'react';
import axios from 'axios';

interface GeoNameItem {
  name: string;
  geonameId: string;
  adminCode1: string;
  countryCode: string;
}

interface StateItem {
  label: string;
  value: string;
}

const useStates = (countryCode: string) => {
  const [states, setStates] = useState<Array<StateItem>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryCode) return;

    const fetchStates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`https://secure.geonames.org/searchJSON`, {
          params: {
            country: 'US',
            featureCode: 'ADM1',
            maxRows: 60,
            username: 'slaminmew',
            style: 'full'
          },
        });

        if (response.data && response.data.geonames) {
          const formattedStates = response.data.geonames
            .map((item: GeoNameItem) => ({
              label: item.name,
              value: item.adminCode1,
            }))
            .sort((a: StateItem, b: StateItem) => a.label.localeCompare(b.label));

          setStates(formattedStates);
        }
      } catch (err) {
        console.error('Error fetching states:', err);
        setError('Failed to fetch states');
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [countryCode]);

  return { states, loading, error };
};

export default useStates;