import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  deleteUser,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore'
import {
  ref,
  get as rtdbGet,
  remove as rtdbRemove,
} from 'firebase/database'

import { auth, db, rtdb } from '../../../firebase/config'
import {
  checkingCredentials,
  login,
  logout,
  startRegistering,
  finishRegistering,
  setAuthError,
} from './authSlice'

const getAuthErrorMessage = (error) => {
  const code = error.code || ''

  switch (code) {
    case 'auth/email-already-in-use':
      return 'El correo ya ha sido registrado.'
    case 'auth/invalid-email':
      return 'El correo no tiene un formato válido.'
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil. Usa al menos 6 caracteres.'
    case 'auth/user-not-found':
      return 'No existe una cuenta con este correo.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Las credenciales han sido incorrectas.'
    default:
      return 'Las credenciales han sido incorrectas.'
  }
}

// REGISTRO
export const registerWithEmailPassword = ({
  email,
  password,
  name,
  career,
  semester,
  university,
  age,
}) => {
  return async (dispatch) => {
    dispatch(startRegistering())
    dispatch(checkingCredentials())

    try {
      // Crear usuario en Firebase Auth
      const resp = await createUserWithEmailAndPassword(auth, email, password)
      const { uid } = resp.user

      // Actualizar displayName en el perfil de Auth
      await updateProfile(resp.user, { displayName: name })

      // Guardar información del usuario en Firestore
      const userDocRef = doc(db, 'users', uid)
      await setDoc(userDocRef, {
        uid,
        name,
        email,
        career,
        semester,
        university,
        age,
        createdAt: new Date().toISOString(),
      })

      // Cerrar sesión para que luego inicie normalmente
      await signOut(auth)

      dispatch(logout(null))
      dispatch(finishRegistering())

      return { ok: true }
    } catch (error) {
      console.error('Error en registerWithEmailPassword:', error)
      const message = getAuthErrorMessage(error)

      dispatch(logout(message))
      dispatch(finishRegistering())

      return { ok: false, errorMessage: message }
    }
  }
}

// LOGIN
export const loginWithEmailPassword = ({ email, password }) => {
  return async (dispatch) => {
    dispatch(checkingCredentials())

    try {
      const resp = await signInWithEmailAndPassword(auth, email, password)
      const { uid, displayName, email: userEmail } = resp.user

      const userDocRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userDocRef)

      let userData = {
        uid,
        name: displayName,
        email: userEmail,
      }

      if (userSnap.exists()) {
        const data = userSnap.data()
        userData = {
          uid: data.uid,
          name: data.name,
          email: data.email,
          career: data.career,
          semester: data.semester,
          university: data.university,
          age: data.age,
        }
      }

      dispatch(login(userData))
    } catch (error) {
      console.error('Error en loginWithEmailPassword:', error)
      const message = getAuthErrorMessage(error)
      dispatch(logout(message))
    }
  }
}

// LOGOUT
export const logoutFirebase = () => {
  return async (dispatch) => {
    await signOut(auth)
    dispatch(logout(null))
  }
}

export const updateProfileData = (fields) => {
  return async (dispatch, getState) => {
    dispatch(checkingCredentials())

    try {
      const current = auth.currentUser
      const stateUser = getState().auth.user

      if (!current || !stateUser) {
        dispatch(setAuthError('No hay usuario autenticado.'))
        return { ok: false, errorMessage: 'No hay usuario autenticado.' }
      }

      const uid = current.uid

      const userDocRef = doc(db, 'users', uid)
      await updateDoc(userDocRef, {
        ...fields,
        updatedAt: new Date().toISOString(),
      })

      if (fields.name) {
        await updateProfile(current, { displayName: fields.name })
      }

      const updatedUser = {
        ...stateUser,
        ...fields,
      }
      dispatch(login(updatedUser))

      return { ok: true }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      dispatch(setAuthError('No se pudo actualizar el perfil.'))
      return { ok: false, errorMessage: 'No se pudo actualizar el perfil.' }
    }
  }
}

export const deleteCurrentUserAccount = () => {
  return async (dispatch) => {
    dispatch(checkingCredentials())

    const current = auth.currentUser
    if (!current) {
      dispatch(setAuthError('No hay usuario autenticado.'))
      return { ok: false, errorMessage: 'No hay usuario autenticado.' }
    }

    const uid = current.uid

    try {
      const postsRef = collection(db, 'posts')
      const qPosts = query(postsRef, where('usuarioId', '==', uid))
      const postsSnap = await getDocs(qPosts)

      for (const postDoc of postsSnap.docs) {
        const postId = postDoc.id

        const commentsRef = collection(db, `posts/${postId}/comments`)
        const commentsSnap = await getDocs(commentsRef)

        for (const commentDoc of commentsSnap.docs) {
          await deleteDoc(commentDoc.ref)
        }

        await deleteDoc(postDoc.ref)
      }

      const allPostsSnap = await getDocs(collection(db, 'posts'))

      for (const postDoc of allPostsSnap.docs) {
        const postData = postDoc.data()
        const postId = postDoc.id

        if (postData.usuarioId === uid) continue

        const commentsRef = collection(db, `posts/${postId}/comments`)
        const qUserComments = query(commentsRef, where('usuarioId', '==', uid))
        const commentsSnap = await getDocs(qUserComments)

        for (const commentDoc of commentsSnap.docs) {
          await deleteDoc(commentDoc.ref)
        }
      }

      const friendshipsRef = collection(db, 'friendships')
      const qAsUid1 = query(friendshipsRef, where('uid1', '==', uid))
      const qAsUid2 = query(friendshipsRef, where('uid2', '==', uid))

      const [snap1, snap2] = await Promise.all([
        getDocs(qAsUid1),
        getDocs(qAsUid2),
      ])

      for (const docSnap of [...snap1.docs, ...snap2.docs]) {
        await deleteDoc(docSnap.ref)
      }

      const chatsRef = ref(rtdb, 'chats')
      const chatsSnap = await rtdbGet(chatsRef)

      if (chatsSnap.exists()) {
        chatsSnap.forEach((chatSnap) => {
          const data = chatSnap.val() || {}
          const participants = data.participants || {}

          if (participants[uid]) {
            const chatId = chatSnap.key
            const chatRef = ref(rtdb, `chats/${chatId}`)
            rtdbRemove(chatRef)
          }
        })
      }

      const userDocRef = doc(db, 'users', uid)
      await deleteDoc(userDocRef)

      try {
        await deleteUser(current)
      } catch (error) {
        console.error(
          'No se pudo borrar el usuario de Auth (probablemente requiere login reciente):',
          error
        )
      }

      dispatch(logout(null))

      return { ok: true }
    } catch (error) {
      console.error('Error al eliminar cuenta:', error)
      let message = 'No se pudo eliminar la cuenta.'
      if (error.code === 'auth/requires-recent-login') {
        message =
          'Por seguridad, vuelve a iniciar sesión y luego intenta eliminar la cuenta de nuevo.'
      }
      dispatch(setAuthError(message))
      return { ok: false, errorMessage: message }
    }
  }
}