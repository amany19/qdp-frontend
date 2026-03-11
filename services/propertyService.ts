import { api } from './api';

export interface PropertyFilters {
  propertyType?: string[];
  category?: 'sale' | 'rent';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  city?: string;
  area?: string;
  amenities?: string[];
  furnishingStatus?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc';
  limit?: number;
  offset?: number;
}

export const propertyService = {
  getProperties: async (filters?: PropertyFilters) => {
    const response = await api.get('/properties', { params: filters });
    return response.data;
  },

  getPropertyDetail: async (id: string) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  searchProperties: async (filters: PropertyFilters) => {
    const response = await api.get('/properties/search', { params: filters });
    return response.data;
  },

  getNearbyProperties: async (longitude: number, latitude: number) => {
    const response = await api.get('/properties/nearby', {
      params: { longitude, latitude },
    });
    return response.data;
  },

  getSimilarProperties: async (id: string) => {
    const response = await api.get(`/properties/similar/${id}`);
    return response.data;
  },

  createProperty: async (data: FormData) => {
    const response = await api.post('/properties', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateProperty: async (id: string, data: any) => {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  },

  deleteProperty: async (id: string) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  uploadImages: async (propertyId: string, images: File[]) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    const response = await api.post(`/properties/${propertyId}/images`, formData);
    return response.data;
  },

  addToFavorites: async (propertyId: string) => {
    const response = await api.post(`/properties/${propertyId}/favorite`);
    return response.data;
  },

  removeFromFavorites: async (propertyId: string) => {
    const response = await api.delete(`/properties/${propertyId}/favorite`);
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get('/properties/user/favorites');
    return response.data;
  },

  getMyProperties: async () => {
    const response = await api.get('/properties/my-properties');
    return response.data;
  },

  incrementView: async (propertyId: string) => {
    const response = await api.post(`/properties/${propertyId}/view`);
    return response.data;
  },
};
