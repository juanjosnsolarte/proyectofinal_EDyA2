import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  posts: [],
  loading: false,
  errorMessage: null,
}

export const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    startLoadingPosts: (state) => {
      state.loading = true
      state.errorMessage = null
    },
    setPosts: (state, { payload }) => {
      state.loading = false
      state.errorMessage = null
      state.posts = payload
    },
    setPostsError: (state, { payload }) => {
      state.loading = false
      state.errorMessage = payload
    },
    addPost: (state, { payload }) => {
      state.loading = false
      state.errorMessage = null
      state.posts = [payload, ...state.posts]
    },
  },
})

export const {
  startLoadingPosts,
  setPosts,
  setPostsError,
  addPost,
} = postSlice.actions

export default postSlice.reducer
