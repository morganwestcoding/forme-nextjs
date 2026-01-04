'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  location?: string | null;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  zoom?: number;
  interactive?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  location,
  coordinates,
  zoom = 12,
  interactive = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  // Los Angeles coordinates as default
  const defaultLocation = {
    lng: -118.2437,
    lat: 34.0522,
    zoom: 10
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxgl.accessToken) return;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coordinates
          ? [coordinates.lng, coordinates.lat]
          : [defaultLocation.lng, defaultLocation.lat],
        zoom: coordinates ? zoom : defaultLocation.zoom,
        interactive: interactive,
        scrollZoom: interactive,
        dragPan: interactive,
        dragRotate: interactive,
        doubleClickZoom: interactive,
        touchZoomRotate: interactive,
        attributionControl: false
      });

      // Add default marker
      marker.current = new mapboxgl.Marker()
        .setLngLat(coordinates 
          ? [coordinates.lng, coordinates.lat]
          : [defaultLocation.lng, defaultLocation.lat])
        .addTo(map.current);
    }

    // Handle direct coordinates
    if (coordinates) {
      if (marker.current) {
        marker.current.remove();
      }
      
      marker.current = new mapboxgl.Marker()
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map.current);

      map.current?.flyTo({
        center: [coordinates.lng, coordinates.lat],
        zoom: zoom,
        essential: true
      });
    }
    // Handle location string
    else if (location) {
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}`)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            
            if (marker.current) {
              marker.current.remove();
            }
            
            marker.current = new mapboxgl.Marker()
              .setLngLat([lng, lat])
              .addTo(map.current!);

            map.current?.flyTo({
              center: [lng, lat],
              zoom: zoom,
              essential: true
            });
          }
        })
        .catch(error => {
          console.error('Error geocoding location:', error);
        });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [location, coordinates, zoom]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[200px] rounded-lg overflow-hidden shadow-sm shadow-gray-300 [&_.mapboxgl-ctrl-logo]:hidden [&_.mapboxgl-ctrl-attrib]:hidden"
    />
  );
};

export default MapComponent;