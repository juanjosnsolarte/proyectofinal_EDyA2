import { useEffect, useMemo, useCallback } from 'react'
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

  useEffect(() => {
    dispatch(fetchPosts())
  }, [dispatch])

  const processedPosts = useMemo(() => posts, [posts])

  const getTypeLabel = useCallback((type) => {
    if (type === 'duda') return 'DUDA'
    if (type === 'apoyo') return 'CONSEJO / APOYO'
    if (type === 'experiencia') return 'EXPERIENCIA'
    return type?.toUpperCase() || 'PUBLICACIÓN'
  }, [])

  const handlePostClick = useCallback((post) => {
    console.log('Post visitado:', post.id)
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <h2 className={styles.title}>Feed de Publicaciones</h2>

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

          {!loading && !errorMessage && processedPosts.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>
              No hay publicaciones todavía
              {user?.name ? `, ${user.name}` : ''}.
            </p>
          )}

          {processedPosts.map((post) => (
            <article
              key={post.id}
              className={styles.postCard}
              onClick={() => handlePostClick(post)}
            >
              <div className={styles.postHeader}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#fff',
                    flexShrink: 0,
                    marginRight: '0.75rem',
                  }}
                >
                  {post.autorNombre
                    ?.split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0].toUpperCase())
                    .join('') || 'U'}
                </div>

                <div style={{ flex: 1 }}>
                  <div className={styles.postAuthor}>
                    {post.autorNombre || 'Estudiante'}
                  </div>
                  <div className={styles.postMeta}>
                    {post.carrera && <span>{post.carrera}</span>}
                    {post.carrera && post.semestre && <span> · </span>}
                    {post.semestre && <span>Semestre {post.semestre}</span>}
                  </div>
                </div>

                <span className={`${styles.postType} ${styles[post.tipo]}`}>
                  {getTypeLabel(post.tipo)}
                </span>
              </div>

              <p className={styles.postBody}>{post.contenido}</p>

              <div className={styles.commentsSection}>
                <CommentList postId={post.id} />
                <AddComment postId={post.id} />
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default Feed