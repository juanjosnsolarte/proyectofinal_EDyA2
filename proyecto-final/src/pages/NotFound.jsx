import { Link } from 'react-router-dom'
import styles from '../styles/pages/Notfound.module.scss'

function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <p className={styles.message}>
          La página que buscas no existe.
        </p>
        <Link to="/feed" className={styles.link}>
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFound
