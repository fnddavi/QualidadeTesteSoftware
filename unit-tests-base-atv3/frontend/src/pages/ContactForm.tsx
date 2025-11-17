import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export function ContactForm() {
    const navigate = useNavigate();
    const { id } = useParams(); // Se tiver ID, é edição
    const { state } = useLocation(); // Recebe os dados vindos da lista

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (id && state) {
            setName(state.name);
            setPhone(state.phone);
        }
    }, [id, state]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (id) {
                // Edição: PUT /contacts/:id
                await api.put(`/contacts/${id}`, { name, phone });
            } else {
                // Criação: POST /contacts
                await api.post('/contacts', { name, phone });
            }
            navigate('/contacts');
        } catch (error) {
            alert('Erro ao salvar contato. Verifique os dados (Nome min 2 chars, Telefone formato correto).');
        }
    }

    return (
        <div>
            <h1>{id ? 'Editar Contato' : 'Novo Contato'}</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome (mín. 2 letras):</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        minLength={2}
                    />
                </div>
                <div>
                    <label>Telefone (Ex: (11)99999-9999):</label>
                    <input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                        placeholder="(99)99999-9999"
                    />
                </div>
                <button type="submit">Salvar</button>
                <button type="button" onClick={() => navigate('/contacts')}>Cancelar</button>
            </form>
        </div>
    );
}