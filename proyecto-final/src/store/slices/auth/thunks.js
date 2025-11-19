import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../../firebase/config'
import { checkingCredentials, login, logout } from './authSlice'

// Thunk para registrar usuario nuevo
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
    dispatch(checkingCredentials())

    try {
      // Crear usuario en Firebase Auth
      const resp = await createUserWithEmailAndPassword(auth, email, password)
      const { uid } = resp.user

      // Actualizar displayName
      await updateProfile(resp.user, { displayName: name })

      // Guardar información extra en Firestore
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

      // Actualizar estado en Redux
      dispatch(
        login({
          uid,
          name,
          email,
          career,
          semester,
          university,
          age,
        }),
      )
    } catch (error) {
      console.error('Error en registerWithEmailPassword:', error)
      dispatch(logout(error.message))
    }
  }
}

// Thunk para login con email y password
export const loginWithEmailPassword = ({ email, password }) => {
  return async (dispatch) => {
    dispatch(checkingCredentials())

    try {
      const resp = await signInWithEmailAndPassword(auth, email, password)
      const { uid, displayName } = resp.user

      // Intentar leer datos extra del perfil en Firestore
      const userDocRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userDocRef)

      let userData = {
        uid,
        name: displayName,
        email,
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
      dispatch(logout(error.message))
    }
  }
}

// Thunk para logout
export const logoutFirebase = () => {
  return async (dispatch) => {
    await signOut(auth)
    dispatch(logout())
  }
}
