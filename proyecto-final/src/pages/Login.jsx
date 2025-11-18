import styles from '../styles/pages/login.module.scss'
import ThemeToggle from '../components/Shared/ThemeToggle'

function Login() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Iniciar Sesión</h2>

      <div style={{ marginTop: '1rem' }}>
        <ThemeToggle />
      </div>
    </div>
  )
}

export default Login
