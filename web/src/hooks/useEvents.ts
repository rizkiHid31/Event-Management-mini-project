import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { EventItem, PaginationMeta } from "@/api/types";

interface UseEventsParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  isFree?: boolean;
}

export function useEvents(params: UseEventsParams = {}) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get(API_ENDPOINTS.EVENTS.LIST, {
        params: {
          ...params,
          ...(params.category === "ALL" ? { category: undefined } : {}),
        },
      });
      setEvents(data.data);
      setMeta(data.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, meta, loading, error, refetch: fetchEvents };
}

export function useEventDetail(slug: string) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiClient
      .get(API_ENDPOINTS.EVENTS.DETAIL(slug))
      .then(({ data }) => setEvent(data.data))
      .catch((err) => setError(err.response?.data?.message || "Event not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  return { event, loading, error };
}
