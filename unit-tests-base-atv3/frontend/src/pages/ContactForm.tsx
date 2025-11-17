import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export function ContactForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { state } = useLocation(); // Recebe os dados vindos da lista

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Se temos um ID e um State, preenchemos o formulário (Modo Edição)
        if (id && state) {
            setName(state.name);
            setPhone(state.phone);
        }
    }, [id, state]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const contactData = { name, phone };

        try {
            if (id) {
                // Edição: PUT /contacts/:id
                await api.put(`/contacts/${id}`, contactData);
            } else {
                // Criação: POST /contacts
                await api.post('/contacts', contactData);
            }
            navigate('/contacts');
        } catch (error: any) {
            // Tenta pegar a mensagem de erro do backend (validação do validateBody)
            const msg = error.response?.data?.error || 'Erro ao salvar contato.';
            alert(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <h2>{id ? 'Editar Contato' : 'Novo Contato'}</h2>

            <form onSubmit={handleSubmit} style={{ maxWidth: '400px', marginTop: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome:</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        minLength={2}
                        placeholder="Ex: Maria Silva"
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Telefone:</label>
                    <input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                        placeholder="(99) 99999-9999"
                        pattern="^(\(\d{2}\)|\d{2})\d{4,5}-?\d{4}$" // Regex igual ao do backend para feedback visual
                        title="Formato: (99) 99999-9999"
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/contacts')}
                        style={{ background: '#ccc', color: '#333' }}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}