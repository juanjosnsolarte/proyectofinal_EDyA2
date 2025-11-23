import { useEffect, useMemo, useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchPosts } from '../store/slices/posts/postThunks'
import AddComment from '../components/Comments/AddComment'
import CommentList from '../components/Comments/CommentList'
import styles from '../styles/pages/feed.module.scss'

function Feed() {
  const dispatch = useDispatch()

  const { user } = useSelector((state) => state.auth)
  const { posts, loading, errorMessage } = useSelector((state) => state.posts)

  const [filter, setFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchPosts())
  }, [dispatch])

  const filteredPosts = useMemo(() => {
    if (!posts || posts.length === 0) return []

    if (filter === 'all') return posts

    return posts.filter((post) => post.tipo === filter)
  }, [posts, filter])

  const getTypeLabel = useCallback((type) => {
    if (type === 'duda') return 'DUDA'
    if (type === 'apoyo') return 'CONSEJO / APOYO'
    if (type === 'experiencia') return 'EXPERIENCIA'
    return type?.toUpperCase() || 'PUBLICACIÓN'
  }, [])

  const handlePostClick = useCallback((post) => {
    console.log('Post visitado:', post.id)
  }, [])

  const filters = [
    { id: 'all', label: 'Todas' },
    { id: 'duda', label: 'Dudas' },
    { id: 'apoyo', label: 'Consejos / Apoyos' },
    { id: 'experiencia', label: 'Experiencias' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <h2 className={styles.title}>Feed de Publicaciones</h2>

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '0.25rem 0.9rem',
                  borderRadius: '999px',
                  border:
                    filter === f.id
                      ? '1px solid transparent'
                      : '1px solid rgba(255,255,255,0.2)',
                  background:
                    filter === f.id ? 'var(--primary)' : 'transparent',
                  color: filter === f.id ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-out',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Link to="/create-post" className={styles.createButton}>
            Crear publicación
          </Link>
        </div>

        <section className={styles.postsList}>
          {loading && (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>
              Cargando publicaciones...
            </p>
          )}

          {!loading && errorMessage && (
            <p style={{ textAlign: 'center', opacity: 0.7, color: '#f87171' }}>
              {errorMessage}
            </p>
          )}

          {!loading && !errorMessage && filteredPosts.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>
              No hay publicaciones para este filtro
              {user?.name ? `, ${user.name}` : ''}.
            </p>
          )}

          {filteredPosts.map((post) => {
            const initials =
              post.autorNombre
                ?.split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0].toUpperCase())
                .join('') || 'U'

            const profileLink = post.usuarioId
              ? `/profile/${post.usuarioId}`
              : '#'

            return (
              <article
                key={post.id}
                className={styles.postCard}
                onClick={() => handlePostClick(post)}
              >
                <div className={styles.postHeader}>
                  <Link
                    to={profileLink}
                    className={styles.authorLink}
                    onClick={(e) => {
                      if (!post.usuarioId) e.preventDefault()
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background:
                          'linear-gradient(135deg, #a855f7, #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className={styles.postAuthor}>
                        {post.autorNombre || 'Estudiante'}
                      </div>
                      <div className={styles.postMeta}>
                        {post.carrera && <span>{post.carrera}</span>}
                        {post.carrera && post.semestre && <span> · </span>}
                        {post.semestre && (
                          <span>Semestre {post.semestre}</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <span
                    className={`${styles.postType} ${styles[post.tipo]}`}
                  >
                    {getTypeLabel(post.tipo)}
                  </span>
                </div>

                <p className={styles.postBody}>{post.contenido}</p>

                <div className={styles.commentsSection}>
                  <CommentList postId={post.id} />
                  <AddComment postId={post.id} />
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </div>
  )
}

export default Feed