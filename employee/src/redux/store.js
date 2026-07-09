import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore }    from 'redux-persist';

import authReducer         from './slices/authSlice';
import { authApi }         from './api/authApi';
import { employeeApi }     from './api/employeeApi';

import { policeStationApi } from './api/policeStationApi';

// ── Storage (fixes Vite ESM incompatibility with redux-persist/lib/storage) ──
const storage = {
  getItem:    (key)        => Promise.resolve(localStorage.getItem(key)),
  setItem:    (key, value) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key)        => Promise.resolve(localStorage.removeItem(key)),
};

// ── Combine reducers ──────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]:       authApi.reducer,
  [employeeApi.reducerPath]:   employeeApi.reducer,
  
  [policeStationApi.reducerPath]: policeStationApi.reducer,
});

// ── Persist only the auth slice ───────────────────────────────────────────────
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ── Store ─────────────────────────────────────────────────────────────────────
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required by redux-persist
    }).concat(
      authApi.middleware,
      employeeApi.middleware,
    
      policeStationApi.middleware
    ),
});

export const persistor = persistStore(store);
export default store;