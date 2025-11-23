import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  friendsByUser: {},   // uid -> [friends]
  loading: false,
  error: null,
}

export const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    startLoadingFriends: (state) => {
      state.loading = true
      state.error = null
    },

    setFriends: (state, { payload }) => {
      const { uid, friends } = payload
      state.loading = false
      state.friendsByUser[uid] = friends
    },

    setFriendsError: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

export const {
  startLoadingFriends,
  setFriends,
  setFriendsError,
} = friendsSlice.actions

export default friendsSlice.reducer
