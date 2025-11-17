import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        try {
            await api.post('/register', { name, email, password });
            alert('Registro realizado com sucesso. Faça login.');
            navigate('/login');
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Erro ao registrar';
            alert(msg);
        }
    }

    return (
        <div>
            <h1>Registrar</h1>
            <form onSubmit={handleRegister}>
                <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required />
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit">Registrar</button>
            </form>
        </div>
    );
}
