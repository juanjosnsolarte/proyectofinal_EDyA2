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
  const { user } = useSelector((state) => state.auth)

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const postsStackRef = useRef(new Stack())

  const getTypeLabel = useCallback((type) => {
    if (type === 'duda') return 'Duda'
    if (type === 'apoyo') return 'Consejo / Apoyo'
    if (type === 'experiencia') return 'Experiencia'
    return type.toUpperCase()
  }, [])

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          orderBy('fecha', 'asc')
        )

        const snapshot = await getDocs(q)
        const stack = postsStackRef.current

        while (!stack.isEmpty()) stack.pop()

        snapshot.forEach((docSnap) => {
          const data = docSnap.data()

          const autorNombre = data.autorNombre || 'Estudiante'
          const carrera = data.carrera || ''
          const semestre = data.semestre || ''
          const tipo = data.tipo || 'experiencia'
          const contenido = data.contenido || ''
          const fecha = data.fecha || null
          const usuarioId = data.idPublicacion || ''

          stack.push({
            id: docSnap.id,
            autorNombre,
            carrera,
            semestre,
            tipo,
            contenido,
            fecha,
            usuarioId,
          })
        })

        setPosts(stack.toArrayFromTop()) // LIFO
      } catch (error) {
        console.error('Error cargando publicaciones:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  const processedPosts = useMemo(() => posts, [posts])

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
            <p style={{ textAlign: 'center', opacity: 0.7 }}>Cargando publicaciones...</p>
          )}

          {!loading && processedPosts.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>
              No hay publicaciones aún, {user?.name}.
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
                  <div className={styles.postAuthor}>{post.autorNombre}</div>
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
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default Feed