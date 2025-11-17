import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        try {
            // Ajuste a rota '/login' conforme definido no seu users.routes.ts
            const response = await api.post('/login', { email, password });

            // Salva o token para usar nas rotas privadas
            localStorage.setItem('token', response.data.token);
            navigate('/contacts');
        } catch (error) {
            alert('Erro ao fazer login');
        }
    }

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
}