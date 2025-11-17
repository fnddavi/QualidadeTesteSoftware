import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Seu hook criado

export function PrivateRoute() {
    const { isAuthenticated, loading } = useAuth(); // Assumindo que seu hook retorna isso

    if (loading) {
        return <div>Carregando...</div>;
    }

    // Se não estiver autenticado, manda para o login
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}