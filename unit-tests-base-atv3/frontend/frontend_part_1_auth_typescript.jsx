# Project: Contacts Frontend (Part 1 — Auth) - React + Vite + TypeScript

This file collection contains the initial frontend part you requested: authentication flow (Login + Register), AuthContext, Axios API helper with JWT interceptor, ProtectedRoute, basic CSS, and project configs — all using TypeScript and simple CSS.

---

// File: package.json
{
  "name": "contacts-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.12.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^5.1.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/react-router-dom": "^5.3.3"
  }
}

---

// File: tsconfig.json
{
  "compilerOptions": {
    "target": "ES2021",
    "useDefineForClassFields": true,
    "lib": ["DOM", "ES2021"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}

---

// File: index.html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Contacts Frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

---

// File: src/main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

---

// File: src/App.tsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Contacts from './pages/Contacts'
import NewContact from './pages/NewContact'
import EditContact from './pages/EditContact'
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

---

// File: src/api/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para incluir o token JWT em requisições protegidas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

---

// File: src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

type User = {
  id: number
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('jwt_token')
    if (saved) {
      setToken(saved)
      // opcional: buscar dados do usuário com o token
      // api.get('/users/me')...
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/users/login', { email, password })
    const jwt = res.data.token
    localStorage.setItem('jwt_token', jwt)
    setToken(jwt)
    // opcional: setUser(res.data.user)
    navigate('/contacts')
  }

  const register = async (name: string, email: string, password: string) => {
    await api.post('/users/register', { name, email, password })
    // após registro, redireciona para login
    navigate('/login')
  }

  const logout = () => {
    localStorage.removeItem('jwt_token')
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

---

// File: src/hooks/useAuth.tsx
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export default function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

---

// File: src/components/ProtectedRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth()
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default ProtectedRoute

---

// File: src/pages/Login.tsx
import React, { useState } from 'react'
import useAuth from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function Login() {
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await auth.login(email, password)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro no login')
    }
  }

  return (
    <div className="page auth-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit">Entrar</button>
      </form>
      <p>
        Não tem conta? <Link to="/register">Registrar</Link>
      </p>
    </div>
  )
}

---

// File: src/pages/Register.tsx
import React, { useState } from 'react'
import useAuth from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function Register() {
  const auth = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await auth.register(name, email, password)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro no registro')
    }
  }

  return (
    <div className="page auth-page">
      <h1>Registrar</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Nome
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit">Registrar</button>
      </form>
      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  )
}

---

// File: src/pages/Contacts.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Contacts() {
  const auth = useAuth()

  return (
    <div className="page">
      <header className="page-header">
        <h1>Contatos</h1>
        <div>
          <button onClick={() => auth.logout()}>Sair</button>
        </div>
      </header>

      <main>
        <p>Lista de contatos será implementada na próxima parte.</p>
        <Link to="/contacts/new">Criar Novo Contato</Link>
      </main>
    </div>
  )
}

---

// File: src/pages/NewContact.tsx
import React from 'react'

export default function NewContact() {
  return (
    <div className="page">
      <h1>Novo Contato</h1>
      <p>Formulário de criação será implementado na próxima parte.</p>
    </div>
  )
}

---

// File: src/pages/EditContact.tsx
import React from 'react'

export default function EditContact() {
  return (
    <div className="page">
      <h1>Editar Contato</h1>
      <p>Formulário de edição será implementado na próxima parte.</p>
    </div>
  )
}

---

// File: src/utils/validators.ts
export const nameValidator = (name: string) => {
  if (typeof name !== 'string') return false
  const len = name.trim().length
  return len >= 2 && len <= 50
}

export const phoneRegex = /^(\(\d{2}\)|\d{2})\d{4,5}-?\d{4}$/
export const phoneValidator = (phone: string) => phoneRegex.test(phone)

---

// File: src/index.css
:root {
  --bg: #f7f7f7;
  --card: #ffffff;
  --text: #111;
  --accent: #0b6efd;
}

* { box-sizing: border-box; }
html,body,#root { height: 100%; margin: 0; font-family: Arial, sans-serif; background: var(--bg); color: var(--text); }

.page { max-width: 720px; margin: 40px auto; background: var(--card); padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

.page-header { display:flex; justify-content:space-between; align-items:center }

.form { display:flex; flex-direction:column; gap:12px; }
.form label { display:flex; flex-direction:column; font-size:14px; }
.form input { padding:8px; font-size:14px; border:1px solid #ddd; border-radius:4px; }
.form button { padding:10px 14px; border:none; background:var(--accent); color:#fff; border-radius:6px; cursor:pointer }
.error { color: #c92a2a; }

a { color: var(--accent); text-decoration: none }

---

# Notes

- Endpoints used by AuthProvider are `/users/login` and `/users/register` — ajuste se sua API tiver nomes diferentes.
- Variáveis de ambiente: crie um arquivo `.env` com `VITE_API_URL=http://localhost:3000` ou altere conforme seu backend.
- Eu deixei os forms de contatos como placeholders para a próxima parte (você pediu "por partes"). Na próxima etapa implementarei:
  - Listagem de contatos (GET /)
  - Criação (POST /)
  - Edição (PUT /:id) — levando os dados desde a listagem
  - Exclusão com modal de confirmação

# Como rodar
1. `npm install`
2. `npm run dev`


---

// End of document
