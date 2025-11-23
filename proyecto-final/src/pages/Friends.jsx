import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchFriends } from '../store/slices/friends/friendsThunks'
import styles from '../styles/pages/Friends.module.scss'

function Friends() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { friendsByUser, loading, error } = useSelector(state => state.friends)

  const myFriends = user ? (friendsByUser[user.uid] || []) : []

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchFriends(user.uid))
    }
  }, [dispatch, user?.uid])

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p>No hay usuario autenticado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Amigos de {user.name || 'estudiante'}
        </h2>

        {loading && (
          <p className={styles.message}>Cargando amigos...</p>
        )}

        {error && (
          <p className={styles.error}>{error}</p>
        )}

        {!loading && !error && myFriends.length === 0 && (
          <p className={styles.message}>
            Aún no tienes amigos agregados en SocialUni.
          </p>
        )}

        {!loading && !error && myFriends.length > 0 && (
          <ul className={styles.list}>
            {myFriends.map(friendUid => (
              <li key={friendUid} className={styles.item}>
                <div className={styles.info}>
                  <div className={styles.avatar}>
                    {friendUid.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.texts}>
                    <span className={styles.uidLabel}>
                      UID:
                    </span>
                    <span className={styles.uidValue}>
                      {friendUid}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/profile/${friendUid}`}
                  className={styles.profileLink}
                >
                  Ver perfil
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Friends
