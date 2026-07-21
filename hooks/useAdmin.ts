'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpcClient } from '@/lib/trpc/client';

export function useAdminTasks(status?: string) {
  return useQuery({
    queryKey: ['admin', 'tasks', status],
    queryFn: () => trpcClient.admin.tasks.query({ status }),
    enabled: true,
  });
}

export function useProcessTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { taskId: string; approved: boolean; message?: string }) =>
      trpcClient.admin.process.mutate(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
