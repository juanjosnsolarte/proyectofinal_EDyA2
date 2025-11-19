import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase/config'
import { login, logout } from '../../store/slices/auth/authSlice'

function AuthObserver({ children }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        dispatch(logout(null))
        return
      }

      // Leer datos del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))

      if (userDoc.exists()) {
        dispatch(login(userDoc.data()))
      } else {
        dispatch(login({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
        }))
      }
    })

    return () => unsubscribe()
  }, [dispatch])

  return children
}

export default AuthObserver
