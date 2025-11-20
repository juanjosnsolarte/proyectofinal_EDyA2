import { useEffect, useRef, useState } from 'react'
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
import Stack from '../utils/structures/Stack'

function Feed() {
  const { user } = useSelector(state => state.auth)

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const postsStackRef = useRef(new Stack())

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
          orderBy('createdAt', 'asc')
        )

        const snapshot = await getDocs(q)
        const stack = postsStackRef.current

        while (!stack.isEmpty()) stack.pop()

        snapshot.forEach((docSnap) => {
          const data = docSnap.data()

          stack.push({
            id: docSnap.id,
            authorName: data.authorName,
            career: data.career,
            semester: data.semester,
            type: data.type,
            text: data.text,
            createdAt: data.createdAt,
          })
        })

        console.log("PILA DE PUBLICACIONES (bottom -> top):")
        stack.print()

        setPosts(stack.toArrayFromTop())
      } catch (error) {
        console.error("Error cargando publicaciones:", error)
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
              Aún no hay publicaciones. Sé el primero en compartir algo, {user?.name}.
            </p>
          )}

          {posts.map((post) => (
            <article
              key={post.id}
              className={styles.postCard}
            >
              <div className={styles.postHeader}>
                <div>
                  <div className={styles.postAuthor}>
                    {post.authorName}
                  </div>
                  <div className={styles.postMeta}>
                    {post.career && <span>{post.career}</span>}
                    {post.career && post.semester && <span> · </span>}
                    {post.semester && <span>Semestre {post.semester}</span>}
                  </div>
                </div>

                <span className={`${styles.postType} ${styles[post.type]}`}>
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