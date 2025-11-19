import styles from '../../styles/components/loading.module.scss'

function Loading() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.text}>Cargando...</h1>
    </div>
  )
}

export default Loading
