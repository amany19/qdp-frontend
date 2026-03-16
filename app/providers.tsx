'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import ConditionalMobileWrapper from '@/components/ConditionalMobileWrapper';
import NotificationSocketProvider from '@/components/providers/NotificationSocketProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationSocketProvider>
        <ConditionalMobileWrapper>
          {children}
        </ConditionalMobileWrapper>
      </NotificationSocketProvider>
    </QueryClientProvider>
  );
}
