import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import {
  fetchFriends,
  fetchFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../store/slices/friends/friendsThunks'
import styles from '../styles/pages/Friends.module.scss'

function Friends() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { friendsByUser, loading, error, requests } = useSelector(
    (state) => state.friends
  )

  const rawFriends = user ? friendsByUser[user.uid] : undefined
  const rawIncoming = requests?.incoming

  const myFriends = useMemo(
    () => rawFriends || [],
    [rawFriends]
  )

  const incomingRequests = useMemo(
    () => rawIncoming || [],
    [rawIncoming]
  )

  const requestsLoading = requests?.loading || false

  const [profiles, setProfiles] = useState({})
  const [profilesLoading, setProfilesLoading] = useState(false)

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchFriends(user.uid))
      dispatch(fetchFriendRequests(user.uid))
    }
  }, [dispatch, user?.uid])

  useEffect(() => {
    const loadProfiles = async () => {
      if (!user?.uid) return

      const uids = new Set([
        ...myFriends,
        ...incomingRequests.map((req) => req.fromUid),
      ])

      if (uids.size === 0) {
        setProfiles({})
        return
      }

      setProfilesLoading(true)

      const newProfiles = {}

      for (const uid of uids) {
        try {
          const snap = await getDoc(doc(db, 'users', uid))
          if (snap.exists()) {
            newProfiles[uid] = snap.data()
          }
        } catch (err) {
          console.error('Error cargando perfil de amigo:', err)
        }
      }

      setProfiles(newProfiles)
      setProfilesLoading(false)
    }

    loadProfiles()
  }, [user?.uid, myFriends, incomingRequests])

  const hasFriends = myFriends.length > 0

  const friendsWithProfile = useMemo(
    () =>
      myFriends.map((uid) => ({
        uid,
        profile: profiles[uid] || null,
      })),
    [myFriends, profiles]
  )

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

        <section className={styles.section}>
          <h3 className={styles.sectionSubtitle}>
            Solicitudes de amistad
          </h3>

          {requestsLoading && (
            <p className={styles.message}>Cargando solicitudes...</p>
          )}

          {!requestsLoading && incomingRequests.length === 0 && (
            <p className={styles.message}>
              No tienes solicitudes de amistad pendientes.
            </p>
          )}

          {!requestsLoading && incomingRequests.length > 0 && (
            <ul className={styles.requestsList}>
              {incomingRequests.map((req) => {
                const profile = profiles[req.fromUid] || null
                const name =
                  profile?.name || profile?.email || req.fromUid
                const firstLetter =
                  name?.charAt(0).toUpperCase() || 'U'

                const handleAccept = async () => {
                  const result = await dispatch(
                    acceptFriendRequest(req.id, req.fromUid, req.toUid)
                  )
                  if (!result?.ok && result?.errorMessage) {
                    alert(result.errorMessage)
                  }
                }

                const handleReject = async () => {
                  const result = await dispatch(
                    rejectFriendRequest(req.id, user.uid)
                  )
                  if (!result?.ok && result?.errorMessage) {
                    alert(result.errorMessage)
                  }
                }

                return (
                  <li key={req.id} className={styles.requestItem}>
                    <div className={styles.info}>
                      <div className={styles.avatar}>
                        {firstLetter}
                      </div>
                      <div className={styles.texts}>
                        <span className={styles.friendName}>
                          {name}
                        </span>
                        <span className={styles.requestText}>
                          te ha enviado una solicitud de amistad.
                        </span>
                      </div>
                    </div>

                    <div className={styles.requestActions}>
                      <button
                        type="button"
                        className={styles.acceptBtn}
                        onClick={handleAccept}
                      >
                        Aceptar
                      </button>
                      <button
                        type="button"
                        className={styles.rejectBtn}
                        onClick={handleReject}
                      >
                        Rechazar
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionSubtitle}>Mis amigos</h3>

          {loading && (
            <p className={styles.message}>Cargando amigos...</p>
          )}

          {error && <p className={styles.error}>{error}</p>}

          {!loading && !error && !hasFriends && (
            <p className={styles.message}>
              Aún no tienes amigos agregados en SocialUni.
            </p>
          )}

          {!loading && !error && hasFriends && (
            <>
              {profilesLoading && (
                <p className={styles.message}>
                  Cargando información de amigos...
                </p>
              )}

              <ul className={styles.list}>
                {friendsWithProfile.map(({ uid, profile }) => {
                  const name =
                    profile?.name || profile?.email || uid
                  const firstLetter =
                    name?.charAt(0).toUpperCase() || 'U'

                  return (
                    <li key={uid} className={styles.item}>
                      <div className={styles.info}>
                        <div className={styles.avatar}>
                          {firstLetter}
                        </div>
                        <div className={styles.texts}>
                          <span className={styles.friendName}>
                            {name}
                          </span>
                          {profile?.career && (
                            <span className={styles.friendMeta}>
                              {profile.career}
                              {profile.semester && (
                                <> · Semestre {profile.semester}</>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        to={`/profile/${uid}`}
                        className={styles.profileLink}
                      >
                        Ver perfil
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default Friends