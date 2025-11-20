import styles from '../../styles/shared/button.module.scss'

function Button({
  children,
  variant = 'primary', // 'primary' | 'outline' | 'danger'
  fullWidth = false,
  type = 'button',
  ...rest
}) {
  const classes = [
    styles.button,
    styles[variant] || '',
    fullWidth ? styles.fullWidth : '',
  ]
    .join(' ')
    .trim()

  return (
    <button className={classes} type={type} {...rest}>
      {children}
    </button>
  )
}

export default Button
