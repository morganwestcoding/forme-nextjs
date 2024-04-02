import { useState, useEffect } from 'react';
import axios from 'axios';

interface GeoNameItem {
  name: string;
  geonameId: string;
}


const useStates = (countryCode: string) => {
  const [states, setStates] = useState<Array<{label: string, value: string}>>([]);

  useEffect(() => {
    if (!countryCode) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`http://api.geonames.org/childrenJSON`, {
          params: {
            geonameId: countryCode,
            username: 'slaminmew',
          },
        });
        if (response.data && response.data.geonames) {
          const formattedStates = response.data.geonames.map((item: GeoNameItem) => ({
            label: item.name,
            value: item.geonameId,
          }));
          setStates(formattedStates);
        }
      } catch (error) {
        console.error('Error fetching states from GeoNames:', error);
      }
    };

    fetchData();
  }, [countryCode]);

  return states;
};


export default useStates;
