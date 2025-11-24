import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../../../firebase/config"

import {
  startLoadingComments,
  setComments,
  addCommentLocal,
  setCommentsError,
} from "./commentSlice"

export const fetchComments = (postId) => {
  return async (dispatch) => {
    dispatch(startLoadingComments())

    try {
      const ref = collection(db, `posts/${postId}/comments`)
      const q = query(ref, orderBy("fecha", "asc"))
      const snapshot = await getDocs(q)

      const comments = snapshot.docs.map((doc) => {
        const data = doc.data()

        const fecha = data.fecha?.toDate
          ? data.fecha.toDate().toISOString()
          : null

        return {
          id: doc.id,
          usuarioId: data.usuarioId,
          autorNombre: data.autorNombre,
          contenido: data.contenido,
          fecha,
        }
      })

      dispatch(setComments({ postId, comments }))
    } catch (error) {
      console.error(error)
      dispatch(setCommentsError("No se pudieron cargar los comentarios."))
    }
  }
}

export const addComment = (postId, commentData) => {
  return async (dispatch) => {
    try {
      const ref = collection(db, `posts/${postId}/comments`)

      await addDoc(ref, {
        ...commentData,
        fecha: serverTimestamp(),
      })

      dispatch(
        addCommentLocal({
          postId,
          comment: {
            id: crypto.randomUUID(),
            ...commentData,
            fecha: new Date().toISOString(),
          },
        })
      )

      return { ok: true }
    } catch (error) {
      console.error(error)
      return { ok: false }
    }
  }
}