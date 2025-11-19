import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../../firebase/config'
import { checkingCredentials, login, logout } from './authSlice'

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
      return 'La contraseña es incorrecta.'
    case 'auth/invalid-credential':
      return 'Las credenciales han sido incorrectas.'
    default:
      return 'Ocurrió un error al procesar la autenticación.'
  }
}

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

      // Guardar la información del usuario en Firestore
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

      dispatch(logout(null))

      return { ok: true }
    } catch (error) {
      console.error('Error en registerWithEmailPassword:', error)

      const message = getAuthErrorMessage(error)
      dispatch(logout(message))
      return { ok: false, errorMessage: message }
    }
  }
}

// Thunk para login con email y password
export const loginWithEmailPassword = ({ email, password }) => {
  return async (dispatch) => {
    dispatch(checkingCredentials())

    try {
      // Login en Auth
      const resp = await signInWithEmailAndPassword(auth, email, password)
      const { uid, displayName } = resp.user

      // Leer datos extra del perfil en Firestore
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
      const message = getAuthErrorMessage(error)
      dispatch(logout(message))
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
