import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../../firebase/config'
import {
  checkingCredentials,
  login,
  logout,
  startRegistering,
  finishRegistering,
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

      // 2. Actualizar displayName en el perfil de Auth
      await updateProfile(resp.user, { displayName: name })

      // 3. Guardar información del usuario en Firestore
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
      // Login en Firebase Auth
      const resp = await signInWithEmailAndPassword(auth, email, password)
      const { uid, displayName, email: userEmail } = resp.user

      // Leer datos del usuario en Firestore
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

      // Guardar al usuario en Redux
      dispatch(login(userData))
    } catch (error) {
      console.error('Error en loginWithEmailPassword:', error)
      const message = getAuthErrorMessage(error)
      dispatch(logout(message))
    }
  }
}

// Cierre de Sesión
export const logoutFirebase = () => {
  return async (dispatch) => {
    await signOut(auth)
    dispatch(logout(null))
  }
}
