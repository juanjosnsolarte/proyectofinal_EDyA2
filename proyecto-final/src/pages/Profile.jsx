import { useEffect, useMemo, useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import styles from '../styles/pages/profile.module.scss'
import Button from '../components/Shared/Button'
import Card from '../components/Shared/Card'
import {
  fetchFriends,
  removeFriendship,
  fetchFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../store/slices/friends/friendsThunks'
import { deleteCurrentUserAccount } from '../store/slices/auth/authThunks'
import { selectPostsByUser } from '../store/selectors/postSelectors'
import { fetchPosts } from '../store/slices/posts/postThunks'
import {
  ensureChat,
  fetchUserChats,
} from '../store/slices/chat/chatThunks'

function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector((state) => state.auth)
  const {
    friendsByUser,
    loading: friendsLoading,
    requests,
  } = useSelector((state) => state.friends)

  const { posts, loading: postsLoading } = useSelector(
    (state) => state.posts
  )

  const [viewedUser, setViewedUser] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState(null)

  const requestsLoading = requests?.loading || false
  const incomingRequests = requests?.incoming || []
  const outgoingRequests = requests?.outgoing || []

  useEffect(() => {
    if (!user) return
    if (postsLoading) return
    if (posts && posts.length > 0) return

    dispatch(fetchPosts())
  }, [dispatch, user, postsLoading, posts.length])

  // Cargar info del perfil (propio u otro usuario)
  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      if (!user) {
        if (isMounted) {
          setViewedUser(null)
          setLoadingProfile(false)
          setProfileError('No hay usuario autenticado.')
        }
        return
      }

      setLoadingProfile(true)
      setProfileError(null)

      try {
        let targetUser = null

        if (id === 'me' || id === user.uid) {
          targetUser = user
        } else {
          const ref = doc(db, 'users', id)
          const snap = await getDoc(ref)

          if (snap.exists()) {
            targetUser = { uid: id, ...snap.data() }
          } else {
            targetUser = null
            if (isMounted) {
              setProfileError('El usuario no existe.')
            }
          }
        }

        if (isMounted) {
          setViewedUser(targetUser)
        }
      } catch (error) {
        console.error('Error cargando perfil:', error)
        if (isMounted) {
          setProfileError('No se pudo cargar el perfil.')
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false)
        }
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [id, user])

  // Cargar amigos y solicitudes del usuario logueado
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchFriends(user.uid))
      dispatch(fetchFriendRequests(user.uid))
    }
  }, [dispatch, user?.uid])

  const isOwnProfile = useMemo(() => {
    if (!user || !viewedUser) return false
    return viewedUser.uid === user.uid
  }, [user, viewedUser])

  const myFriends = user ? friendsByUser[user.uid] || [] : []
  const viewedUserFriends =
    viewedUser && viewedUser.uid ? friendsByUser[viewedUser.uid] || [] : []

  const isFriend = useMemo(() => {
    if (!user || !viewedUser || viewedUser.uid === user.uid) return false
    return myFriends.includes(viewedUser.uid)
  }, [user, viewedUser, myFriends])

  const hasOutgoingRequest = useMemo(() => {
    if (!user || !viewedUser) return false
    return outgoingRequests.some(
      (req) => req.toUid === viewedUser.uid && req.fromUid === user.uid
    )
  }, [user, viewedUser, outgoingRequests])

  const incomingRequestFromViewedUser = useMemo(() => {
    if (!user || !viewedUser) return null
    return (
      incomingRequests.find(
        (req) => req.fromUid === viewedUser.uid && req.toUid === user.uid
      ) || null
    )
  }, [user, viewedUser, incomingRequests])

  const viewedUserIdForPosts =
    viewedUser?.uid || (id === 'me' ? user?.uid : id)

  const userPosts = useSelector(
    selectPostsByUser(viewedUserIdForPosts || '')
  )
  const postsCount = userPosts.length
  const friendsCount = viewedUserFriends.length

  const personalInfo = useMemo(
    () => [
      { label: 'Nombre', value: viewedUser?.name },
      { label: 'Correo', value: viewedUser?.email },
      { label: 'Edad', value: viewedUser?.age },
      { label: 'Universidad', value: viewedUser?.university },
      { label: 'Carrera', value: viewedUser?.career },
      { label: 'Semestre', value: viewedUser?.semester },
    ],
    [viewedUser]
  )

  const handleEditProfile = useCallback(() => {
    if (!isOwnProfile) return
    navigate('/profile/edit')
  }, [isOwnProfile, navigate])

  const handleDeleteAccount = useCallback(async () => {
    if (!isOwnProfile || !viewedUser) return

    const confirmFirst = window.confirm(
      '¿Seguro que quieres eliminar tu cuenta?\n' +
        'Se borrarán tus publicaciones, comentarios, amistades y chats.\n' +
        'Esta acción NO se puede deshacer.'
    )

    if (!confirmFirst) return

    const password = window.prompt(
      'Por seguridad, escribe tu contraseña actual para confirmar:'
    )

    if (!password) {
      return
    }

    const result = await dispatch(deleteCurrentUserAccount(password))

    if (result?.ok) {
      alert('Tu cuenta ha sido eliminada correctamente.')
    } else if (result?.errorMessage) {
      alert(result.errorMessage)
    }
  }, [dispatch, isOwnProfile, viewedUser])

  const handleSendFriendRequest = useCallback(async () => {
    if (!user || !viewedUser) return

    const result = await dispatch(
      sendFriendRequest(user.uid, viewedUser.uid)
    )

    if (!result?.ok && result?.errorMessage) {
      alert(result.errorMessage)
    }
  }, [dispatch, user, viewedUser])

  const handleRemoveFriend = useCallback(
    async () => {
      if (!user || !viewedUser) return

      const result = await dispatch(
        removeFriendship(user.uid, viewedUser.uid)
      )

      if (result?.ok) {
        dispatch(fetchFriends(user.uid))
        dispatch(fetchFriendRequests(user.uid))
        dispatch(fetchUserChats(user.uid))
      }
    },
    [dispatch, user, viewedUser]
  )

  const handleAcceptRequest = useCallback(async () => {
    if (!user || !viewedUser || !incomingRequestFromViewedUser) return

    const { id: requestId, fromUid, toUid } = incomingRequestFromViewedUser

    const result = await dispatch(
      acceptFriendRequest(requestId, fromUid, toUid)
    )

    if (!result?.ok && result?.errorMessage) {
      alert(result.errorMessage)
    }
  }, [dispatch, user, viewedUser, incomingRequestFromViewedUser])

  const handleRejectRequest = useCallback(async () => {
    if (!user || !incomingRequestFromViewedUser) return

    const { id: requestId } = incomingRequestFromViewedUser

    const result = await dispatch(
      rejectFriendRequest(requestId, user.uid)
    )

    if (!result?.ok && result?.errorMessage) {
      alert(result.errorMessage)
    }
  }, [dispatch, user, incomingRequestFromViewedUser])

  const handleOpenChat = useCallback(async () => {
    if (!user || !viewedUser) return

    const result = await dispatch(
      ensureChat(user.uid, viewedUser.uid)
    )

    if (result?.ok && result.chatId) {
      navigate(`/chats/${result.chatId}`)
    } else if (result?.errorMessage) {
      alert(result.errorMessage)
    }
  }, [dispatch, navigate, user, viewedUser])

  // Render principal
  if (loadingProfile) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!viewedUser) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p>{profileError || 'No se encontró el usuario.'}</p>
        </div>
      </div>
    )
  }

  const firstLetter =
    viewedUser.name?.charAt(0).toUpperCase() ||
    viewedUser.email?.charAt(0).toUpperCase() ||
    'U'

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.header}>
          <div className={styles.avatar}>
            <span>{firstLetter}</span>
          </div>

          <div className={styles.headerMain}>
            <div className={styles.topRow}>
              <h2 className={styles.username}>
                {viewedUser.name || 'Estudiante'}
              </h2>

              {isOwnProfile && (
                <div className={styles.actionsRow}>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleEditProfile}
                  >
                    Editar perfil
                  </Button>

                  <Button
                    variant="danger"
                    type="button"
                    onClick={handleDeleteAccount}
                  >
                    Eliminar cuenta
                  </Button>
                </div>
              )}

              {!isOwnProfile && user && (
                <div className={styles.actionsRow}>
                  {(friendsLoading || requestsLoading) && (
                    <span className={styles.smallText}>
                      Cargando estado de amistad...
                    </span>
                  )}

                  {!friendsLoading &&
                    !requestsLoading &&
                    isFriend && (
                      <>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={handleOpenChat}
                        >
                          Chatear
                        </Button>
                        <Button
                          variant="danger"
                          type="button"
                          onClick={handleRemoveFriend}
                        >
                          Dejar de ser amigos
                        </Button>
                      </>
                    )}

                  {!friendsLoading &&
                    !requestsLoading &&
                    !isFriend &&
                    incomingRequestFromViewedUser && (
                      <>
                        <Button
                          variant="primary"
                          type="button"
                          onClick={handleAcceptRequest}
                        >
                          Aceptar solicitud
                        </Button>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={handleRejectRequest}
                        >
                          Rechazar
                        </Button>
                      </>
                    )}

                  {!friendsLoading &&
                    !requestsLoading &&
                    !isFriend &&
                    !incomingRequestFromViewedUser &&
                    hasOutgoingRequest && (
                      <Button
                        variant="outline"
                        type="button"
                        disabled
                      >
                        Solicitud enviada
                      </Button>
                    )}

                  {!friendsLoading &&
                    !requestsLoading &&
                    !isFriend &&
                    !incomingRequestFromViewedUser &&
                    !hasOutgoingRequest && (
                      <Button
                        variant="primary"
                        type="button"
                        onClick={handleSendFriendRequest}
                      >
                        Volverse Amigos
                      </Button>
                    )}
                </div>
              )}
            </div>

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{postsCount}</span>
                <span className={styles.statLabel}>Publicaciones</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{friendsCount}</span>
                <span className={styles.statLabel}>Amigos</span>
              </div>
            </div>

            <div className={styles.bioRow}>
              {viewedUser.university && (
                <p className={styles.bioLine}>{viewedUser.university}</p>
              )}
              {viewedUser.career && (
                <p className={styles.bioLine}>{viewedUser.career}</p>
              )}
              {viewedUser.semester && (
                <p className={styles.bioLine}>
                  Semestre {viewedUser.semester}
                </p>
              )}
            </div>
          </div>
        </section>

        <Card>
          <h3 className={styles.sectionTitle}>Información personal</h3>

          <ul className={styles.infoList}>
            {personalInfo.map(
              (item) =>
                item.value !== undefined &&
                item.value !== null &&
                item.value !== '' && (
                  <li key={item.label}>
                    <strong>{item.label}:</strong> {item.value}
                  </li>
                )
            )}
          </ul>
        </Card>

        <Card>
          <h3 className={styles.sectionTitle}>
            {isOwnProfile ? 'Mis publicaciones' : 'Sus publicaciones'}
          </h3>

          {postsLoading && postsCount === 0 && (
            <p className={styles.emptyPosts}>
              Cargando publicaciones...
            </p>
          )}

          {!postsLoading && postsCount === 0 ? (
            <p className={styles.emptyPosts}>
              {isOwnProfile
                ? 'Aún no has publicado nada.'
                : 'Este usuario aún no ha publicado nada.'}
            </p>
          ) : (
            !postsLoading && (
              <div className={styles.postsGrid}>
                {userPosts.map((post) => (
                  <article key={post.id} className={styles.postCard}>
                    <div className={styles.postHeaderRow}>
                      <span
                        className={`${styles.postType} ${styles[post.tipo]}`}
                      >
                        {post.tipo === 'duda'
                          ? 'DUDA'
                          : post.tipo === 'apoyo'
                          ? 'CONSEJO / APOYO'
                          : post.tipo === 'experiencia'
                          ? 'EXPERIENCIA'
                          : 'PUBLICACIÓN'}
                      </span>
                      {post.fecha && (
                        <span className={styles.postDate}>
                          {new Date(post.fecha).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <p className={styles.postText}>{post.contenido}</p>
                  </article>
                ))}
              </div>
            )
          )}
        </Card>
      </div>
    </div>
  )
}

export default Profile