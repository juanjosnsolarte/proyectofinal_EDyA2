import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  friendsByUser: {}, // uid -> [friends]
  loading: false,
  error: null,

  requests: {
    incoming: [], // solicitudes que me envían
    outgoing: [], // solicitudes que yo envío
    loading: false,
    error: null,
  },
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

    startLoadingRequests: (state) => {
      state.requests.loading = true
      state.requests.error = null
    },

    setFriendRequests: (state, { payload }) => {
      const { incoming, outgoing } = payload
      state.requests.loading = false
      state.requests.incoming = incoming
      state.requests.outgoing = outgoing
    },

    setFriendRequestsError: (state, { payload }) => {
      state.requests.loading = false
      state.requests.error = payload
    },
  },
})

export const {
  startLoadingFriends,
  setFriends,
  setFriendsError,
  startLoadingRequests,
  setFriendRequests,
  setFriendRequestsError,
} = friendsSlice.actions

export default friendsSlice.reducer