import React from 'react'
import ProtectedRoute from './components/ProtectedRoute'


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/contacts" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />


      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <Contacts />
          </ProtectedRoute>
        }
      />


      <Route
        path="/contacts/new"
        element={
          <ProtectedRoute>
            <NewContact />
          </ProtectedRoute>
        }
      />


      <Route
        path="/contacts/edit"
        element={
          <ProtectedRoute>
            <EditContact />
          </ProtectedRoute>
        }
      />


    </Routes>
  )
}