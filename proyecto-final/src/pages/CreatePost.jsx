import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import styles from '../styles/pages/createPost.module.scss'
import TextArea from '../components/Shared/TextArea'
import Button from '../components/Shared/Button'
import Card from '../components/Shared/Card'

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
        tipo: postType,
        contenido: trimmed,
        usuarioId: user.uid,
        autorNombre: user.name,
        carrera: user.career,
        semestre: user.semester,
        fecha: serverTimestamp(),
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

        <Card>
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

          <TextArea
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
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/feed')}
              disabled={isSaving}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handlePublish}
              disabled={!content.trim() || isSaving}
            >
              {isSaving ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CreatePost