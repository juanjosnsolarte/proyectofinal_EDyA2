import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import styles from '../styles/pages/feed.module.scss'

function Feed() {
  const { user } = useSelector(state => state.auth)

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const getTypeLabel = (type) => {
    if (type === 'duda') return 'Duda'
    if (type === 'apoyo') return 'Consejo / Apoyo'
    return 'Experiencia'
  }

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(q)

        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))

        setPosts(docs)
      } catch (error) {
        console.error('Error cargando publicaciones:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
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

          {!loading && posts.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>
              Aún no hay publicaciones. Sé el primero en compartir algo, {user?.name || 'estudiante'}.
            </p>
          )}

          {posts.map((post) => (
            <article key={post.id} className={styles.postCard}>
              <div className={styles.postHeader}>
                <div>
                  <div className={styles.postAuthor}>
                    {post.authorName || 'Estudiante'}
                  </div>
                  <div className={styles.postMeta}>
                    {post.career && <span>{post.career}</span>}
                    {post.career && post.semester && <span> · </span>}
                    {post.semester && <span>Semestre {post.semester}</span>}
                  </div>
                </div>

                <span
                  className={`${styles.postType} ${styles[post.type]}`}
                >
                  {getTypeLabel(post.type)}
                </span>
              </div>

              <p className={styles.postBody}>{post.text}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default Feed
