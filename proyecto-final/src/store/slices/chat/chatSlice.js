import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  chats: [],                
  messagesByChat: {},       
  loadingChats: false,
  loadingMessages: false,
  sendingMessage: false,
  error: null,
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startLoadingChats: (state) => {
      state.loadingChats = true
      state.error = null
    },
    setChats: (state, { payload }) => {
      state.loadingChats = false
      state.chats = payload
      state.error = null
    },
    setChatsError: (state, { payload }) => {
      state.loadingChats = false
      state.error = payload || 'Error al cargar los chats.'
    },

    startLoadingMessages: (state) => {
      state.loadingMessages = true
      state.error = null
    },
    setMessagesForChat: (state, { payload }) => {
      const { chatId, messages } = payload
      state.loadingMessages = false
      state.messagesByChat[chatId] = messages
      state.error = null
    },
    setMessagesError: (state, { payload }) => {
      state.loadingMessages = false
      state.error = payload || 'Error al cargar mensajes.'
    },

    startSendingMessage: (state) => {
      state.sendingMessage = true
      state.error = null
    },
    finishSendingMessage: (state) => {
      state.sendingMessage = false
    },
    addMessage: (state, { payload }) => {
      const { chatId, message } = payload
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = []
      }
      state.messagesByChat[chatId].push(message)
      state.sendingMessage = false
    },

    upsertChat: (state, { payload }) => {
      const existingIndex = state.chats.findIndex(
        (c) => c.id === payload.id
      )
      if (existingIndex >= 0) {
        state.chats[existingIndex] = {
          ...state.chats[existingIndex],
          ...payload,
        }
      } else {
        state.chats.unshift(payload)
      }
    },
  },
})

export const {
  startLoadingChats,
  setChats,
  setChatsError,
  startLoadingMessages,
  setMessagesForChat,
  setMessagesError,
  startSendingMessage,
  finishSendingMessage,
  addMessage,
  upsertChat,
} = chatSlice.actions

export default chatSlice.reducer
