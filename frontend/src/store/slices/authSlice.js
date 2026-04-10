import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Helper — save user + token together in localStorage
const saveUser = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

const savedUser = JSON.parse(localStorage.getItem('user') || 'null');

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    // res.data.user already has token nested inside (from sendTokenResponse)
    const userWithToken = { ...res.data.user, token: res.data.token };
    saveUser(userWithToken);
    return userWithToken;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    const userWithToken = { ...res.data.user, token: res.data.token };
    saveUser(userWithToken);
    return userWithToken;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch {}
  localStorage.removeItem('user');
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/update-profile', data);
    // Preserve token when updating profile
    const existing = JSON.parse(localStorage.getItem('user') || 'null');
    const updated  = { ...res.data.user, token: existing?.token };
    saveUser(updated);
    return updated;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    savedUser,
    loading: false,
    error:   null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => {
      state.loading = false;
      state.error   = action.payload;
      toast.error(action.payload || 'Something went wrong');
    };

    builder
      .addCase(register.pending,   pending)
      .addCase(register.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user    = payload;
        toast.success('Welcome! Account created.');
      })
      .addCase(register.rejected, rejected)

      .addCase(login.pending,   pending)
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user    = payload;
        toast.success(`Welcome back, ${payload.name}!`);
      })
      .addCase(login.rejected, rejected)

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        toast.success('Logged out');
      })

      .addCase(getMe.fulfilled, (state, { payload }) => {
        // Preserve token when refreshing user data
        const token = state.user?.token;
        state.user  = { ...payload, token };
      })

      .addCase(updateProfile.pending,   pending)
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user    = payload;
        toast.success('Profile updated');
      })
      .addCase(updateProfile.rejected, rejected);
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
