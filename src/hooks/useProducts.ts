import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export interface Product {
  id: number;
  productName: string;
  code: string;
  description: string;
  price: number;
  discountPrice: number | null;
  hasDiscount: boolean;
  quantity: number;
  weight: string | null;
  size: string | null;
  brandId: number;
  brandName: string;
  colorId: number;
  colorName: string;
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
  images: { id: number; imageUrl: string }[];
}

interface ProductsParams {
  pageNumber?: number;
  pageSize?: number;
  productName?: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchProducts: (params?: ProductsParams) => Promise<void>;
}

export function useProducts(): ProductsResponse {
  const token = useSelector((state: RootState) => state.auth.token);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (params: ProductsParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (params.pageNumber) query.set('PageNumber', String(params.pageNumber));
        if (params.pageSize) query.set('PageSize', String(params.pageSize));
        if (params.productName) query.set('ProductName', params.productName);

        const res = await fetch(
          `https://fastcard-1-o23z.onrender.com/api/Product/get-products?${query}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              accept: '*/*',
            },
          }
        );
        if (!res.ok) throw new Error('Failed to fetch products');
        const json = await res.json();
        const data = json.data ?? json;
        const list = Array.isArray(data) ? data : data.items ?? data.products ?? [];
        setProducts(list);
        setTotal(json.totalCount ?? json.total ?? list.length);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { products, total, loading, error, fetchProducts };
}
