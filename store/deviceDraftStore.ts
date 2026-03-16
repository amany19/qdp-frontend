import { create } from 'zustand';

interface DeviceDraftStore {
  images: File[];
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
}

export const useDeviceDraftStore = create<DeviceDraftStore>((set) => ({
  images: [],
  addImages: (files) =>
    set((state) => ({
      images: [...state.images, ...files].slice(0, 10),
    })),
  removeImage: (index) =>
    set((state) => ({
      images: state.images.filter((_, i) => i !== index),
    })),
  clearImages: () => set({ images: [] }),
}));
