import React, { createContext, useState, useEffect, ReactNode } from 'react'
import api from '../services/api'
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
        const saved = localStorage.getItem('token')
        if (saved) {
            setToken(saved)
            // opcional: buscar dados do usuário com o token
            // api.get('/users/me')...
        }
    }, [])

    const login = async (email: string, password: string) => {
        const res = await api.post('/login', { email, password })
        const jwt = res.data.token
        localStorage.setItem('token', jwt)
        setToken(jwt)
        // opcional: setUser(res.data.user)
        navigate('/contacts')
    }

    const register = async (name: string, email: string, password: string) => {
        await api.post('/register', { name, email, password })
        // após registro, redireciona para login
        navigate('/login')
    }

    const logout = () => {
        localStorage.removeItem('token')
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

export default AuthProvider
