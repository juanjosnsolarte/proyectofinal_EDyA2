import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/pages/Register.module.scss'
import Input from '../components/Shared/Input'
import Button from '../components/Shared/Button'
import { updateProfileData } from '../store/slices/auth/authThunks'

const onlyLettersRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
const onlyNumbersRegex = /^[0-9]+$/

function EditProfile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, status } = useSelector((state) => state.auth)
  const isChecking = status === 'checking'

  const [formState, setFormState] = useState({
    name: '',
    age: '',
    university: '',
    career: '',
    semester: '',
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [generalError, setGeneralError] = useState(null)

  useEffect(() => {
    if (!user && !isChecking) {
      navigate('/login')
      return
    }

    if (user) {
      setFormState({
        name: user.name || '',
        age: user.age || '',
        university: user.university || '',
        career: user.career || '',
        semester: user.semester || '',
      })
    }
  }, [user, isChecking, navigate])

  const onInputChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }))
    setGeneralError(null)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formState.name.trim() || !onlyLettersRegex.test(formState.name.trim())) {
      newErrors.name = 'El nombre solo puede contener letras.'
    }

    if (
      formState.university.trim() &&
      !onlyLettersRegex.test(formState.university.trim())
    ) {
      newErrors.university = 'La universidad solo puede contener letras.'
    }

    if (
      formState.career.trim() &&
      !onlyLettersRegex.test(formState.career.trim())
    ) {
      newErrors.career = 'La carrera solo puede contener letras.'
    }

    if (
      formState.semester.trim() &&
      !onlyNumbersRegex.test(formState.semester.trim())
    ) {
      newErrors.semester = 'El semestre debe ser un número.'
    }

    if (!formState.age.trim() || !onlyNumbersRegex.test(formState.age.trim())) {
      newErrors.age = 'La edad debe ser un número.'
    } else if (parseInt(formState.age, 10) < 16) {
      newErrors.age = 'Debes tener al menos 16 años.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setGeneralError(null)

    if (!validateForm()) return

    setSaving(true)
    const result = await dispatch(
      updateProfileData({
        name: formState.name.trim(),
        age: formState.age.trim(),
        university: formState.university.trim(),
        career: formState.career.trim(),
        semester: formState.semester.trim(),
      })
    )
    setSaving(false)

    if (!result || !result.ok) {
      setGeneralError(result?.errorMessage || 'No se pudo actualizar el perfil.')
      return
    }

    // Volver a mi perfil con los datos ya actualizados
    navigate('/profile/me')
  }

  const handleCancel = () => {
    navigate('/profile/me')
  }

  if (isChecking && !user) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>Editar perfil</h2>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="name">
              Nombre completo
            </label>
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
            <label className={styles.label} htmlFor="age">
              Edad
            </label>
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
            <label className={styles.label} htmlFor="university">
              Universidad
            </label>
            <Input
              id="university"
              name="university"
              value={formState.university}
              onChange={onInputChange}
            />
            {errors.university && (
              <p className={styles.error}>{errors.university}</p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="career">
              Carrera
            </label>
            <Input
              id="career"
              name="career"
              value={formState.career}
              onChange={onInputChange}
            />
            {errors.career && <p className={styles.error}>{errors.career}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="semester">
              Semestre
            </label>
            <Input
              id="semester"
              name="semester"
              value={formState.semester}
              onChange={onInputChange}
            />
            {errors.semester && (
              <p className={styles.error}>{errors.semester}</p>
            )}
          </div>

          <div className={styles.actions}>
            <Button type="submit" disabled={saving} fullWidth>
              {saving ? 'Guardando cambios...' : 'Guardar cambios'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              fullWidth
            >
              Cancelar
            </Button>

            {generalError && (
              <p className={styles.error}>{generalError}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfile