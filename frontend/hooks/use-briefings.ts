"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useTodayBriefing() {
  return useQuery({
    queryKey: ["briefings", "today"],
    queryFn: () => api.getTodayBriefing(),
  });
}

export function useBriefing(date: string) {
  return useQuery({
    queryKey: ["briefings", date],
    queryFn: () => api.getBriefing(date),
    enabled: !!date,
  });
}

export function useGenerateBriefing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.generateBriefing(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefings"] });
    },
  });
}
