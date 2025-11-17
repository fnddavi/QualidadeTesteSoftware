import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    // adapta nomes esperados por outros componentes (signOut, loading)
    return {
        ...ctx,
        signOut: ctx.logout,
        loading: false,
    }
}

export default useAuth
