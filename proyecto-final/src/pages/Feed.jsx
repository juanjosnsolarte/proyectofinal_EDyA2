// src/pages/Feed.jsx
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
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

  const getTypeLabel = useCallback((type) => {
    if (type === 'duda') return 'Duda'
    if (type === 'apoyo') return 'Consejo / Apoyo'
    return 'Experiencia'
  }, [])

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

        setPosts(stack.toArrayFromTop()) 
      } catch (error) {
        console.error("Error cargando publicaciones:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  const processedPosts = useMemo(() => {
    return posts
  }, [posts])

  const handlePostClick = useCallback((post) => {
    console.log("Post visitado:", post.authorName, post.type)
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
          {loading && <p style={{ textAlign: 'center' }}>Cargando...</p>}

          {!loading && processedPosts.length === 0 && (
            <p style={{ textAlign: 'center' }}>
              Aún no hay publicaciones, {user?.name}.
            </p>
          )}

          {processedPosts.map((post) => (
            <article
              key={post.id}
              className={styles.postCard}
              onClick={() => handlePostClick(post)}
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
