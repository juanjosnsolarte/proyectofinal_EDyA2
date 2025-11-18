import styles from '../styles/pages/Profile.module.scss'
import { useParams } from 'react-router-dom'

function Profile() {
  const { id } = useParams()

  return (
    <div className={styles.container}>
      <h2>Perfil de Usuario</h2>
      <p>ID: {id}</p>
    </div>
  )
}

export default Profile
