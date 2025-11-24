import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth/authSlice'
import postsReducer from './slices/posts/postSlice'
import commentsReducer from './slices/comments/commentSlice'
import friendsReducer from './slices/friends/friendsSlice'
import chatReducer from './slices/chat/chatSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    comments: commentsReducer,
    friends: friendsReducer,
    chat: chatReducer,
  },
})
