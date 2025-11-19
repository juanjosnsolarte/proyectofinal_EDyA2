import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    // Configuración Inicial
    // auth: authReducer,
    // posts: postsReducer,
  },
})
