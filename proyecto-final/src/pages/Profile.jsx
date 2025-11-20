// src/pages/Profile.jsx
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import styles from '../styles/pages/profile.module.scss'

function Profile() {
  const { id } = useParams()
  const { user } = useSelector(state => state.auth)

  const handleEditProfile = () => {
    // Aquí más adelante abriremos un formulario/modal para editar
    console.log('Editar perfil - lógica pendiente')
  }

  const handleDeleteAccount = () => {
    // Falta implementar la lógica de::
    // - Eliminar usuario de Auth
    // - Borrar documentos de Firestore: users, posts, relaciones, chats, etc.
    // - Cerrar sesión y redirigir al login
    console.log('Eliminar cuenta - lógica pendiente')
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>Mi Perfil</h2>

        <section className={styles.card}>
          <h3 className={styles.sectionTitle}>Información personal</h3>

          <ul className={styles.infoList}>
            <li><strong>Nombre:</strong> {user?.name}</li>
            <li><strong>Correo:</strong> {user?.email}</li>
            <li><strong>Edad:</strong> {user?.age}</li>
            <li><strong>Universidad:</strong> {user?.university}</li>
            <li><strong>Carrera:</strong> {user?.career}</li>
            <li><strong>Semestre:</strong> {user?.semester}</li>
          </ul>

          <div className={styles.buttonsRow}>
            <button
              type="button"
              className={styles.editBtn}
              onClick={handleEditProfile}
            >
              Editar perfil
            </button>

            <button
              type="button"
              className={styles.deleteBtn}
              onClick={handleDeleteAccount}
            >
              Eliminar cuenta
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.sectionTitle}>Mis publicaciones</h3>

          <div className={styles.futureBlock}>
            (Pronto podrás ver tus publicaciones aquí)
          </div>
        </section>
      </div>
    </div>
  )
}

export default Profile
