import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderNumber?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  totalAmount?: number;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  orderDate?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
}

interface OrdersState {
  orders: Order[];
  total: number;
  loading: boolean;
  error: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

const initialState: OrdersState = {
  orders: [],
  total: 0,
  loading: false,
  error: null,
  deleteLoading: false,
  deleteError: null,
};

const toMsg = (err: unknown) => err instanceof Error ? err.message : 'Unknown error';

export interface FetchOrdersParams {
  PageNumber?: number;
  PageSize?: number;
  Status?: string;
}

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: FetchOrdersParams = {}, { rejectWithValue }) => {
    try {
      const q: Record<string, string | number> = {};
      if (params.PageNumber) q.PageNumber = params.PageNumber;
      if (params.PageSize)   q.PageSize   = params.PageSize;
      if (params.Status)     q.Status     = params.Status;

      const json = await axiosInstance.get<Record<string, unknown>>('/Order/get-orders', q);
      const inner = (json as Record<string, unknown>).data ?? json;
      const list  = Array.isArray(inner) ? (inner as Order[]) : [];
      const d     = json as Record<string, unknown>;
      const total = (d.totalRecord ?? d.totalRecords ?? d.totalCount ?? d.total ?? list.length) as number;
      return { orders: list, total };
    } catch (err) { return rejectWithValue(toMsg(err)); }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete('/Order/delete-order', { id });
      return id;
    } catch (err) { return rejectWithValue(toMsg(err)); }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearDeleteError: (s) => { s.deleteError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchOrders.fulfilled, (s, a) => { s.loading = false; s.orders = a.payload.orders; s.total = a.payload.total; })
      .addCase(fetchOrders.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(deleteOrder.pending,   (s) => { s.deleteLoading = true;  s.deleteError = null; })
      .addCase(deleteOrder.fulfilled, (s, a) => { s.deleteLoading = false; s.orders = s.orders.filter(o => o.id !== a.payload); s.total = Math.max(0, s.total - 1); })
      .addCase(deleteOrder.rejected,  (s, a) => { s.deleteLoading = false; s.deleteError = a.payload as string; });
  },
});

export const { clearDeleteError } = ordersSlice.actions;
export default ordersSlice.reducer;
