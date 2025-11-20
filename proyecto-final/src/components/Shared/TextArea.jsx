import styles from '../../styles/shared/textarea.module.scss'

function TextArea({ rows = 3, ...rest }) {
  return <textarea className={styles.textarea} rows={rows} {...rest} />
}

export default TextArea
