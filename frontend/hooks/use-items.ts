"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { UpdateItemRequest } from "@/types";

export function useInboxItems(params?: {
  platform?: string;
  category?: string;
  action_required?: boolean;
  is_read?: boolean;
  is_archived?: boolean;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["inbox", params],
    queryFn: () => api.getInboxItems(params),
  });
}

export function useInboxStats() {
  return useQuery({
    queryKey: ["inbox", "stats"],
    queryFn: () => api.getInboxStats(),
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ["inbox", id],
    queryFn: () => api.getItem(id),
    enabled: !!id,
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemRequest }) =>
      api.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}

export function useArchiveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.archiveItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.markItemAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}

export function useProcessItemAI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.processItemAI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}

export function useProcessAllItemsAI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.processAllItemsAI(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
    },
  });
}
