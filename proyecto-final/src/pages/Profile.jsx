import { useParams } from 'react-router-dom'

function Profile() {
  const { id } = useParams()

  return (
    <div>
      <h2>Perfil de Usuario</h2>
      <p>ID: {id}</p>
    </div>
  )
}

export default Profile
