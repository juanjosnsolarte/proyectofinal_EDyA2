import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import styles from '../styles/pages/createPost.module.scss'

const POST_TYPES = [
  { value: 'duda', label: 'Duda' },
  { value: 'apoyo', label: 'Consejo / Apoyo' },
  { value: 'experiencia', label: 'Experiencia' },
]

function CreatePost() {
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const [postType, setPostType] = useState('duda')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handlePublish = async (event) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || !user) return

    try {
      setIsSaving(true)

      await addDoc(collection(db, 'posts'), {
        uid: user.uid,
        authorName: user.name,
        career: user.career,
        semester: user.semester,
        type: postType,
        text: trimmed,
        createdAt: serverTimestamp(),
      })

      setContent('')
      setPostType('duda')

      navigate('/feed')
    } catch (error) {
      console.error('Error al crear la publicación:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>Crear nueva publicación</h2>

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
            placeholder={
              postType === 'duda'
                ? 'Ej: No entiendo bien física, ¿alguien tiene tips para estudiar mejor?'
                : postType === 'apoyo'
                  ? 'Ej: Hola, para quienes estén viendo Ingeniería de Software, les recomiendo...'
                  : 'Ej: Quiero contar mi experiencia en mi primer semestre...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

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
