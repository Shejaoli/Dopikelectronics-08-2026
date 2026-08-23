import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useProducts(filters?: { category?: string; featured?: string; search?: string }) {
  const queryKey = [api.products.list.path, filters];

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Create search params from filters
      const params = new URLSearchParams();
      if (filters?.category) params.append("category", filters.category);
      if (filters?.featured) params.append("featured", filters.featured);
      if (filters?.search) params.append("search", filters.search);

      const url = `${api.products.list.path}?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");

      // Parse with Zod schema from routes
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");

      return api.products.get.responses[200].parse(await res.json());
    },
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["/api/products/slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await fetch(`/api/products/slug/${slug}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");

      return res.json();
    },
  });
}
