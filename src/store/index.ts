import { configureStore } from '@reduxjs/toolkit';
import authReducer       from './authSlice';
import productsReducer   from './productsSlice';
import categoriesReducer from './categoriesSlice';
import brandsReducer     from './brandsSlice';
import colorsReducer     from './colorsSlice';
import profileReducer    from './profileSlice';
import bannersReducer    from './bannersSlice';
import usersReducer      from './usersSlice';

export const store = configureStore({
  reducer: {
    auth:       authReducer,
    products:   productsReducer,
    categories: categoriesReducer,
    brands:     brandsReducer,
    colors:     colorsReducer,
    profile:    profileReducer,
    banners:    bannersReducer,
    users:      usersReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;