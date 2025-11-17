import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Seu contexto criado
import { PrivateRoute } from './routes/PrivateRoute';
import { Login } from './pages/Login';
import { ContactList } from './pages/ContactList';
import { ContactForm } from './pages/ContactForm';
import { Register } from './pages/Register'; // Se tiver registro

function App() {
  return (
    <BrowserRouter>
      {/* O AuthProvider envolve tudo para fornecer o estado de login */}
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas Privadas (Protegidas) */}
          <Route element={<PrivateRoute />}>
            <Route path="/contacts" element={<ContactList />} />
            <Route path="/contacts/new" element={<ContactForm />} />
            <Route path="/contacts/edit/:id" element={<ContactForm />} />
          </Route>

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/contacts" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;