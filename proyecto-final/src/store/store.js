import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth/authSlice'
import postsReducer from './slices/posts/postSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
  },
})