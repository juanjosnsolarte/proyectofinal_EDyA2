import { Link } from 'react-router-dom'
import styles from '../../styles/layout/Header.module.scss'

function Header() {

  return (
    <header className={styles.header}>
      
      <Link to="/feed" className={styles.title}>
        SocialUni
      </Link>

    </header>
  )
}

export default Header
