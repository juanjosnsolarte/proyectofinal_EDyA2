import { useEffect, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import styles from '../styles/pages/profile.module.scss'
import Button from '../components/Shared/Button'
import Card from '../components/Shared/Card'

function Profile() {
  const { id } = useParams()
  const { user } = useSelector(state => state.auth)

  const isOwnProfile = useMemo(() => {
    if (!user) return false
    return id === 'me' || id === user.uid
  }, [id, user])

  const personalInfo = useMemo(
    () => [
      { label: 'Nombre', value: user?.name },
      { label: 'Correo', value: user?.email },
      { label: 'Edad', value: user?.age },
      { label: 'Universidad', value: user?.university },
      { label: 'Carrera', value: user?.career },
      { label: 'Semestre', value: user?.semester },
    ],
    [user]
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleEditProfile = useCallback(() => {
    console.log('Editar perfil - lógica pendiente', {
      uid: user?.uid,
      isOwnProfile,
    })
  }, [user?.uid, isOwnProfile])

  const handleDeleteAccount = useCallback(() => {
    console.log('Eliminar cuenta - lógica pendiente', {
      uid: user?.uid,
      email: user?.email,
    })
  }, [user?.uid, user?.email])

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>Mi Perfil</h2>

        <Card>
          <h3 className={styles.sectionTitle}>Información personal</h3>

          <ul className={styles.infoList}>
            {personalInfo.map(
              (item) =>
                item.value !== undefined &&
                item.value !== null &&
                item.value !== '' && (
                  <li key={item.label}>
                    <strong>{item.label}:</strong> {item.value}
                  </li>
                )
            )}
          </ul>

          {isOwnProfile && (
            <div className={styles.buttonsRow}>
              <Button
                variant="primary"
                type="button"
                onClick={handleEditProfile}
              >
                Editar perfil
              </Button>

              <Button
                variant="danger"
                type="button"
                onClick={handleDeleteAccount}
              >
                Eliminar cuenta
              </Button>
            </div>
          )}
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