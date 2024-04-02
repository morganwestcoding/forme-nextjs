import { useState, useEffect } from 'react';
import axios from 'axios';

const useCities = (stateGeonameId) => {
    const [cities, setCities] = useState([]);
  
    useEffect(() => {
      if (!stateGeonameId) return;
  
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://api.geonames.org/childrenJSON`, {
            params: {
              geonameId: stateGeonameId,
              username: 'slaminmew',
            },
          });
          if (response.data && response.data.geonames) {
            const formattedCities = response.data.geonames.map((item) => ({
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