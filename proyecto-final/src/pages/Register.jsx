import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import styles from '../styles/pages/register.module.scss'
import { registerWithEmailPassword } from '../store/slices/auth/authThunks'
import Input from '../components/Shared/Input'
import Button from '../components/Shared/Button'

const onlyLettersRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
const onlyNumbersRegex = /^[0-9]+$/

function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { status, errorMessage } = useSelector(state => state.auth)
  const isChecking = status === 'checking'

  const [formState, setFormState] = useState({
    name: '',
    age: '',
    university: '',
    career: '',
    semester: '',
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

    if (!formState.name.trim() || !onlyLettersRegex.test(formState.name.trim())) {
      newErrors.name = 'El nombre solo puede contener letras.'
    }

    if (formState.university.trim() && !onlyLettersRegex.test(formState.university.trim())) {
      newErrors.university = 'La universidad solo puede contener letras.'
    }

    if (formState.career.trim() && !onlyLettersRegex.test(formState.career.trim())) {
      newErrors.career = 'La carrera solo puede contener letras.'
    }

    if (formState.semester.trim() && !onlyNumbersRegex.test(formState.semester.trim())) {
      newErrors.semester = 'El semestre debe ser un número.'
    }

    if (!formState.age.trim() || !onlyNumbersRegex.test(formState.age.trim())) {
      newErrors.age = 'La edad debe ser un número.'
    } else if (parseInt(formState.age, 10) < 16) {
      newErrors.age = 'Debes tener al menos 16 años para registrarte.'
    }

    if (!formState.email.trim()) {
      newErrors.email = 'El correo es obligatorio.'
    }
    if (!formState.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    const isValid = validateForm()
    if (!isValid) return

    const result = await dispatch(
      registerWithEmailPassword({
        email: formState.email,
        password: formState.password,
        name: formState.name,
        career: formState.career,
        semester: formState.semester,
        university: formState.university,
        age: formState.age,
      })
    )

    if (result && result.ok) {
      navigate('/login')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>Registro de Cuenta</h2>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="name">Nombre completo</label>
            <Input
              id="name"
              name="name"
              value={formState.name}
              onChange={onInputChange}
              required
            />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="age">Edad</label>
            <Input
              id="age"
              name="age"
              type="number"
              value={formState.age}
              onChange={onInputChange}
              required
            />
            {errors.age && <p className={styles.error}>{errors.age}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="university">Universidad</label>
            <Input
              id="university"
              name="university"
              value={formState.university}
              onChange={onInputChange}
            />
            {errors.university && <p className={styles.error}>{errors.university}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="career">Carrera</label>
            <Input
              id="career"
              name="career"
              value={formState.career}
              onChange={onInputChange}
            />
            {errors.career && <p className={styles.error}>{errors.career}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="semester">Semestre</label>
            <Input
              id="semester"
              name="semester"
              value={formState.semester}
              onChange={onInputChange}
            />
            {errors.semester && <p className={styles.error}>{errors.semester}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">Correo</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={onInputChange}
              required
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
              required
            />
            {errors.password && <p className={styles.error}>{errors.password}</p>}
          </div>

          <div className={styles.actions}>
            <Button type="submit" disabled={isChecking} fullWidth>
              {isChecking ? 'Creando cuenta...' : 'Registrarme'}
            </Button>

            <span style={{ fontSize: '0.9rem' }}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login">Inicia sesión aquí</Link>
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

export default Register