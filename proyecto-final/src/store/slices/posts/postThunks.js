import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../../firebase/config'
import {
  startLoadingPosts,
  setPosts,
  setPostsError,
  addPost,
} from './postSlice'
import Stack from '../../../utils/structures/Stack'

export const fetchPosts = () => {
  return async (dispatch) => {
    dispatch(startLoadingPosts())

    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('fecha', 'asc')
      )

      const snapshot = await getDocs(q)
      const stack = new Stack()

      snapshot.forEach((docSnap) => {
        const data = docSnap.data()

        let fecha = null
        if (data.fecha) {
          if (typeof data.fecha.toDate === 'function') {
            fecha = data.fecha.toDate().toISOString()
          } else {
            fecha = data.fecha
          }
        }

        stack.push({
          id: docSnap.id,
          tipo: data.tipo || 'experiencia',
          contenido: data.contenido || '',
          usuarioId: data.usuarioId || '',
          autorNombre: data.autorNombre || 'Estudiante',
          carrera: data.carrera || '',
          semestre: data.semestre || '',
          fecha, 
        })
      })

      const postsFromTop = stack.toArrayFromTop()
      dispatch(setPosts(postsFromTop))
    } catch (error) {
      console.error('Error al cargar publicaciones:', error)
      dispatch(setPostsError('No se pudieron cargar las publicaciones.'))
    }
  }
}

export const createPost = (postData) => {
  return async (dispatch) => {
    dispatch(startLoadingPosts())

    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...postData,
        fecha: serverTimestamp(), 
      })

      const newPost = {
        id: docRef.id,
        ...postData,
        fecha: new Date().toISOString(),
      }

      dispatch(addPost(newPost))

      return { ok: true }
    } catch (error) {
      console.error('Error al crear publicación:', error)
      dispatch(setPostsError('No se pudo crear la publicación.'))
      return { ok: false, errorMessage: 'No se pudo crear la publicación.' }
    }
  }
}