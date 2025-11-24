import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import styles from '../styles/pages/Chats.module.scss'
import {
  fetchUserChats,
  fetchMessagesForChat,
  sendMessage,
} from '../store/slices/chat/chatThunks'

function Chats() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { chatId } = useParams()

  const { user } = useSelector((state) => state.auth)
  const {
    chats,
    messagesByChat,
    loadingChats,
    loadingMessages,
    sendingMessage,
  } = useSelector((state) => state.chat)

  const [profiles, setProfiles] = useState({})
  const [messageText, setMessageText] = useState('')

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserChats(user.uid))
    }
  }, [dispatch, user?.uid])

  useEffect(() => {
    if (chatId) {
      dispatch(fetchMessagesForChat(chatId))
    }
  }, [dispatch, chatId])

  useEffect(() => {
    if (!chatId && chats.length > 0) {
      navigate(`/chats/${chats[0].id}`, { replace: true })
    }
  }, [chatId, chats, navigate])

  const activeChat = useMemo(
    () => chats.find((c) => c.id === chatId) || null,
    [chats, chatId]
  )

  const activeMessages = useMemo(
    () => (chatId ? messagesByChat[chatId] || [] : []),
    [messagesByChat, chatId]
  )

  useEffect(() => {
    const loadProfiles = async () => {
      if (!user?.uid || chats.length === 0) {
        setProfiles({})
        return
      }

      const uids = new Set()

      chats.forEach((chat) => {
        ;(chat.participants || []).forEach((uid) => {
          if (uid !== user.uid) {
            uids.add(uid)
          }
        })
      })

      if (uids.size === 0) {
        setProfiles({})
        return
      }

      const map = {}

      for (const uid of uids) {
        try {
          const snap = await getDoc(doc(db, 'users', uid))
          if (snap.exists()) {
            map[uid] = { uid, ...snap.data() }
          }
        } catch (error) {
          console.error('Error cargando perfil de chat:', error)
        }
      }

      setProfiles(map)
    }

    loadProfiles()
  }, [chats, user?.uid])

  const getOtherUserInfo = useCallback(
    (chat) => {
      if (!chat || !user) return { uid: null, name: '', initials: '?' }

      const otherUid =
        (chat.participants || []).find((uid) => uid !== user.uid) ||
        null

      const profile = otherUid ? profiles[otherUid] : null

      const name =
        profile?.name || profile?.email || 'Estudiante sin nombre'

      const initials =
        name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0].toUpperCase())
          .join('') || 'U'

      return { uid: otherUid, name, initials }
    },
    [profiles, user]
  )

  const handleSelectChat = useCallback(
    (id) => {
      navigate(`/chats/${id}`)
    },
    [navigate]
  )

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!chatId || !user?.uid || !messageText.trim()) return

      const text = messageText.trim()
      setMessageText('')

      const result = await dispatch(
        sendMessage(chatId, user.uid, text)
      )

      if (!result?.ok && result?.errorMessage) {
        alert(result.errorMessage)
      }
    },
    [dispatch, chatId, user, messageText]
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

  const headerInfo = activeChat
    ? getOtherUserInfo(activeChat)
    : { name: '', initials: '?' }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.chatLayout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2>Mis chats</h2>
            </div>

            {loadingChats && (
              <p className={styles.smallText}>
                Cargando tus chats...
              </p>
            )}

            {!loadingChats && chats.length === 0 && (
              <p className={styles.smallText}>
                Aún no tienes chats. Ve al perfil de un amigo y
                presiona <strong>Chatear</strong> para iniciar uno.
              </p>
            )}

            <ul className={styles.chatList}>
              {chats.map((chat) => {
                const { name, initials } = getOtherUserInfo(chat)
                const isActive = chat.id === chatId

                return (
                  <li
                    key={chat.id}
                    className={`${styles.chatListItem} ${
                      isActive ? styles.chatListItemActive : ''
                    }`}
                    onClick={() => handleSelectChat(chat.id)}
                  >
                    <div className={styles.chatAvatar}>
                      <span>{initials}</span>
                    </div>
                    <div className={styles.chatInfo}>
                      <span className={styles.chatName}>{name}</span>
                      {chat.lastMessage && (
                        <span className={styles.chatLastMessage}>
                          {chat.lastMessage.length > 40
                            ? `${chat.lastMessage.slice(0, 40)}...`
                            : chat.lastMessage}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </aside>

          <section className={styles.chatWindow}>
            {!activeChat ? (
              <div className={styles.emptyState}>
                <p>
                  Selecciona un chat en la izquierda o inicia uno
                  nuevo desde el perfil de un amigo.
                </p>
              </div>
            ) : (
              <>
                <header className={styles.chatHeader}>
                  <div className={styles.chatHeaderInfo}>
                    <div className={styles.chatHeaderAvatar}>
                      <span>{headerInfo.initials}</span>
                    </div>
                    <div>
                      <h3 className={styles.chatHeaderName}>
                        {headerInfo.name}
                      </h3>
                    </div>
                  </div>
                </header>

                <div className={styles.messagesContainer}>
                  {loadingMessages && (
                    <p className={styles.smallText}>
                      Cargando mensajes...
                    </p>
                  )}

                  {!loadingMessages && activeMessages.length === 0 && (
                    <p className={styles.smallText}>
                      Aún no hay mensajes en este chat.
                    </p>
                  )}

                  {activeMessages.map((msg) => {
                    const isMine = msg.senderId === user.uid
                    return (
                      <div
                        key={msg.id}
                        className={`${styles.messageRow} ${
                          isMine
                            ? styles.messageRowMine
                            : styles.messageRowOther
                        }`}
                      >
                        <div className={styles.messageBubble}>
                          <p className={styles.messageText}>
                            {msg.text}
                          </p>
                          {msg.createdAt && (
                            <span className={styles.messageTime}>
                              {new Date(
                                msg.createdAt
                              ).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <form
                  className={styles.messageForm}
                  onSubmit={handleSubmit}
                >
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={sendingMessage}
                  />
                  <button type="submit" disabled={sendingMessage}>
                    Enviar
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Chats