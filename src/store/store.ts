import { configureStore } from '@reduxjs/toolkit';
import tableReducer from '../features/table/tableSlice';

export const store = configureStore({
  reducer: {
    // Aquí registramos nuestro slice de la mesa
    table: tableReducer,
    // Podríamos añadir más reducers en el futuro
  },
});

// Tipos para usar con hooks de TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
