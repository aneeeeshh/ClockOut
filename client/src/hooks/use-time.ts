import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useServerTime() {
  return useQuery({
    queryKey: [api.time.get.path],
    queryFn: async () => {
      const res = await fetch(api.time.get.path);
      if (!res.ok) throw new Error("Failed to fetch time");
      return api.time.get.responses[200].parse(await res.json());
    },
    // Refresh occasionally to sync if needed, but we mostly rely on client calculation
    refetchInterval: 60000, 
  });
}
