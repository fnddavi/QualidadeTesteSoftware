import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { ContactList } from './pages/ContactList';
import { ContactForm } from './pages/ContactForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Rotas de Contatos */}
        <Route path="/contacts" element={<ContactList />} />
        <Route path="/contacts/new" element={<ContactForm />} />
        <Route path="/contacts/edit/:id" element={<ContactForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;