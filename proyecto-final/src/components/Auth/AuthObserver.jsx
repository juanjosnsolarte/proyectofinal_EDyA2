import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase/config'
import { login, logout } from '../../store/slices/auth/authSlice'

function AuthObserver({ children }) {
  const dispatch = useDispatch()
  const { isRegistering } = useSelector(state => state.auth)

  useEffect(() => {
    if (isRegistering) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        dispatch(logout(null))
        return
      }

      try {
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
      } catch (error) {
        console.error('Error en AuthObserver al obtener usuario:', error)
        dispatch(logout(null))
      }
    })

    return () => unsubscribe()
  }, [dispatch, isRegistering])

  return children
}

export default AuthObserver
