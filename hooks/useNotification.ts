'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpcClient } from '@/lib/trpc/client';

export function useUnreadNotifications() {
  return useQuery({
    queryKey: ['notification', 'unread'],
    queryFn: () => trpcClient.notification.unread.query(),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trpcClient.notification.markRead.mutate({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification'] });
    },
  });
}
