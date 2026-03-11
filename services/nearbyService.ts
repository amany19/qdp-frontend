import { api } from "./api";

export const nearbyService = {
  async getNearby(lat: number, lng: number) {
    const res = await api.get('/properties/nearby', {
      params: { lat, lng },
    });
    return res.data;
  },
};