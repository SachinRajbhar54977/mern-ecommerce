// ─── cartSlice ────────────────────────────────────────────────
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/cart'); return r.data.cart; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try { const r = await api.post('/cart', data); return r.data.cart; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const updateCart = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try { const r = await api.put(`/cart/${itemId}`, { quantity }); return r.data.cart; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try { await api.delete(`/cart/${itemId}`); return itemId; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const clearCartThunk = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try { await api.delete('/cart'); return []; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCart.fulfilled,      (s, a) => { s.items = a.payload?.items || []; s.loading = false; })
     .addCase(addToCart.fulfilled,      (s, a) => { s.items = a.payload?.items || []; toast.success('Added to cart!'); })
     .addCase(addToCart.rejected,       (s, a) => { toast.error(a.payload || 'Failed to add'); })
     .addCase(updateCart.fulfilled,     (s, a) => { s.items = a.payload?.items || []; })
     .addCase(removeFromCart.fulfilled, (s, a) => { s.items = s.items.filter((i) => i._id !== a.payload); toast.success('Removed from cart'); })
     .addCase(clearCartThunk.fulfilled, (s)    => { s.items = []; });
  },
});
export const cartReducer = cartSlice.reducer;

// ─── productSlice ─────────────────────────────────────────────
import { createSlice as createSlice2, createAsyncThunk as createAsyncThunk2 } from '@reduxjs/toolkit';
import api2 from '../../services/api';

export const fetchProducts = createAsyncThunk2('products/fetch', async (params, { rejectWithValue }) => {
  try { const r = await api2.get('/products', { params }); return r.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchProduct = createAsyncThunk2('products/fetchOne', async (id, { rejectWithValue }) => {
  try { const r = await api2.get(`/products/${id}`); return r.data.product; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchFeatured = createAsyncThunk2('products/featured', async (_, { rejectWithValue }) => {
  try { const r = await api2.get('/products/featured'); return r.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const productSlice = createSlice2({
  name: 'products',
  initialState: { list: [], product: null, featured: {}, total: 0, loading: false, error: null },
  reducers: { clearProduct: (s) => { s.product = null; } },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending,   (s)    => { s.loading = true; })
     .addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.list = a.payload.products; s.total = a.payload.total; })
     .addCase(fetchProducts.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(fetchProduct.pending,    (s)    => { s.loading = true; s.product = null; })
     .addCase(fetchProduct.fulfilled,  (s, a) => { s.loading = false; s.product = a.payload; })
     .addCase(fetchFeatured.fulfilled, (s, a) => { s.featured = a.payload; });
  },
});
export const { clearProduct } = productSlice.actions;
export const productReducer = productSlice.reducer;

// ─── orderSlice ───────────────────────────────────────────────
import { createSlice as createSlice3, createAsyncThunk as createAsyncThunk3 } from '@reduxjs/toolkit';
import api3 from '../../services/api';
import toast3 from 'react-hot-toast';

export const placeOrder = createAsyncThunk3('orders/place', async (data, { rejectWithValue }) => {
  try { const r = await api3.post('/orders', data); return r.data.order; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchOrders = createAsyncThunk3('orders/fetch', async (_, { rejectWithValue }) => {
  try { const r = await api3.get('/orders/mine'); return r.data.orders; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchOrder = createAsyncThunk3('orders/fetchOne', async (id, { rejectWithValue }) => {
  try { const r = await api3.get(`/orders/${id}`); return r.data.order; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const orderSlice = createSlice3({
  name: 'orders',
  initialState: { list: [], order: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(placeOrder.pending,    (s)    => { s.loading = true; })
     .addCase(placeOrder.fulfilled,  (s, a) => { s.loading = false; s.order = a.payload; toast3.success('Order placed!'); })
     .addCase(placeOrder.rejected,   (s, a) => { s.loading = false; s.error = a.payload; toast3.error(a.payload || 'Order failed'); })
     .addCase(fetchOrders.fulfilled, (s, a) => { s.list = a.payload; })
     .addCase(fetchOrder.fulfilled,  (s, a) => { s.order = a.payload; });
  },
});
export const orderReducer = orderSlice.reducer;

// ─── wishlistSlice ────────────────────────────────────────────
import { createSlice as createSlice4, createAsyncThunk as createAsyncThunk4 } from '@reduxjs/toolkit';
import api4 from '../../services/api';
import toast4 from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk4('wishlist/fetch', async (_, { rejectWithValue }) => {
  try { const r = await api4.get('/wishlist'); return r.data.wishlist?.products || []; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const toggleWishlist = createAsyncThunk4('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try { const r = await api4.post('/wishlist', { productId }); return r.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const wishlistSlice = createSlice4({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchWishlist.fulfilled,  (s, a) => { s.items = a.payload; })
     .addCase(toggleWishlist.fulfilled, (s, a) => { toast4.success(a.payload.message); });
  },
});
export const wishlistReducer = wishlistSlice.reducer;

// ─── uiSlice ──────────────────────────────────────────────────
import { createSlice as createSlice5 } from '@reduxjs/toolkit';

const uiSlice = createSlice5({
  name: 'ui',
  initialState: { mobileMenuOpen: false, searchOpen: false, cartDrawerOpen: false },
  reducers: {
    toggleMobileMenu: (s) => { s.mobileMenuOpen = !s.mobileMenuOpen; },
    closeMobileMenu:  (s) => { s.mobileMenuOpen = false; },
    toggleSearch:     (s) => { s.searchOpen = !s.searchOpen; },
    toggleCartDrawer: (s) => { s.cartDrawerOpen = !s.cartDrawerOpen; },
    closeCartDrawer:  (s) => { s.cartDrawerOpen = false; },
  },
});
export const { toggleMobileMenu, closeMobileMenu, toggleSearch, toggleCartDrawer, closeCartDrawer } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
