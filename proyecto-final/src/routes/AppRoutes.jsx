import { Routes, Route } from 'react-router-dom'

import Login from '../pages/Login'
import Register from '../pages/Register'
import Feed from '../pages/Feed'
import Profile from '../pages/Profile'
import NotFound from '../pages/NotFound'
import CreatePost from '../pages/CreatePost'
import Friends from '../pages/Friends'
import Layout from '../components/Layout/Layout'
import PrivateRoute from './guards/PrivateRoute'
import PublicRoute from './guards/PublicRoute'

export const AppRoutes = () => {
  return (
    <Routes>

      {/* Rutas Publicas */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />


      {/* Rutas Privadas */}
      
      <Route
        path="/feed"
        element={
          <PrivateRoute>
            <Layout>
              <Feed />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/friends"
        element={
          <PrivateRoute>
            <Layout>
              <Friends />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/profile/:id"
        element={
          <PrivateRoute>
            <Layout>
              <Profile />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/create-post"
        element={
          <PrivateRoute>
            <Layout>
              <CreatePost />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Error 404 - Página no encontrada */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}