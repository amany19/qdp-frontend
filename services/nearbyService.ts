import { api } from "./api";

export type NearbyPlace = {
  name: string;
  type?: string;
  lat: number;
  lng: number;
};

export const nearbyService = {
  async getNearby(lat: number, lng: number): Promise<NearbyPlace[]> {
    const res = await api.get('/properties/nearby', {
      params: { lat, lng },
    });
    return res.data;
  },
  /** Uses property coordinates from DB (not device location). */
  async getNearbyByProperty(propertyId: string): Promise<NearbyPlace[]> {
    const res = await api.get(`/properties/${propertyId}/nearby`);
    return res.data;
  },
};