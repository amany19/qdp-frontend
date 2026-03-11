import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LocationState {
    lat: number | null;
    lng: number | null;
    city: string | null;
    setLocation: (lat: number, lng: number, city?: string) => void;
    fetchCityFromCoords: (lat: number, lng: number) => Promise<void>;
}

export const useLocationStore = create<LocationState>()(
    persist(
        (set, get, store) => ({
            lat: null,
            lng: null,
            city: null,

            setLocation: (lat, lng, city) =>
                set({ lat, lng, city: city || null }),

            fetchCityFromCoords: async (lat, lng) => {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                    );

                    const data = await response.json();
                    console.log(data)
                    const cityName =
                        data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        data.address?.state ||
                        'Unknown';

                    set({ lat, lng, city: cityName });
                } catch (error) {
                    console.error('Failed to fetch city:', error);
                    set({ lat, lng, city: 'Unknown' });
                }
            },
        }),
        {
            name: 'user-location',
            storage: createJSONStorage(() =>
                typeof window !== 'undefined' ? localStorage : (undefined as any)
            ),
        }
    )
);