import styles from '../../styles/shared/card.module.scss'

function Card({ children, className = '' }) {
  const classes = [styles.card, className].join(' ').trim()

  return <section className={classes}>{children}</section>
}

export default Card
