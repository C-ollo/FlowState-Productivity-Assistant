"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { CreateDeadlineRequest, UpdateDeadlineRequest } from "@/types";

export function useDeadlines(params?: {
  status?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["deadlines", params],
    queryFn: () => api.getDeadlines(params),
  });
}

export function useUpcomingDeadlines(days?: number) {
  return useQuery({
    queryKey: ["deadlines", "upcoming", days],
    queryFn: () => api.getUpcomingDeadlines(days),
  });
}

export function useOverdueDeadlines() {
  return useQuery({
    queryKey: ["deadlines", "overdue"],
    queryFn: () => api.getOverdueDeadlines(),
  });
}

export function useDeadline(id: string) {
  return useQuery({
    queryKey: ["deadlines", id],
    queryFn: () => api.getDeadline(id),
    enabled: !!id,
  });
}

export function useCreateDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeadlineRequest) => api.createDeadline(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
    },
  });
}

export function useUpdateDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeadlineRequest }) =>
      api.updateDeadline(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
    },
  });
}

export function useCompleteDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.completeDeadline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
    },
  });
}
