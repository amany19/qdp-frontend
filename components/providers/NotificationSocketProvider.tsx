'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { SERVER_BASE_URL } from '@/lib/config';
import ContractSignedReloginModal from '@/components/notifications/ContractSignedReloginModal';

const NOTIFICATION_EVENT = 'app:notification';

export function emitNotificationEvent(payload: unknown) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: payload }));
  }
}

export function useOnNotification(callback: (payload: unknown) => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      callbackRef.current(detail);
    };
    window.addEventListener(NOTIFICATION_EVENT, handler);
    return () => window.removeEventListener(NOTIFICATION_EVENT, handler);
  }, []);
}

export default function NotificationSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasHydrated || !isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(SERVER_BASE_URL, {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('notification', (payload: unknown) => {
      emitNotificationEvent(payload);
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [hasHydrated, isAuthenticated, token]);

  return (
    <>
      {children}
      {isAuthenticated && <ContractSignedReloginModal />}
    </>
  );
}
