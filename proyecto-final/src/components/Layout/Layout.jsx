import Header from './Header'
import Sidebar from './Sidebar'
import styles from '../../styles/layout/Layout.module.scss'

function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Header />

      <div className={styles.body}>
        <Sidebar />

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout