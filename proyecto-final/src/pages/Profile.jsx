import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import styles from '../styles/pages/profile.module.scss'
import Button from '../components/Shared/Button'
import Card from '../components/Shared/Card'

function Profile() {
  const { id } = useParams()
  const { user } = useSelector(state => state.auth)

  const handleEditProfile = () => {
    console.log('Editar perfil - lógica pendiente')
  }

  const handleDeleteAccount = () => {
    console.log('Eliminar cuenta - lógica pendiente')
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>Mi Perfil</h2>

        <Card>
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
            <Button variant="primary" type="button" onClick={handleEditProfile}>
              Editar perfil
            </Button>

            <Button variant="danger" type="button" onClick={handleDeleteAccount}>
              Eliminar cuenta
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className={styles.sectionTitle}>Mis publicaciones</h3>

          <div className={styles.futureBlock}>
            (Pronto podrás ver tus publicaciones aquí)
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Profile