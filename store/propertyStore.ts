import { create } from 'zustand';

interface PropertyFilters {
  propertyType: string[];
  category: 'sale' | 'rent' | null;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  city: string | null;
  area: string | null;
  amenities: string[];
  furnishingStatus: string | null;
  sortBy: string;
}

interface PropertyState {
  filters: PropertyFilters;
  searchTerm: string;
  favorites: string[];

  setFilters: (filters: Partial<PropertyFilters>) => void;
  resetFilters: () => void;
  setSearchTerm: (term: string) => void;
  addFavorite: (propertyId: string) => void;
  removeFavorite: (propertyId: string) => void;
}

const initialFilters: PropertyFilters = {
  propertyType: [],
  category: null,
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
  bathrooms: null,
  city: null,
  area: null,
  amenities: [],
  furnishingStatus: null,
  sortBy: 'date_desc',
};

export const usePropertyStore = create<PropertyState>((set) => ({
  filters: initialFilters,
  searchTerm: '',
  favorites: [],

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: initialFilters }),

  setSearchTerm: (term) => set({ searchTerm: term }),

  addFavorite: (propertyId) =>
    set((state) => ({
      favorites: [...state.favorites, propertyId],
    })),

  removeFavorite: (propertyId) =>
    set((state) => ({
      favorites: state.favorites.filter((id) => id !== propertyId),
    })),
}));
