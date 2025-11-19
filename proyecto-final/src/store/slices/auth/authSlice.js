import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  status: 'checking', // 'checking' | 'not-authenticated' | 'authenticated'
  user: null,         
  errorMessage: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    checkingCredentials: (state) => {
      state.status = 'checking'
      state.errorMessage = null
    },
    login: (state, { payload }) => {
      state.status = 'authenticated'
      state.user = payload
      state.errorMessage = null
    },
    logout: (state, { payload }) => {
      state.status = 'not-authenticated'
      state.user = null
      state.errorMessage = payload || null
    },
    clearErrorMessage: (state) => {
      state.errorMessage = null
    },
  },
})

export const {
  checkingCredentials,
  login,
  logout,
  clearErrorMessage,
} = authSlice.actions

export default authSlice.reducer
