import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TreeNode from '../../utils/structures/TreeNode'
import styles from '../../styles/layout/Sidebar.module.scss'

function buildMenuTree(user) {
  const root = new TreeNode('root')

  const inicio = new TreeNode('Inicio', '/feed')

  let profilePath = '/profile/me'
  if (user?.uid) {
    profilePath = `/profile/${user.uid}`
  }
  const miPerfil = new TreeNode('Mi Perfil', profilePath)

  const amigos = new TreeNode('Mis Amigos', '/friends')
  const chat = new TreeNode('Mis Chat', '/chat')

  root.addChild(inicio)
  root.addChild(miPerfil)
  root.addChild(amigos)
  root.addChild(chat)

  return root
}

function Sidebar() {
  const { user } = useSelector(state => state.auth)

  const menuTree = useMemo(() => buildMenuTree(user), [user])

  const renderNode = (node) => {
    if (node.label === 'root') {
      return node.children.map(child => renderNode(child))
    }

    return (
      <li key={node.label} className={styles.item}>
        <NavLink
          to={node.path}
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ''}`
          }
        >
          {node.label}
        </NavLink>
      </li>
    )
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.userBox}>
        <div className={styles.avatar}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user?.name || 'Estudiante'}
          </span>
          {user?.career && (
            <span className={styles.userCareer}>{user.career}</span>
          )}
        </div>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.list}>
          {renderNode(menuTree)}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar