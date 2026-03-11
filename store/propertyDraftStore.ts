import { create } from 'zustand';

interface PropertyDraftStore {
  images: File[];
  setImages: (files: File[]) => void;
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
}

export const usePropertyDraftStore = create<PropertyDraftStore>((set) => ({
  images: [],
  setImages: (files) => set({ images: files }),
  addImages: (files) => set((state) => ({ images: [...state.images, ...files] })),
  removeImage: (index) => set((state) => ({
    images: state.images.filter((_, i) => i !== index)
  })),
  clearImages: () => set({ images: [] }),
}));