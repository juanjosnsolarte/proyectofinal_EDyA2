import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../firebase/config'
import Graph from '../../../utils/structures/Graph'

import {
  startLoadingFriends,
  setFriends,
  setFriendsError,
  startLoadingRequests,
  setFriendRequests,
  setFriendRequestsError,
} from './friendsSlice'

import { FriendshipModel } from '../../../models/FriendshipModel'
import { FriendRequestModel } from '../../../models/FriendRequestModel'

const deleteChatsBetweenUsers = async (uid1, uid2) => {
  if (!uid1 || !uid2) return

  const chatsQ = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', uid1)
  )

  const chatsSnap = await getDocs(chatsQ)

  for (const chatDoc of chatsSnap.docs) {
    const data = chatDoc.data()
    const participants = data.participants || []

    if (participants.includes(uid1) && participants.includes(uid2)) {
      const chatId = chatDoc.id

      const msgsQ = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId)
      )
      const msgsSnap = await getDocs(msgsQ)

      for (const msgDoc of msgsSnap.docs) {
        await deleteDoc(msgDoc.ref)
      }

      await deleteDoc(chatDoc.ref)
    }
  }
}

export const createFriendship = (uid1, uid2) => {
  return async () => {
    try {
      const friendshipId =
        uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`

      const newFriendship = {
        ...FriendshipModel,
        uid1,
        uid2,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, 'friendships', friendshipId), newFriendship)

      return { ok: true }
    } catch (error) {
      console.error('Error creando amistad:', error)
      return { ok: false }
    }
  }
}

export const fetchFriends = (uid) => {
  return async (dispatch) => {
    dispatch(startLoadingFriends())

    try {
      const graph = new Graph()
      const userIds = new Set()

      const ref = collection(db, 'friendships')
      const snapshot = await getDocs(ref)

      snapshot.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.uid1 && data.uid2) {
          graph.addEdge(data.uid1, data.uid2)
          userIds.add(data.uid1)
          userIds.add(data.uid2)
        }
      })

      userIds.forEach((userId) => {
        const friendsOfUser = graph.getFriends(userId)
        dispatch(setFriends({ uid: userId, friends: friendsOfUser }))
      })

      if (uid && !userIds.has(uid)) {
        dispatch(setFriends({ uid, friends: [] }))
      }
    } catch (error) {
      console.error('Error cargando amigos:', error)
      dispatch(setFriendsError('No se pudieron cargar los amigos.'))
    }
  }
}

export const removeFriendship = (uid1, uid2) => {
  return async () => {
    try {
      const friendshipId =
        uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`

      await deleteDoc(doc(db, 'friendships', friendshipId))

      await deleteChatsBetweenUsers(uid1, uid2)

      return { ok: true }
    } catch (error) {
      console.error('Error eliminando amistad:', error)
      return { ok: false }
    }
  }
}

export const sendFriendRequest = (fromUid, toUid) => {
  return async (dispatch) => {
    try {
      const requestId = `${fromUid}_${toUid}`

      const newRequest = {
        ...FriendRequestModel,
        fromUid,
        toUid,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, 'friendRequests', requestId), newRequest)

      dispatch(fetchFriendRequests(fromUid))

      return { ok: true }
    } catch (error) {
      console.error('Error enviando solicitud de amistad:', error)
      return {
        ok: false,
        errorMessage: 'No se pudo enviar la solicitud.',
      }
    }
  }
}

export const fetchFriendRequests = (uid) => {
  return async (dispatch) => {
    dispatch(startLoadingRequests())

    try {
      const ref = collection(db, 'friendRequests')

      const incomingQuery = query(ref, where('toUid', '==', uid))
      const outgoingQuery = query(ref, where('fromUid', '==', uid))

      const [incomingSnap, outgoingSnap] = await Promise.all([
        getDocs(incomingQuery),
        getDocs(outgoingQuery),
      ])

      const incoming = incomingSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))

      const outgoing = outgoingSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))

      dispatch(setFriendRequests({ incoming, outgoing }))
    } catch (error) {
      console.error('Error cargando solicitudes de amistad:', error)
      dispatch(
        setFriendRequestsError(
          'No se pudieron cargar las solicitudes de amistad.'
        )
      )
    }
  }
}

export const acceptFriendRequest = (requestId, fromUid, toUid) => {
  return async (dispatch) => {
    try {
      const uid1 = fromUid < toUid ? fromUid : toUid
      const uid2 = fromUid < toUid ? toUid : fromUid
      const friendshipId = `${uid1}_${uid2}`

      const newFriendship = {
        ...FriendshipModel,
        uid1,
        uid2,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, 'friendships', friendshipId), newFriendship)
      await deleteDoc(doc(db, 'friendRequests', requestId))

      dispatch(fetchFriends(fromUid))
      dispatch(fetchFriends(toUid))
      dispatch(fetchFriendRequests(fromUid))
      dispatch(fetchFriendRequests(toUid))

      return { ok: true }
    } catch (error) {
      console.error('Error aceptando solicitud de amistad:', error)
      return {
        ok: false,
        errorMessage: 'No se pudo aceptar la solicitud.',
      }
    }
  }
}

export const rejectFriendRequest = (requestId, currentUid) => {
  return async (dispatch) => {
    try {
      await deleteDoc(doc(db, 'friendRequests', requestId))

      dispatch(fetchFriendRequests(currentUid))

      return { ok: true }
    } catch (error) {
      console.error('Error rechazando solicitud de amistad:', error)
      return {
        ok: false,
        errorMessage: 'No se pudo rechazar la solicitud.',
      }
    }
  }
}