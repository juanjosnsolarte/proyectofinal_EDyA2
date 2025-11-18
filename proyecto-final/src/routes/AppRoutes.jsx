import { Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Feed from '../pages/Feed'
import Profile from '../pages/Profile'
import NotFound from '../pages/NotFound'
import Layout from '../components/Layout/Layout'


export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route 
        path="/feed" 
        element={
          <Layout>
            <Feed />
          </Layout>
        } 
      />

      <Route 
        path="/profile/:id" 
        element={
          <Layout>
            <Profile />
          </Layout>
        } 
      />

      <Route 
        path="*" 
        element={
          <NotFound />
        } 
      />
    </Routes>
  )
}
