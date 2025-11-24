import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore'
import {
  ref,
  push,
  onValue,
  off,
  query as rtdbQuery,
  orderByChild,
} from 'firebase/database'
import { db, rtdb } from '../../../firebase/config'
import {
  startLoadingChats,
  setChats,
  setChatsError,
  startLoadingMessages,
  setMessagesForChat,
  setMessagesError,
  startSendingMessage,
  finishSendingMessage,
  upsertChat,
} from './chatSlice'

const messageListeners = {}

export const fetchUserChats = (userId) => {
  return async (dispatch) => {
    if (!userId) return

    dispatch(startLoadingChats())

    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId)
      )

      const snap = await getDocs(q)
      const chats = []

      snap.forEach((docSnap) => {
        const data = docSnap.data()
        chats.push({
          id: docSnap.id,
          participants: data.participants || [],
          createdAt: data.createdAt || null,
          lastMessage: data.lastMessage || '',
          lastMessageAt: data.lastMessageAt || null,
        })
      })

      chats.sort((a, b) => {
        const fa = a.lastMessageAt || a.createdAt || null
        const fb = b.lastMessageAt || b.createdAt || null
        if (!fa && !fb) return 0
        if (!fa) return 1
        if (!fb) return -1
        return fb.toMillis?.() - fa.toMillis?.()
      })

      dispatch(setChats(chats))
    } catch (error) {
      console.error('Error al cargar chats:', error)
      dispatch(setChatsError('No se pudieron cargar tus chats.'))
    }
  }
}

export const ensureChat = (fromUid, toUid) => {
  return async (dispatch) => {
    if (!fromUid || !toUid || fromUid === toUid) {
      return {
        ok: false,
        errorMessage: 'Usuarios inválidos para crear el chat.',
      }
    }

    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', fromUid)
      )
      const snap = await getDocs(q)

      let existingChatId = null

      snap.forEach((docSnap) => {
        const data = docSnap.data()
        const participants = data.participants || []
        if (
          participants.includes(fromUid) &&
          participants.includes(toUid)
        ) {
          existingChatId = docSnap.id
        }
      })

      if (existingChatId) {
        return { ok: true, chatId: existingChatId }
      }

      const docRef = await addDoc(collection(db, 'chats'), {
        participants: [fromUid, toUid],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageAt: null,
      })

      const newChat = {
        id: docRef.id,
        participants: [fromUid, toUid],
        createdAt: new Date(),
        lastMessage: '',
        lastMessageAt: null,
      }

      dispatch(upsertChat(newChat))

      return { ok: true, chatId: docRef.id }
    } catch (error) {
      console.error('Error al asegurar chat:', error)
      return {
        ok: false,
        errorMessage: 'No se pudo iniciar el chat.',
      }
    }
  }
}

export const fetchMessagesForChat = (chatId) => {
  return (dispatch) => {
    if (!chatId) return

    if (messageListeners[chatId]) {
      const oldRef = ref(rtdb, `messages/${chatId}`)
      off(oldRef, 'value', messageListeners[chatId])
      delete messageListeners[chatId]
    }

    dispatch(startLoadingMessages())

    const messagesRef = rtdbQuery(
      ref(rtdb, `messages/${chatId}`),
      orderByChild('createdAt')
    )

    const handler = (snapshot) => {
      const messages = []

      snapshot.forEach((childSnap) => {
        const data = childSnap.val()
        messages.push({
          id: childSnap.key,
          chatId,
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt || null, 
        })
      })

      dispatch(
        setMessagesForChat({
          chatId,
          messages,
        })
      )
    }

    messageListeners[chatId] = handler

    onValue(
      messagesRef,
      handler,
      (error) => {
        console.error('Error en RTDB mensajes:', error)
        dispatch(
          setMessagesError('No se pudieron cargar los mensajes.')
        )
      }
    )
  }
}

export const sendMessage = (chatId, senderId, text) => {
  return async (dispatch) => {
    if (!chatId || !senderId || !text.trim()) return

    dispatch(startSendingMessage())

    try {
      const trimmed = text.trim()

      const messagesRef = ref(rtdb, `messages/${chatId}`)
      await push(messagesRef, {
        chatId,
        senderId,
        text: trimmed,
        createdAt: Date.now(), 
      })

      const chatRef = doc(db, 'chats', chatId)
      await updateDoc(chatRef, {
        lastMessage: trimmed,
        lastMessageAt: serverTimestamp(),
      })

      dispatch(
        upsertChat({
          id: chatId,
          lastMessage: trimmed,
          lastMessageAt: new Date(),
        })
      )

      dispatch(finishSendingMessage())

      return { ok: true }
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      dispatch(finishSendingMessage())
      return {
        ok: false,
        errorMessage: 'No se pudo enviar el mensaje.',
      }
    }
  }
}