import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService, PropertyFilters } from '@/services/propertyService';
import { toast } from 'react-hot-toast';

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyService.searchProperties(filters || {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePropertyDetail(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyDetail(id),
    enabled: !!id,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => propertyService.getFavorites(),
  });
}

export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => propertyService.addToFavorites(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('تمت الإضافة إلى المفضلة');
    },
    onError: () => {
      toast.error('فشل في الإضافة إلى المفضلة');
    },
  });
}

export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => propertyService.removeFromFavorites(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('تمت الإزالة من المفضلة');
    },
    onError: () => {
      toast.error('فشل في الإزالة من المفضلة');
    },
  });
}

export function useMyProperties() {
  return useQuery({
    queryKey: ['my-properties'],
    queryFn: () => propertyService.getMyProperties(),
  });
}

export function useNearbyProperties(longitude: number, latitude: number) {
  return useQuery({
    queryKey: ['nearby-properties', longitude, latitude],
    queryFn: () => propertyService.getNearbyProperties(longitude, latitude),
    enabled: !!longitude && !!latitude,
  });
}

export function useSimilarProperties(id: string) {
  return useQuery({
    queryKey: ['similar-properties', id],
    queryFn: () => propertyService.getSimilarProperties(id),
    enabled: !!id,
  });
}
