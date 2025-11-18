import styles from '../../styles/layout/Layout.module.scss'
import Header from './Header'
import Sidebar from './Sidebar'

function Layout({ children }) {
  return (
    <div>
      <Header />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <Sidebar />
        </aside>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
