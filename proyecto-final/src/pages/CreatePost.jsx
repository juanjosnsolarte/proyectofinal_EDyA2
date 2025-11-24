import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/pages/CreatePost.module.scss'
import { createPost } from '../store/slices/posts/postThunks'

const POST_TYPES = [
  { value: 'duda', label: 'Duda' },
  { value: 'apoyo', label: 'Consejo / Apoyo' },
  { value: 'experiencia', label: 'Experiencia' },
]

function CreatePost() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [postType, setPostType] = useState('apoyo')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const handlePublish = async (event) => {
    event.preventDefault()
    setError(null)

    const trimmed = content.trim()
    if (!trimmed) {
      setError('Escribe algo para publicar.')
      return
    }

    if (!user) {
      setError('Debes iniciar sesión para publicar.')
      return
    }

    try {
      setIsSaving(true)

      const postData = {
        tipo: postType,
        contenido: trimmed,
        usuarioId: user.uid,
        autorNombre: user.name,
        carrera: user.career,
        semestre: user.semester,
      }

      const { ok, errorMessage } = await dispatch(createPost(postData))

      if (!ok) {
        setError(errorMessage || 'No se pudo crear la publicación.')
        return
      }

      setContent('')
      setPostType('apoyo')

      navigate('/feed')
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error al crear la publicación.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>Crear publicación</h2>

        <section className={styles.card}>
          <div className={styles.header}>
            <span className={styles.subtitle}>
              ¿Qué quieres compartir hoy, {user?.name || 'estudiante'}?
            </span>

            <select
              className={styles.selectType}
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
            >
              {POST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            className={styles.textarea}
            placeholder="Ej: Quiero contar mi experiencia o pedir un consejo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => navigate('/feed')}
              disabled={isSaving}
            >
              Cancelar
            </button>

            <button
              className={styles.publishBtn}
              type="button"
              onClick={handlePublish}
              disabled={!content.trim() || isSaving}
            >
              {isSaving ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CreatePost
