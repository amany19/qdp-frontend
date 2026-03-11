import { useEffect } from 'react';
import { useLocationStore } from '@/store/locationStore';

export function useUserLocation() {
  const { lat, lng, city, setLocation, fetchCityFromCoords } = useLocationStore();

  useEffect(() => {
    if ((lat === null || lng === null) && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchCityFromCoords(latitude, longitude); // automatically sets city
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, [lat, lng, fetchCityFromCoords]);

  return { lat, lng, city };
}