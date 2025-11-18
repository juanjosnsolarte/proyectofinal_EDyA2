import ThemeToggle from '../Shared/ThemeToggle'
import styles from '../../styles/layout/Header.module.scss'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className={styles.header}>
      <Link to="/feed" className={styles.title}>
        SocialUni
      </Link>

      <div className={styles.actions}>
        <ThemeToggle />
      </div>
    </header>
  )
}

export default Header
