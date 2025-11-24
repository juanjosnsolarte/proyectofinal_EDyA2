import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import styles from '../styles/pages/Login.module.scss'
import { loginWithEmailPassword } from '../store/slices/auth/authThunks'
import Input from '../components/Shared/Input'
import Button from '../components/Shared/Button'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { status, errorMessage, user } = useSelector(state => state.auth)
  const isChecking = status === 'checking'

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})

  const onInputChange = (event) => {
    const { name, value } = event.target
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }))
    setErrors(prev => ({
      ...prev,
      [name]: null,
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formState.email.trim()) {
      newErrors.email = 'El correo es obligatorio.'
    }
    if (!formState.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = (event) => {
    event.preventDefault()
    if (!validateForm()) return

    dispatch(
      loginWithEmailPassword({
        email: formState.email,
        password: formState.password,
      }),
    )
  }

  useEffect(() => {
    if (status === 'authenticated' && user) {
      navigate('/feed')
    }
  }, [status, user, navigate])

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>Iniciar sesión</h2>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">Correo</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={onInputChange}
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formState.password}
              onChange={onInputChange}
            />
            {errors.password && <p className={styles.error}>{errors.password}</p>}
          </div>

          <div className={styles.actions}>
            <Button type="submit" disabled={isChecking} fullWidth>
              {isChecking ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>

            <span className={styles.link}>
              ¿No tienes cuenta?{' '}
              <Link to="/register">Regístrate aquí</Link>
            </span>

            {errorMessage && (
              <p className={styles.error}>{errorMessage}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login