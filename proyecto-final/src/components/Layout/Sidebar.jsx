import { Link } from 'react-router-dom'
import styles from '../../styles/layout/Sidebar.module.scss'

function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      <ul>
        <li><Link to="/feed">Inicio</Link></li>
        <li><Link to="/profile/me">Mi Perfil</Link></li>
      </ul>
    </nav>
  )
}

export default Sidebar
