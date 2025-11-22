import { createSlice } from "@reduxjs/toolkit"

export const commentSlice = createSlice({
  name: "comments",

  initialState: {
    commentsByPost: {},  
    loading: false,
    error: null,
  },

  reducers: {
    startLoadingComments: (state) => {
      state.loading = true
      state.error = null
    },

    setComments: (state, action) => {
      const { postId, comments } = action.payload
      state.loading = false
      state.commentsByPost[postId] = comments
    },

    addCommentLocal: (state, action) => {
      const { postId, comment } = action.payload
      if (!state.commentsByPost[postId]) {
        state.commentsByPost[postId] = []
      }
      state.commentsByPost[postId].push(comment)
    },

    setCommentsError: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
  },
})

export const {
  startLoadingComments,
  setComments,
  addCommentLocal,
  setCommentsError,
} = commentSlice.actions

export default commentSlice.reducer