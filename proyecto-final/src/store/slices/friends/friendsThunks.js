import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
} from 'firebase/firestore'

import { db } from '../../../firebase/config'
import Graph from '../../../utils/structures/Graph'

import {
  startLoadingFriends,
  setFriends,
  setFriendsError,
} from './friendsSlice'

import { FriendshipModel } from '../../../models/FriendshipModel'

export const createFriendship = (uid1, uid2) => {
  return async () => {
    try {
      // ID ÚNICO para evitar duplicados
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

      const ref = collection(db, 'friendships')
      const snapshot = await getDocs(ref)

      snapshot.forEach(docSnap => {
        const data = docSnap.data()
        if (data.uid1 && data.uid2) {
          graph.addEdge(data.uid1, data.uid2)
        }
      })

      const friends = graph.getFriends(uid)

      dispatch(setFriends({ uid, friends }))
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

      return { ok: true }
    } catch (error) {
      console.error('Error eliminando amistad:', error)
      return { ok: false }
    }
  }
}
