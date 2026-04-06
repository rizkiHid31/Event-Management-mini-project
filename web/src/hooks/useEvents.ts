import { useState, useEffect, useCallback, useRef } from "react";
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

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchEvents = useCallback(async () => {
    const p = paramsRef.current;
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get(API_ENDPOINTS.EVENTS.LIST, {
        params: {
          ...p,
          ...(p.category === "ALL" ? { category: undefined } : {}),
        },
      });
      setEvents(data.data);
      setMeta(data.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [params.search, params.category, params.page, params.limit, params.sortBy, params.sortOrder, params.isFree]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, meta, loading, error, refetch: fetchEvents };
}

export function useEventDetail(slug: string) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiClient
      .get(API_ENDPOINTS.EVENTS.DETAIL(slug))
      .then(({ data }) => setEvent(data.data))
      .catch((err) => setError(err.response?.data?.message || "Event not found"))
      .finally(() => setLoading(false));
  }, [slug, refreshKey]);

  return { event, loading, error, refetch };
}
