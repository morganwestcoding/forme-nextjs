import { useState, useEffect } from 'react';
import axios from 'axios';

interface GeoNameCity {
  name: string;
  geonameId: string;
}

type CityItem = {
  label: string;
  value: string;
};



const useCities = (stateGeonameId: string) => {
  const [cities, setCities] = useState<CityItem[]>([]);

  useEffect(() => {
    if (!stateGeonameId) {
      setCities([]);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`https://secure.geonames.org/childrenJSON`, {
          params: {
            geonameId: stateGeonameId,
            username: 'slaminmew',
          },
        });
        if (response.data && response.data.geonames) {
          const formattedCities = response.data.geonames.map((item: GeoNameCity) => ({
            label: item.name,
            value: item.geonameId,
          }));
          setCities(formattedCities);
        }
      } catch (error) {
        console.error('Error fetching cities from GeoNames:', error);
      }
    };

    fetchData();
  }, [stateGeonameId]);

  return cities;
};

export default useCities;
