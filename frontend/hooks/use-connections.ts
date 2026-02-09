"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useConnections() {
  return useQuery({
    queryKey: ["connections"],
    queryFn: () => api.getConnections(),
  });
}

export function useConnection(platform: string) {
  return useQuery({
    queryKey: ["connections", platform],
    queryFn: () => api.getConnection(platform),
    enabled: !!platform,
  });
}

export function useDisconnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platform: string) => api.disconnectPlatform(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useSyncPlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platform: string) => api.syncPlatform(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
    },
  });
}
