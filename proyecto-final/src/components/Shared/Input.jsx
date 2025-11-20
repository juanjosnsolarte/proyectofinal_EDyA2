import styles from '../../styles/shared/input.module.scss'

function Input({ type = 'text', ...rest }) {
  return <input className={styles.input} type={type} {...rest} />
}

export default Input
