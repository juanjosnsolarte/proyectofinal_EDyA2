import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Loading from '../../components/UI/Loading'

function PublicRoute({ children }) {
  const { status } = useSelector(state => state.auth)

  if (status === 'checking') {
  return <Loading />
  }

  if (status === 'authenticated') {
    return <Navigate to="/feed" replace />
  }

  return children
}

export default PublicRoute
