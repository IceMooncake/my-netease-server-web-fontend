'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpcClient } from '@/lib/trpc/client';

// ── Territory Queries ────────────────────────────────

export function useMyTerritories() {
  return useQuery({
    queryKey: ['territory', 'myTerritories'],
    queryFn: () => trpcClient.territory.myTerritories.query(),
  });
}

export function useMyInvitations() {
  return useQuery({
    queryKey: ['territory', 'myInvitations'],
    queryFn: () => trpcClient.territory.myInvitations.query(),
  });
}

export function useTerritoryInvitations(territoryId: string) {
  return useQuery({
    queryKey: ['territory', 'territoryInvitations', territoryId],
    queryFn: () => trpcClient.territory.territoryInvitations.query({ id: territoryId }),
    enabled: !!territoryId,
  });
}

// ── Territory Mutations ──────────────────────────────

export function useCreateTerritory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; type?: 'NO_ENTRY' | 'NO_BREAK' }) =>
      trpcClient.territory.create.mutate(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['territory'] });
    },
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; x1: number; z1: number; x2: number; z2: number }) =>
      trpcClient.territory.updateLocation.mutate(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['territory'] });
    },
  });
}

export function useInviteMember() {
  return useMutation({
    mutationFn: (input: { id: string; qq: string }) =>
      trpcClient.territory.invite.mutate(input),
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trpcClient.territory.acceptInvite.mutate({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['territory'] });
    },
  });
}

export function useRevokeInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trpcClient.territory.revokeInvite.mutate({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['territory'] });
    },
  });
}

export function useDonate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; amount: number }) =>
      trpcClient.territory.donate.mutate(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['territory'] });
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; qq: string }) =>
      trpcClient.territory.removeMember.mutate(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['territory'] });
    },
  });
}

export function useRequestDeleteTerritory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trpcClient.territory.requestDelete.mutate({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['territory'] });
    },
  });
}
